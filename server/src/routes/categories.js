const router = require('express').Router();
const db     = require('../db/database');

// GET /api/categories
router.get('/', (req, res) => {
  const rows = db.prepare(`
    SELECT c.*, COUNT(p.id) AS product_count
    FROM category c
    LEFT JOIN product p ON p.category_id = c.id AND p.is_active = 1
    WHERE c.is_active = 1
    GROUP BY c.id
    ORDER BY c.sort_order ASC
  `).all();
  res.json(rows);
});

// GET /api/categories/:slug
router.get('/:slug', (req, res) => {
  const cat = db.prepare('SELECT * FROM category WHERE slug = ? AND is_active = 1').get(req.params.slug);
  if (!cat) return res.status(404).json({ error: 'Category not found' });
  res.json(cat);
});

module.exports = router;
