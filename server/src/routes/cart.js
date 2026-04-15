const router     = require('express').Router();
const db         = require('../db/database');
const requireAuth = require('../middleware/auth');

// resolve or create cart for the current user/session
function getOrCreateCart(userId, sessionKey) {
  let cart;
  if (userId) {
    cart = db.prepare('SELECT * FROM cart WHERE user_id = ?').get(userId);
    if (!cart) {
      const r = db.prepare('INSERT INTO cart (user_id) VALUES (?)').run(userId);
      cart = db.prepare('SELECT * FROM cart WHERE id = ?').get(r.lastInsertRowid);
    }
  } else {
    cart = db.prepare('SELECT * FROM cart WHERE session_key = ?').get(sessionKey);
    if (!cart) {
      const r = db.prepare('INSERT INTO cart (session_key) VALUES (?)').run(sessionKey);
      cart = db.prepare('SELECT * FROM cart WHERE id = ?').get(r.lastInsertRowid);
    }
  }
  return cart;
}

function getCartItems(cartId) {
  return db.prepare(`
    SELECT ci.id, ci.quantity, ci.added_at,
           p.id AS product_id, p.name, p.price, p.sale_price, p.stock, p.sku,
           pi.image_url
    FROM cart_item ci
    JOIN product p ON p.id = ci.product_id
    LEFT JOIN product_image pi ON pi.product_id = p.id AND pi.is_primary = 1
    WHERE ci.cart_id = ?
  `).all(cartId);
}

// GET /api/cart
router.get('/', (req, res) => {
  const userId = req.headers.authorization ? (() => {
    try {
      const jwt = require('jsonwebtoken');
      const token = req.headers.authorization.split(' ')[1];
      return jwt.verify(token, process.env.JWT_SECRET).id;
    } catch { return null; }
  })() : null;

  const sessionKey = req.headers['x-session-key'] || 'guest';
  const cart = getOrCreateCart(userId, sessionKey);
  const items = getCartItems(cart.id);
  res.json({ cart_id: cart.id, items });
});

// POST /api/cart  — add item
router.post('/', (req, res) => {
  const { product_id, quantity = 1 } = req.body;
  if (!product_id) return res.status(400).json({ error: 'product_id is required' });

  const product = db.prepare('SELECT * FROM product WHERE id = ? AND is_active = 1').get(product_id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  if (product.stock < 1) return res.status(400).json({ error: 'Out of stock' });

  const userId = req.headers.authorization ? (() => {
    try {
      const jwt = require('jsonwebtoken');
      const token = req.headers.authorization.split(' ')[1];
      return jwt.verify(token, process.env.JWT_SECRET).id;
    } catch { return null; }
  })() : null;

  const sessionKey = req.headers['x-session-key'] || 'guest';
  const cart = getOrCreateCart(userId, sessionKey);

  const existing = db.prepare('SELECT * FROM cart_item WHERE cart_id = ? AND product_id = ?').get(cart.id, product_id);
  if (existing) {
    db.prepare('UPDATE cart_item SET quantity = quantity + ? WHERE id = ?').run(quantity, existing.id);
  } else {
    db.prepare('INSERT INTO cart_item (cart_id, product_id, quantity) VALUES (?, ?, ?)').run(cart.id, product_id, quantity);
  }

  const items = getCartItems(cart.id);
  res.json({ cart_id: cart.id, items, cart_count: items.reduce((s, i) => s + i.quantity, 0) });
});

// PATCH /api/cart/:itemId  — update quantity
router.patch('/:itemId', (req, res) => {
  const { quantity } = req.body;
  if (!quantity || quantity < 1) return res.status(400).json({ error: 'Invalid quantity' });

  db.prepare('UPDATE cart_item SET quantity = ? WHERE id = ?').run(quantity, req.params.itemId);
  res.json({ message: 'Updated' });
});

// DELETE /api/cart/:itemId  — remove item
router.delete('/:itemId', (req, res) => {
  db.prepare('DELETE FROM cart_item WHERE id = ?').run(req.params.itemId);
  res.json({ message: 'Removed' });
});

// DELETE /api/cart  — clear entire cart (used after order placed)
router.delete('/', requireAuth, (req, res) => {
  const cart = db.prepare('SELECT id FROM cart WHERE user_id = ?').get(req.user.id);
  if (cart) db.prepare('DELETE FROM cart_item WHERE cart_id = ?').run(cart.id);
  res.json({ message: 'Cart cleared' });
});

module.exports = router;
