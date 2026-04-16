const router      = require('express').Router();
const db          = require('../db/database');
const jwt         = require('jsonwebtoken');
const requireAuth = require('../middleware/auth');

/* ── extract userId from Bearer token (optional auth) ─────────── */
function extractUserId(req) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return null;
  try {
    return jwt.verify(header.split(' ')[1], process.env.JWT_SECRET).id;
  } catch { return null; }
}

/* ── resolve or create a cart row ─────────────────────────────── */
function getOrCreateCart(userId, sessionKey) {
  if (userId) {
    let cart = db.prepare('SELECT * FROM cart WHERE user_id = ?').get(userId);
    if (!cart) {
      const r = db.prepare('INSERT INTO cart (user_id) VALUES (?)').run(userId);
      cart = db.prepare('SELECT * FROM cart WHERE id = ?').get(r.lastInsertRowid);
    }
    return cart;
  }
  let cart = db.prepare('SELECT * FROM cart WHERE session_key = ?').get(sessionKey);
  if (!cart) {
    const r = db.prepare('INSERT INTO cart (session_key) VALUES (?)').run(sessionKey);
    cart = db.prepare('SELECT * FROM cart WHERE id = ?').get(r.lastInsertRowid);
  }
  return cart;
}

/* ── get full cart items ───────────────────────────────────────── */
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

/* ── merge guest cart → user cart ─────────────────────────────── */
function mergeGuestCart(sessionKey, userCartId) {
  const guestCart = db.prepare(
    'SELECT * FROM cart WHERE session_key = ? AND user_id IS NULL'
  ).get(sessionKey);
  if (!guestCart) return;

  const guestItems = getCartItems(guestCart.id);
  for (const item of guestItems) {
    const existing = db.prepare(
      'SELECT * FROM cart_item WHERE cart_id = ? AND product_id = ?'
    ).get(userCartId, item.product_id);

    if (existing) {
      db.prepare('UPDATE cart_item SET quantity = quantity + ? WHERE id = ?')
        .run(item.quantity, existing.id);
    } else {
      db.prepare('INSERT INTO cart_item (cart_id, product_id, quantity) VALUES (?, ?, ?)')
        .run(userCartId, item.product_id, item.quantity);
    }
  }

  // remove the guest cart after merging
  db.prepare('DELETE FROM cart_item WHERE cart_id = ?').run(guestCart.id);
  db.prepare('DELETE FROM cart WHERE id = ?').run(guestCart.id);
}

/* ════════════════════════════════════════════════════════════════
   GET /api/cart
   Works for both guests (session_key) and logged-in users.
   On login: automatically merges any guest cart into user cart.
════════════════════════════════════════════════════════════════ */
router.get('/', (req, res) => {
  const userId     = extractUserId(req);
  const sessionKey = req.headers['x-session-key'] || 'guest';

  const cart = getOrCreateCart(userId, sessionKey);

  // merge guest cart into user cart on first authenticated request
  if (userId && sessionKey !== 'guest') {
    mergeGuestCart(sessionKey, cart.id);
  }

  const items = getCartItems(cart.id);
  res.json({ cart_id: cart.id, items });
});

/* ════════════════════════════════════════════════════════════════
   POST /api/cart  — add / increment item
════════════════════════════════════════════════════════════════ */
router.post('/', (req, res) => {
  const { product_id, quantity = 1 } = req.body;
  if (!product_id) return res.status(400).json({ error: 'product_id is required' });

  const product = db.prepare('SELECT * FROM product WHERE id = ? AND is_active = 1').get(product_id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  if (product.stock < 1) return res.status(400).json({ error: 'Out of stock' });

  const userId     = extractUserId(req);
  const sessionKey = req.headers['x-session-key'] || 'guest';

  const cart = getOrCreateCart(userId, sessionKey);

  // merge any lingering guest cart when user is authenticated
  if (userId && sessionKey !== 'guest') {
    mergeGuestCart(sessionKey, cart.id);
  }

  const existing = db.prepare(
    'SELECT * FROM cart_item WHERE cart_id = ? AND product_id = ?'
  ).get(cart.id, product_id);

  if (existing) {
    db.prepare('UPDATE cart_item SET quantity = quantity + ? WHERE id = ?')
      .run(quantity, existing.id);
  } else {
    db.prepare('INSERT INTO cart_item (cart_id, product_id, quantity) VALUES (?, ?, ?)')
      .run(cart.id, product_id, quantity);
  }

  const items = getCartItems(cart.id);
  res.json({ cart_id: cart.id, items, cart_count: items.reduce((s, i) => s + i.quantity, 0) });
});

/* ════════════════════════════════════════════════════════════════
   PATCH /api/cart/:itemId  — update quantity
════════════════════════════════════════════════════════════════ */
router.patch('/:itemId', (req, res) => {
  const { quantity } = req.body;
  if (!quantity || quantity < 1) return res.status(400).json({ error: 'Invalid quantity' });
  db.prepare('UPDATE cart_item SET quantity = ? WHERE id = ?').run(quantity, req.params.itemId);
  res.json({ message: 'Updated' });
});

/* ════════════════════════════════════════════════════════════════
   DELETE /api/cart/:itemId  — remove one item
════════════════════════════════════════════════════════════════ */
router.delete('/:itemId', (req, res) => {
  db.prepare('DELETE FROM cart_item WHERE id = ?').run(req.params.itemId);
  res.json({ message: 'Removed' });
});

/* ════════════════════════════════════════════════════════════════
   DELETE /api/cart  — clear entire cart after order placed
════════════════════════════════════════════════════════════════ */
router.delete('/', requireAuth, (req, res) => {
  const cart = db.prepare('SELECT id FROM cart WHERE user_id = ?').get(req.user.id);
  if (cart) db.prepare('DELETE FROM cart_item WHERE cart_id = ?').run(cart.id);
  res.json({ message: 'Cart cleared' });
});

module.exports = router;
