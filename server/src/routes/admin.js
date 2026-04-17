const router      = require('express').Router();
const db          = require('../db/database');
const requireAuth = require('../middleware/auth');

/* ── admin-only guard ─────────────────────────────────────── */
function requireAdmin(req, res, next) {
  if (!req.user || !req.user.is_staff) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

router.use(requireAuth);
router.use(requireAdmin);

/* ── GET /api/admin/stats ─────────────────────────────────── */
router.get('/stats', (req, res) => {
  const totalOrders   = db.prepare('SELECT COUNT(*) AS n FROM "order"').get().n;
  const totalRevenue  = db.prepare('SELECT COALESCE(SUM(total_price),0) AS n FROM "order" WHERE status != ?').get('cancelled').n;
  const totalProducts = db.prepare('SELECT COUNT(*) AS n FROM product WHERE is_active = 1').get().n;
  const totalUsers    = db.prepare('SELECT COUNT(*) AS n FROM user WHERE is_active = 1').get().n;
  const pendingOrders = db.prepare('SELECT COUNT(*) AS n FROM "order" WHERE status = ?').get('pending').n;

  res.json({ totalOrders, totalRevenue, totalProducts, totalUsers, pendingOrders });
});

/* ── GET /api/admin/orders ────────────────────────────────── */
router.get('/orders', (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  let where = [];
  const params = [];
  if (status) { where.push('o.status = ?'); params.push(status); }
  const whereClause = where.length ? 'WHERE ' + where.join(' AND ') : '';

  const orders = db.prepare(`
    SELECT o.*, u.username, u.email,
           COUNT(oi.id) AS item_count
    FROM "order" o
    JOIN user u ON u.id = o.user_id
    LEFT JOIN order_item oi ON oi.order_id = o.id
    ${whereClause}
    GROUP BY o.id
    ORDER BY o.created_at DESC
    LIMIT ? OFFSET ?
  `).all(...params, parseInt(limit), offset);

  const { total } = db.prepare(`
    SELECT COUNT(*) AS total FROM "order" o ${whereClause}
  `).get(...params);

  res.json({ orders, total, page: parseInt(page), limit: parseInt(limit) });
});

/* ── GET /api/admin/orders/:id ────────────────────────────── */
router.get('/orders/:id', (req, res) => {
  const order = db.prepare(`
    SELECT o.*, u.username, u.email
    FROM "order" o JOIN user u ON u.id = o.user_id
    WHERE o.id = ?
  `).get(req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });

  const items = db.prepare(`
    SELECT oi.*, p.name, p.slug, pi.image_url
    FROM order_item oi
    JOIN product p ON p.id = oi.product_id
    LEFT JOIN product_image pi ON pi.product_id = p.id AND pi.is_primary = 1
    WHERE oi.order_id = ?
  `).all(order.id);

  res.json({ ...order, items });
});

/* ── PATCH /api/admin/orders/:id/status ──────────────────── */
const VALID_STATUSES = ['pending','confirmed','processing','shipped','delivered','cancelled'];

router.patch('/orders/:id/status', (req, res) => {
  const { status } = req.body;
  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: 'Invalid status', valid: VALID_STATUSES });
  }
  const result = db.prepare('UPDATE "order" SET status = ? WHERE id = ?').run(status, req.params.id);
  if (!result.changes) return res.status(404).json({ error: 'Order not found' });
  res.json({ ok: true, status });
});

/* ── GET /api/admin/categories (for product form dropdown) ─── */
router.get('/categories', (req, res) => {
  const categories = db.prepare('SELECT * FROM category ORDER BY name').all();
  res.json({ categories });
});

/* ── GET /api/admin/products ──────────────────────────────── */
router.get('/products', (req, res) => {
  const { search, page = 1, limit = 20 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  const whereParts = [];
  const params     = [];
  if (search) {
    whereParts.push('(p.name LIKE ? OR p.sku LIKE ? OR c.name LIKE ?)');
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }
  const where = whereParts.length ? 'WHERE ' + whereParts.join(' AND ') : '';

  const products = db.prepare(`
    SELECT p.*,
           c.name AS category_name,
           (SELECT image_url FROM product_image
            WHERE product_id = p.id AND is_primary = 1 LIMIT 1) AS image_url
    FROM product p
    LEFT JOIN category c ON c.id = p.category_id
    ${where}
    ORDER BY p.created_at DESC
    LIMIT ? OFFSET ?
  `).all(...params, parseInt(limit), offset);

  const { total } = db.prepare(
    `SELECT COUNT(*) AS total FROM product p LEFT JOIN category c ON c.id = p.category_id ${where}`
  ).get(...params);

  res.json({ products, total, page: parseInt(page), limit: parseInt(limit) });
});

/* ── POST /api/admin/products ─────────────────────────────── */
router.post('/products', (req, res) => {
  const {
    name, slug, sku, category_id, price, sale_price,
    description, stock = 0, material, dimensions, color, weight,
    is_active = 1, is_featured = 0, image_url,
  } = req.body;

  if (!name || !sku || !category_id || price == null) {
    return res.status(400).json({ error: 'name, sku, category_id and price are required' });
  }

  const finalSlug = slug
    ? slug
    : name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  try {
    const result = db.prepare(`
      INSERT INTO product
        (category_id, name, slug, sku, description, price, sale_price,
         stock, material, dimensions, color, weight, is_active, is_featured)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `).run(
      category_id, name, finalSlug, sku,
      description || null, price, sale_price || null,
      stock, material || null, dimensions || null, color || null, weight || null,
      is_active ? 1 : 0, is_featured ? 1 : 0,
    );

    if (image_url) {
      db.prepare(
        'INSERT INTO product_image (product_id, image_url, is_primary, sort_order) VALUES (?,?,1,0)'
      ).run(result.lastInsertRowid, image_url);
    }

    const product = db.prepare('SELECT * FROM product WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ product });
  } catch (e) {
    if (e.message?.includes('UNIQUE')) {
      return res.status(409).json({ error: 'A product with that SKU or slug already exists' });
    }
    throw e;
  }
});

/* ── PATCH /api/admin/products/:id ───────────────────────── */
router.patch('/products/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM product WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Product not found' });

  const editable = [
    'name','slug','sku','category_id','price','sale_price',
    'description','stock','material','dimensions','color','weight',
    'is_active','is_featured',
  ];
  const sets   = [];
  const params = [];
  for (const f of editable) {
    if (req.body[f] !== undefined) { sets.push(`${f} = ?`); params.push(req.body[f]); }
  }

  if (sets.length) {
    sets.push(`updated_at = datetime('now')`);
    params.push(req.params.id);
    try {
      db.prepare(`UPDATE product SET ${sets.join(', ')} WHERE id = ?`).run(...params);
    } catch (e) {
      if (e.message?.includes('UNIQUE')) {
        return res.status(409).json({ error: 'A product with that SKU or slug already exists' });
      }
      throw e;
    }
  }

  // update primary image if provided
  if (req.body.image_url !== undefined) {
    const img = db.prepare(
      'SELECT id FROM product_image WHERE product_id = ? AND is_primary = 1'
    ).get(req.params.id);
    if (req.body.image_url) {
      if (img) db.prepare('UPDATE product_image SET image_url = ? WHERE id = ?').run(req.body.image_url, img.id);
      else db.prepare('INSERT INTO product_image (product_id, image_url, is_primary, sort_order) VALUES (?,?,1,0)').run(req.params.id, req.body.image_url);
    } else if (img) {
      db.prepare('DELETE FROM product_image WHERE id = ?').run(img.id);
    }
  }

  const updated = db.prepare('SELECT * FROM product WHERE id = ?').get(req.params.id);
  res.json({ product: updated });
});

/* ── DELETE /api/admin/products/:id ──────────────────────── */
router.delete('/products/:id', (req, res) => {
  const result = db.prepare('DELETE FROM product WHERE id = ?').run(req.params.id);
  if (!result.changes) return res.status(404).json({ error: 'Product not found' });
  res.json({ ok: true });
});

module.exports = router;
