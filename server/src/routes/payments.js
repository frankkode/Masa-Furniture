const router      = require('express').Router();
const stripe      = require('stripe')(process.env.STRIPE_SECRET_KEY);
const db          = require('../db/database');
const requireAuth = require('../middleware/auth');

// POST /api/payments/create-intent  — create Stripe PaymentIntent
router.post('/create-intent', requireAuth, async (req, res) => {
  const { order_id } = req.body;
  if (!order_id) return res.status(400).json({ error: 'order_id is required' });

  const order = db.prepare('SELECT * FROM "order" WHERE id = ? AND user_id = ?').get(order_id, req.user.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  if (order.status !== 'pending') return res.status(400).json({ error: 'Order already processed' });

  try {
    const intent = await stripe.paymentIntents.create({
      amount: Math.round(order.total_price * 100), // cents
      currency: 'usd',
      metadata: { order_id: String(order_id), user_id: String(req.user.id) },
    });

    // save payment record
    db.prepare(`
      INSERT OR REPLACE INTO payment (order_id, amount, status, transaction_id)
      VALUES (?, ?, 'pending', ?)
    `).run(order_id, order.total_price, intent.id);

    res.json({ client_secret: intent.client_secret });
  } catch (err) {
    console.error('Stripe error:', err.message);
    res.status(500).json({ error: 'Payment service error' });
  }
});

// POST /api/payments/webhook  — Stripe webhook (no auth middleware)
// LOCAL DEV: run  stripe listen --forward-to localhost:5000/api/payments/webhook
// then copy the whsec_... secret it prints and put it in server/.env as STRIPE_WEBHOOK_SECRET
router.post('/webhook', (req, res) => {
  const sig    = req.headers['stripe-signature'];
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  let event;

  // Skip signature verification when no real secret is configured (dev fallback)
  if (!secret || secret === 'whsec_placeholder') {
    try {
      event = JSON.parse(req.body);
    } catch {
      return res.status(400).json({ error: 'Invalid JSON body' });
    }
  } else {
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, secret);
    } catch (err) {
      return res.status(400).json({ error: `Webhook signature invalid: ${err.message}` });
    }
  }

  if (event.type === 'payment_intent.succeeded') {
    const intent = event.data.object;
    const orderId = intent.metadata?.order_id;
    if (orderId) {
      db.prepare('UPDATE "order" SET status = ? WHERE id = ?').run('confirmed', orderId);
      db.prepare('UPDATE payment SET status = ? WHERE transaction_id = ?').run('completed', intent.id);
    }
  }

  if (event.type === 'payment_intent.payment_failed') {
    const intent = event.data.object;
    const orderId = intent.metadata?.order_id;
    if (orderId) {
      db.prepare('UPDATE "order" SET status = ? WHERE id = ?').run('payment_failed', orderId);
      db.prepare('UPDATE payment SET status = ? WHERE transaction_id = ?').run('failed', intent.id);
    }
  }

  res.json({ received: true });
});

// POST /api/payments/confirm  — fallback: mark order confirmed after successful client payment
router.post('/confirm', requireAuth, async (req, res) => {
  const { order_id, payment_intent_id } = req.body;

  const order = db.prepare('SELECT * FROM "order" WHERE id = ? AND user_id = ?').get(order_id, req.user.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });

  db.prepare('UPDATE "order" SET status = ?, stripe_payment_id = ? WHERE id = ?')
    .run('confirmed', payment_intent_id, order_id);
  db.prepare('UPDATE payment SET status = ? WHERE order_id = ?').run('completed', order_id);

  res.json({ message: 'Order confirmed', order_id });
});

module.exports = router;
