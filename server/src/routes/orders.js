const router      = require('express').Router();
const db          = require('../db/database');
const requireAuth = require('../middleware/auth');

router.use(requireAuth);

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

// GET /api/orders/:id
router.get('/:id', (req, res) => {
  const order = db.prepare('SELECT * FROM "order" WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });

  const items = db.prepare(`
    SELECT oi.*, p.name, p.slug, pi.image_url
    FROM order_item oi
    JOIN product p ON p.id = oi.product_id
    LEFT JOIN product_image pi ON pi.product_id = p.id AND pi.is_primary = 1
    WHERE oi.order_id = ?
  `).all(order.id);

  const payment = db.prepare('SELECT * FROM payment WHERE order_id = ?').get(order.id);
  res.json({ ...order, items, payment });
});

// POST /api/orders  — create order from cart
router.post('/', (req, res) => {
  const { shipping_address, coupon_code, notes } = req.body;
  if (!shipping_address) return res.status(400).json({ error: 'Shipping address is required' });

  // get cart items
  const cart = db.prepare('SELECT * FROM cart WHERE user_id = ?').get(req.user.id);
  if (!cart) return res.status(400).json({ error: 'Cart is empty' });

  const cartItems = db.prepare(`
    SELECT ci.quantity, p.id AS product_id, p.price, p.sale_price, p.stock, p.name
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

  // save address
  const addr = db.prepare(`
    INSERT INTO address (user_id, full_name, phone, street, city, state, country, postal_code)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(req.user.id,
    shipping_address.full_name, shipping_address.phone || null,
    shipping_address.street, shipping_address.city,
    shipping_address.state || null, shipping_address.country || 'Rwanda',
    shipping_address.postal_code || null
  );

  // calculate totals
  let subtotal = cartItems.reduce((s, i) => s + (i.sale_price || i.price) * i.quantity, 0);
  let discount = 0;

  if (coupon_code) {
    const coupon = db.prepare('SELECT * FROM coupon WHERE code = ? AND is_active = 1').get(coupon_code);
    if (coupon) {
      if (!coupon.expires_at || new Date(coupon.expires_at) > new Date()) {
        if (subtotal >= coupon.min_order_value) {
          discount = coupon.discount_type === 'percentage'
            ? subtotal * (coupon.discount_value / 100)
            : coupon.discount_value;
          db.prepare('UPDATE coupon SET used_count = used_count + 1 WHERE id = ?').run(coupon.id);
        }
      }
    }
  }

  const shippingCost = subtotal > 500 ? 0 : 25;
  const total = subtotal - discount + shippingCost;

  // create order
  const orderResult = db.prepare(`
    INSERT INTO "order" (user_id, status, subtotal, shipping_cost, discount_amount, total_price, shipping_address_id, notes)
    VALUES (?, 'pending', ?, ?, ?, ?, ?, ?)
  `).run(req.user.id, subtotal, shippingCost, discount, total, addr.lastInsertRowid, notes || null);

  const orderId = orderResult.lastInsertRowid;

  // insert order items and reduce stock
  const insertItem = db.prepare(
    'INSERT INTO order_item (order_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)'
  );
  const reduceStock = db.prepare('UPDATE product SET stock = stock - ? WHERE id = ?');

  db.exec('BEGIN');
  try {
    for (const item of cartItems) {
      insertItem.run(orderId, item.product_id, item.quantity, item.sale_price || item.price);
      reduceStock.run(item.quantity, item.product_id);
    }
    db.exec('COMMIT');
  } catch (e) {
    db.exec('ROLLBACK');
    throw e;
  }

  // clear cart
  db.prepare('DELETE FROM cart_item WHERE cart_id = ?').run(cart.id);

  res.status(201).json({ order_id: orderId, total, status: 'pending' });
});

module.exports = router;
