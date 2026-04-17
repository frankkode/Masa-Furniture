/**
 * In-app notification API
 *
 * GET  /api/notifications         — list user's notifications (latest 30)
 * PATCH /api/notifications/read-all — mark all as read
 * PATCH /api/notifications/:id/read — mark one as read
 * DELETE /api/notifications/:id   — delete one
 */
const router      = require('express').Router();
const db          = require('../db/database');
const requireAuth = require('../middleware/auth');

router.use(requireAuth);

router.get('/', (req, res) => {
  const notes = db.prepare(`
    SELECT * FROM notification
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT 30
  `).all(req.user.id);
  const unread = notes.filter(n => !n.is_read).length;
  res.json({ notifications: notes, unread });
});

router.patch('/read-all', (req, res) => {
  db.prepare('UPDATE notification SET is_read = 1 WHERE user_id = ?').run(req.user.id);
  res.json({ ok: true });
});

router.patch('/:id/read', (req, res) => {
  db.prepare('UPDATE notification SET is_read = 1 WHERE id = ? AND user_id = ?')
    .run(req.params.id, req.user.id);
  res.json({ ok: true });
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM notification WHERE id = ? AND user_id = ?')
    .run(req.params.id, req.user.id);
  res.json({ ok: true });
});

module.exports = router;
