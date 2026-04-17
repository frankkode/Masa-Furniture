const router      = require('express').Router();
const db          = require('../db/database');
const requireAuth = require('../middleware/auth');
const { send, orderConfirmationHtml, ADMIN_EMAIL } = require('../services/mailer');

router.use(requireAuth);

/* helper — read shipping settings from DB */
function getShippingSettings() {
  const fee  = db.prepare(`SELECT value FROM settings WHERE key='shipping_fee'`).get();
  const free = db.prepare(`SELECT value FROM settings WHERE key='free_shipping_threshold'`).get();
  return {
    fee:       parseFloat(fee?.value  || 9.90),
    threshold: parseFloat(free?.value || 100),
  };
}

// GET /api/orders/shipping-cost — let frontend preview shipping cost (must come before /:id)
router.get('/shipping-cost', (req, res) => {
  const settings = getShippingSettings();
  res.json(settings);
});

// GET /api/orders  — list user's orders
router.get('/', (req, res) => {
  const orders = db.prepare(`
    SELECT o.*, COUNT(oi.id) AS item_count
    FROM "order" o
    LEFT JOIN order_item oi ON oi.order_id = o.id
    WHERE o.user_id = ?
    GROUP BY o.id
    ORDER BY o.created_at DESC
  `).all(req.user.id);
  res.json(orders);
});

// GET /api/orders/:id — includes color/size per item
router.get('/:id', (req, res) => {
  const order = db.prepare('SELECT * FROM "order" WHERE id = ? AND user_id = ?')
    .get(req.params.id, req.user.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });

  const items = db.prepare(`
    SELECT oi.*, p.name, p.slug, p.color AS product_color, p.material,
           pi.image_url, oi.color AS selected_color, oi.size AS selected_size
    FROM order_item oi
    JOIN product p ON p.id = oi.product_id
    LEFT JOIN product_image pi ON pi.product_id = p.id AND pi.is_primary = 1
    WHERE oi.order_id = ?
  `).all(order.id);

  const payment = db.prepare('SELECT * FROM payment WHERE order_id = ?').get(order.id);
  res.json({ ...order, items, payment });
});

// POST /api/orders  — create order from cart
router.post('/', async (req, res) => {
  const { shipping_address, coupon_code, notes, items_meta = [] } = req.body;
  // items_meta: [{ product_id, color, size }]  — optional per-item selections from checkout

  if (!shipping_address) return res.status(400).json({ error: 'Shipping address is required' });

  // get cart items
  const cart = db.prepare('SELECT * FROM cart WHERE user_id = ?').get(req.user.id);
  if (!cart) return res.status(400).json({ error: 'Cart is empty' });

  const cartItems = db.prepare(`
    SELECT ci.quantity, p.id AS product_id, p.price, p.sale_price, p.stock, p.name, p.color AS product_color
    FROM cart_item ci JOIN product p ON p.id = ci.product_id
    WHERE ci.cart_id = ?
  `).all(cart.id);

  if (!cartItems.length) return res.status(400).json({ error: 'Cart is empty' });

  // stock check
  for (const item of cartItems) {
    if (item.stock < item.quantity) {
      return res.status(400).json({ error: `Not enough stock for ${item.name}` });
    }
  }

  // build a lookup for per-item selections from the frontend
  const metaMap = {};
  for (const m of items_meta) metaMap[m.product_id] = m;

  // save address
  const addr = db.prepare(`
    INSERT INTO address (user_id, full_name, phone, street, city, state, country, postal_code)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(req.user.id,
    shipping_address.full_name, shipping_address.phone || null,
    shipping_address.street,    shipping_address.city,
    shipping_address.state || null, shipping_address.country || 'Finland',
    shipping_address.postal_code || null
  );

  // calculate totals with DB-driven shipping settings
  const { fee: shippingFee, threshold } = getShippingSettings();
  let subtotal = cartItems.reduce((s, i) => s + (i.sale_price || i.price) * i.quantity, 0);
  let discount = 0;

  if (coupon_code) {
    const coupon = db.prepare('SELECT * FROM coupon WHERE code = ? AND is_active = 1').get(coupon_code);
    if (coupon && (!coupon.expires_at || new Date(coupon.expires_at) > new Date())) {
      if (subtotal >= coupon.min_order_value) {
        discount = coupon.discount_type === 'percentage'
          ? subtotal * (coupon.discount_value / 100)
          : coupon.discount_value;
        db.prepare('UPDATE coupon SET used_count = used_count + 1 WHERE id = ?').run(coupon.id);
      }
    }
  }

  const shippingCost = subtotal >= threshold ? 0 : shippingFee;
  const total        = subtotal - discount + shippingCost;

  // create order
  const orderResult = db.prepare(`
    INSERT INTO "order" (user_id, status, subtotal, shipping_cost, discount_amount, total_price, shipping_address_id, notes)
    VALUES (?, 'pending', ?, ?, ?, ?, ?, ?)
  `).run(req.user.id, subtotal, shippingCost, discount, total, addr.lastInsertRowid, notes || null);

  const orderId = orderResult.lastInsertRowid;

  // insert order items with color/size + reduce stock
  const insertItem = db.prepare(
    'INSERT INTO order_item (order_id, product_id, quantity, unit_price, color, size) VALUES (?, ?, ?, ?, ?, ?)'
  );
  const reduceStock = db.prepare('UPDATE product SET stock = stock - ? WHERE id = ?');

  const savedItems = [];
  db.exec('BEGIN');
  try {
    for (const item of cartItems) {
      const meta  = metaMap[item.product_id] || {};
      const color = meta.color || item.product_color || null;
      const size  = meta.size  || null;
      insertItem.run(orderId, item.product_id, item.quantity, item.sale_price || item.price, color, size);
      reduceStock.run(item.quantity, item.product_id);
      savedItems.push({ ...item, color, size });
    }
    db.exec('COMMIT');
  } catch (e) {
    db.exec('ROLLBACK');
    throw e;
  }

  // clear cart
  db.prepare('DELETE FROM cart_item WHERE cart_id = ?').run(cart.id);

  // fetch the created order for notifications
  const createdOrder = db.prepare('SELECT * FROM "order" WHERE id = ?').get(orderId);
  const user         = db.prepare('SELECT * FROM user WHERE id = ?').get(req.user.id);

  // In-app notification for customer
  db.prepare(`INSERT INTO notification (user_id, title, message, type, link) VALUES (?, ?, ?, ?, ?)`)
    .run(req.user.id,
      'Order placed!',
      `Your order #${String(orderId).padStart(5,'0')} has been received. Total: €${total.toFixed(2)}`,
      'success',
      '/dashboard/orders');

  // In-app notification for every admin/staff
  const staffUsers = db.prepare('SELECT id FROM user WHERE is_staff = 1').all();
  for (const s of staffUsers) {
    db.prepare(`INSERT INTO notification (user_id, title, message, type, link) VALUES (?, ?, ?, ?, ?)`)
      .run(s.id,
        'New order received',
        `${user?.username || 'A customer'} placed order #${String(orderId).padStart(5,'0')} — €${total.toFixed(2)}`,
        'info',
        '/dashboard/admin');
  }

  // Order confirmation email to customer
  if (user?.email) {
    send({
      to:      user.email,
      subject: `Order confirmed — #${String(orderId).padStart(5,'0')}`,
      html:    orderConfirmationHtml(createdOrder, savedItems),
      text:    `Your order #${String(orderId).padStart(5,'0')} has been confirmed. Total: €${total.toFixed(2)}`,
    });
  }

  // Alert email to admin
  send({
    to:      ADMIN_EMAIL,
    subject: `[New Order] #${String(orderId).padStart(5,'0')} — €${total.toFixed(2)}`,
    html:    `<p><strong>${user?.username}</strong> (${user?.email}) placed a new order worth <strong>€${total.toFixed(2)}</strong>.</p>
              <p>Items: ${savedItems.map(i => `${i.name}${i.color?` (${i.color})`:''} x${i.quantity}`).join(', ')}</p>`,
    text:    `New order #${String(orderId).padStart(5,'0')} from ${user?.username} — €${total.toFixed(2)}`,
  });

  res.status(201).json({ order_id: orderId, total, status: 'pending' });
});

module.exports = router;
