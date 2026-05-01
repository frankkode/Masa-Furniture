const router     = require('express').Router();
const db         = require('../db/database');
const requireAuth = require('../middleware/auth');

// all wishlist routes require auth
router.use(requireAuth);

// GET /api/wishlist
router.get('/', (req, res) => {
  let wishlist = db.prepare('SELECT * FROM wishlist WHERE user_id = ?').get(req.user.id);
  if (!wishlist) {
    const r = db.prepare('INSERT INTO wishlist (user_id) VALUES (?)').run(req.user.id);
    wishlist = { id: r.lastInsertRowid };
  }

  const items = db.prepare(`
    SELECT wi.id, wi.added_at, p.id AS product_id, p.name, p.price, p.sale_price, pi.image_url
    FROM wishlist_item wi
    JOIN product p ON p.id = wi.product_id
    LEFT JOIN product_image pi ON pi.product_id = p.id AND pi.is_primary = 1
    WHERE wi.wishlist_id = ?
  `).all(wishlist.id);

  res.json({ wishlist_id: wishlist.id, items });
});

// POST /api/wishlist/:productId  — add product
router.post('/:productId', (req, res) => {
  let wishlist = db.prepare('SELECT * FROM wishlist WHERE user_id = ?').get(req.user.id);
  if (!wishlist) {
    const r = db.prepare('INSERT INTO wishlist (user_id) VALUES (?)').run(req.user.id);
    wishlist = { id: r.lastInsertRowid };
  }

  const existing = db.prepare(
    'SELECT id FROM wishlist_item WHERE wishlist_id = ? AND product_id = ?'
  ).get(wishlist.id, req.params.productId);

  if (existing) return res.status(409).json({ error: 'Already in wishlist' });

  db.prepare('INSERT INTO wishlist_item (wishlist_id, product_id) VALUES (?, ?)').run(wishlist.id, req.params.productId);
  res.status(201).json({ message: 'Added to wishlist' });
});

// DELETE /api/wishlist/:productId  — remove product
router.delete('/:productId', (req, res) => {
  const wishlist = db.prepare('SELECT id FROM wishlist WHERE user_id = ?').get(req.user.id);
  if (!wishlist) return res.status(404).json({ error: 'Wishlist not found' });

  db.prepare('DELETE FROM wishlist_item WHERE wishlist_id = ? AND product_id = ?').run(wishlist.id, req.params.productId);
  res.json({ message: 'Removed from wishlist' });
});

module.exports = router;
