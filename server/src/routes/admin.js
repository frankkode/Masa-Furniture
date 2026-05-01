const router      = require('express').Router();
const db          = require('../db/database');
const requireAuth = require('../middleware/auth');
const { multerMiddleware, uploadImage } = require('../middleware/upload');
const { send, orderStatusHtml, ADMIN_EMAIL } = require('../services/mailer');

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

router.patch('/orders/:id/status', async (req, res) => {
  const { status } = req.body;
  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: 'Invalid status', valid: VALID_STATUSES });
  }
  const order = db.prepare('SELECT * FROM "order" WHERE id = ?').get(req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });

  db.prepare('UPDATE "order" SET status = ?, updated_at = datetime(\'now\') WHERE id = ?')
    .run(status, req.params.id);

  const updatedOrder = db.prepare('SELECT * FROM "order" WHERE id = ?').get(req.params.id);
  const user = db.prepare('SELECT * FROM user WHERE id = ?').get(order.user_id);

  const statusLabels = { pending:'Pending',confirmed:'Confirmed',processing:'Processing',shipped:'Shipped',delivered:'Delivered',cancelled:'Cancelled' };
  const label = statusLabels[status] || status;

  // In-app notification for user
  db.prepare(`INSERT INTO notification (user_id, title, message, type, link)
              VALUES (?, ?, ?, ?, ?)`)
    .run(order.user_id,
      `Order ${label}`,
      `Your order #${String(order.id).padStart(5,'0')} is now ${label.toLowerCase()}.`,
      status === 'cancelled' ? 'warning' : status === 'delivered' ? 'success' : 'info',
      `/dashboard/orders`);

  // Email notification for user
  if (user?.email) {
    send({
      to:      user.email,
      subject: `Order #${String(order.id).padStart(5,'0')} — ${label}`,
      html:    orderStatusHtml(updatedOrder),
      text:    `Your order #${String(order.id).padStart(5,'0')} is now: ${label}`,
    });
  }

  res.json({ ok: true, status });
});

/* ── GET /api/admin/shipping-settings ───────────────────── */
router.get('/shipping-settings', (req, res) => {
  const fee       = db.prepare(`SELECT value FROM settings WHERE key='shipping_fee'`).get();
  const threshold = db.prepare(`SELECT value FROM settings WHERE key='free_shipping_threshold'`).get();
  res.json({
    shipping_fee:            parseFloat(fee?.value       || 9.90),
    free_shipping_threshold: parseFloat(threshold?.value || 100),
  });
});

/* ── PATCH /api/admin/shipping-settings ─────────────────── */
router.patch('/shipping-settings', (req, res) => {
  const { shipping_fee, free_shipping_threshold } = req.body;
  if (shipping_fee !== undefined) {
    db.prepare(`INSERT INTO settings (key, value) VALUES ('shipping_fee',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value`)
      .run(String(parseFloat(shipping_fee)));
  }
  if (free_shipping_threshold !== undefined) {
    db.prepare(`INSERT INTO settings (key, value) VALUES ('free_shipping_threshold',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value`)
      .run(String(parseFloat(free_shipping_threshold)));
  }
  res.json({ ok: true });
});

/* ── POST /api/admin/upload ──────────────────────────────────
   Accepts multipart/form-data with field name "image".
   Returns { url } — local path in dev, Vercel Blob URL in prod.
   Max 5 MB, images only.
──────────────────────────────────────────────────────────── */
router.post('/upload', (req, res, next) => {
  multerMiddleware(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    uploadImage(req, res);
  });
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

/* ── helper: sync image array for a product (max 4) ──────── */
function syncImages(productId, images) {
  // images: [{url, alt_text, is_primary}]  first non-empty item is primary
  const valid = (Array.isArray(images) ? images : [])
    .filter(i => i && i.url)
    .slice(0, 4);

  db.prepare('DELETE FROM product_image WHERE product_id = ?').run(productId);

  const insert = db.prepare(
    'INSERT INTO product_image (product_id, image_url, alt_text, is_primary, sort_order) VALUES (?,?,?,?,?)'
  );
  valid.forEach((img, idx) => {
    insert.run(productId, img.url, img.alt_text || null, idx === 0 ? 1 : 0, idx);
  });
}

/* ── GET /api/admin/products/:id ─────────────────────────── */
router.get('/products/:id', (req, res) => {
  const product = db.prepare('SELECT * FROM product WHERE id = ?').get(req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  const images = db.prepare(
    'SELECT id, image_url, alt_text, is_primary, sort_order FROM product_image WHERE product_id = ? ORDER BY sort_order ASC'
  ).all(req.params.id);
  res.json({ product, images });
});

/* ── POST /api/admin/products ─────────────────────────────── */
router.post('/products', (req, res) => {
  const {
    name, slug, sku, category_id, price, sale_price,
    description, stock = 0, material, dimensions, color, weight,
    is_active = 1, is_featured = 0,
    // accept both legacy image_url and new images array
    image_url, images,
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

    const pid = result.lastInsertRowid;

    // prefer images array; fall back to legacy image_url
    if (Array.isArray(images) && images.length) {
      syncImages(pid, images);
    } else if (image_url) {
      db.prepare(
        'INSERT INTO product_image (product_id, image_url, is_primary, sort_order) VALUES (?,?,1,0)'
      ).run(pid, image_url);
    }

    const product = db.prepare('SELECT * FROM product WHERE id = ?').get(pid);
    const imgs    = db.prepare('SELECT * FROM product_image WHERE product_id = ? ORDER BY sort_order').all(pid);
    res.status(201).json({ product, images: imgs });
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

  // images[] takes priority; legacy image_url as fallback
  if (Array.isArray(req.body.images)) {
    syncImages(req.params.id, req.body.images);
  } else if (req.body.image_url !== undefined) {
    // legacy single-image update
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
  const imgs    = db.prepare('SELECT * FROM product_image WHERE product_id = ? ORDER BY sort_order').all(req.params.id);
  res.json({ product: updated, images: imgs });
});

/* ── DELETE /api/admin/products/:id ──────────────────────── */
router.delete('/products/:id', (req, res) => {
  const result = db.prepare('DELETE FROM product WHERE id = ?').run(req.params.id);
  if (!result.changes) return res.status(404).json({ error: 'Product not found' });
  res.json({ ok: true });
});

module.exports = router;
