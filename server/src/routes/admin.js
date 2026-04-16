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

module.exports = router;
