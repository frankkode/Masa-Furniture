const router = require('express').Router();
const db     = require('../db/database');

// helper — attach primary image to each product
function withImage(product) {
  if (!product) return null;
  const img = db.prepare(
    'SELECT image_url FROM product_image WHERE product_id = ? AND is_primary = 1 LIMIT 1'
  ).get(product.id);
  return { ...product, image_url: img?.image_url || null };
}

function withImages(product) {
  if (!product) return null;
  const imgs = db.prepare(
    'SELECT image_url, alt_text, is_primary FROM product_image WHERE product_id = ? ORDER BY sort_order ASC'
  ).all(product.id);
  return { ...product, images: imgs };
}

// GET /api/products  — list with optional filters
router.get('/', (req, res) => {
  const { category, search, featured, sort = 'created_at', order = 'DESC', page = 1, limit = 12 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  let where = ['p.is_active = 1'];
  const params = [];

  if (category) {
    where.push('c.slug = ?');
    params.push(category);
  }
  if (search) {
    where.push('(p.name LIKE ? OR p.description LIKE ?)');
    params.push(`%${search}%`, `%${search}%`);
  }
  if (featured === 'true') {
    where.push('p.is_featured = 1');
  }

  const allowedSort = ['price', 'created_at', 'name'];
  const sortCol = allowedSort.includes(sort) ? sort : 'created_at';
  const sortDir = order === 'ASC' ? 'ASC' : 'DESC';

  const sql = `
    SELECT p.*, c.name AS category_name, c.slug AS category_slug
    FROM product p
    JOIN category c ON c.id = p.category_id
    WHERE ${where.join(' AND ')}
    ORDER BY p.${sortCol} ${sortDir}
    LIMIT ? OFFSET ?
  `;

  const countSql = `
    SELECT COUNT(*) AS total FROM product p
    JOIN category c ON c.id = p.category_id
    WHERE ${where.join(' AND ')}
  `;

  const products = db.prepare(sql).all(...params, parseInt(limit), offset).map(withImage);
  const { total } = db.prepare(countSql).get(...params);

  res.json({
    products,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / parseInt(limit)),
    },
  });
});

// GET /api/products/featured — quick endpoint for homepage
router.get('/featured', (req, res) => {
  const products = db.prepare(`
    SELECT p.*, c.name AS category_name
    FROM product p JOIN category c ON c.id = p.category_id
    WHERE p.is_featured = 1 AND p.is_active = 1
    ORDER BY p.created_at DESC LIMIT 8
  `).all().map(withImage);
  res.json(products);
});

// GET /api/products/:id
router.get('/:id', (req, res) => {
  const product = db.prepare(`
    SELECT p.*, c.name AS category_name, c.slug AS category_slug
    FROM product p JOIN category c ON c.id = p.category_id
    WHERE p.id = ? AND p.is_active = 1
  `).get(req.params.id);

  if (!product) return res.status(404).json({ error: 'Product not found' });

  const reviews = db.prepare(`
    SELECT r.*, u.username FROM review r
    JOIN user u ON u.id = r.user_id
    WHERE r.product_id = ? AND r.is_approved = 1
    ORDER BY r.created_at DESC
  `).all(product.id);

  const avgRating = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;

  res.json({ ...withImages(product), reviews, avg_rating: Math.round(avgRating * 10) / 10 });
});

// POST /api/products/:id/reviews  — requires auth
const requireAuth = require('../middleware/auth');
router.post('/:id/reviews', requireAuth, (req, res) => {
  const { rating, title, body } = req.body;
  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating must be between 1 and 5' });
  }

  const product = db.prepare('SELECT id FROM product WHERE id = ? AND is_active = 1').get(req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });

  // one review per user per product
  const existing = db.prepare(
    'SELECT id FROM review WHERE product_id = ? AND user_id = ?'
  ).get(req.params.id, req.user.id);
  if (existing) return res.status(409).json({ error: 'You already reviewed this product' });

  const result = db.prepare(
    'INSERT INTO review (product_id, user_id, rating, title, body) VALUES (?, ?, ?, ?, ?)'
  ).run(req.params.id, req.user.id, rating, title || null, body || null);

  res.status(201).json({ id: result.lastInsertRowid, message: 'Review submitted' });
});

module.exports = router;
