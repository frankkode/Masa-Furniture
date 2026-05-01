/**
 * Notifications API tests
 * GET  /api/notifications         — list + unread count
 * PATCH /api/notifications/read-all — mark all read
 * PATCH /api/notifications/:id/read — mark one read
 * DELETE /api/notifications/:id   — delete one
 *
 * All routes require auth; users only see their own notifications.
 */
const request = require('supertest');
const bcrypt  = require('bcryptjs');

process.env.JWT_SECRET = 'test-secret-key';
process.env.CLIENT_URL = 'http://localhost:5173';

/* ── in-memory DB ─────────────────────────────────────────── */
jest.mock('../db/database', () => {
  const Database = require('better-sqlite3');
  const fs       = require('fs');
  const db = new Database(':memory:');
  db.exec(fs.readFileSync(require('path').join(__dirname, '../db/schema.sql'), 'utf8'));
  return db;
});

/* ── mock mailer (orders route imports it) ──────────────── */
jest.mock('../services/mailer', () => ({
  send:                  jest.fn().mockResolvedValue({}),
  orderConfirmationHtml: jest.fn().mockReturnValue('<p>order</p>'),
  orderStatusHtml:       jest.fn().mockReturnValue('<p>status</p>'),
  ADMIN_EMAIL:           'admin@masa.fi',
}));

const app = require('../index');

let tokenA, tokenB, userAId;

beforeAll(async () => {
  /* register two users */
  const a = await request(app).post('/api/auth/register')
    .send({ username: 'notif_a', email: 'notif_a@masa.fi', password: 'passa1' });
  tokenA  = a.body.token;
  userAId = a.body.user?.id;

  const b = await request(app).post('/api/auth/register')
    .send({ username: 'notif_b', email: 'notif_b@masa.fi', password: 'passb1' });
  tokenB = b.body.token;

  /* seed two notifications for user A directly in DB */
  const db = require('../db/database');
  if (!userAId) {
    userAId = db.prepare(`SELECT id FROM user WHERE email='notif_a@masa.fi'`).get().id;
  }
  db.prepare(`INSERT INTO notification (user_id, title, message, type, is_read) VALUES (?,?,?,?,?)`)
    .run(userAId, 'Order placed!', 'Your order was received.', 'success', 0);
  db.prepare(`INSERT INTO notification (user_id, title, message, type, is_read) VALUES (?,?,?,?,?)`)
    .run(userAId, 'Order shipped', 'Your order is on the way.', 'info', 0);
});

/* ── GET /api/notifications ───────────────────────────────── */
describe('GET /api/notifications', () => {
  it('returns 401 without auth', async () => {
    const res = await request(app).get('/api/notifications');
    expect(res.status).toBe(401);
  });

  it('returns notifications array and unread count for user A', async () => {
    const res = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${tokenA}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.notifications)).toBe(true);
    expect(res.body.notifications.length).toBeGreaterThanOrEqual(2);
    expect(res.body.unread).toBeGreaterThanOrEqual(2);
  });

  it('user B sees no notifications (isolation)', async () => {
    const res = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${tokenB}`);
    expect(res.status).toBe(200);
    expect(res.body.notifications.length).toBe(0);
    expect(res.body.unread).toBe(0);
  });

  it('each notification has title, message, type fields', async () => {
    const res = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${tokenA}`);
    const n = res.body.notifications[0];
    expect(n).toHaveProperty('title');
    expect(n).toHaveProperty('message');
    expect(n).toHaveProperty('type');
    expect(n).toHaveProperty('is_read');
  });
});

/* ── PATCH /api/notifications/read-all ────────────────────── */
describe('PATCH /api/notifications/read-all', () => {
  it('returns 401 without auth', async () => {
    const res = await request(app).patch('/api/notifications/read-all');
    expect(res.status).toBe(401);
  });

  it('marks all notifications as read for user A', async () => {
    const mark = await request(app)
      .patch('/api/notifications/read-all')
      .set('Authorization', `Bearer ${tokenA}`);
    expect(mark.status).toBe(200);
    expect(mark.body.ok).toBe(true);

    const check = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${tokenA}`);
    expect(check.body.unread).toBe(0);
  });
});

/* ── PATCH /api/notifications/:id/read ─────────────────────── */
describe('PATCH /api/notifications/:id/read', () => {
  let notifId;

  beforeAll(async () => {
    /* add a fresh unread notification */
    const db = require('../db/database');
    const r = db.prepare(`INSERT INTO notification (user_id, title, message, type, is_read) VALUES (?,?,?,?,?)`)
      .run(userAId, 'Test single read', 'Check mark one', 'info', 0);
    notifId = r.lastInsertRowid;
  });

  it('returns 401 without auth', async () => {
    const res = await request(app).patch(`/api/notifications/${notifId}/read`);
    expect(res.status).toBe(401);
  });

  it('marks a single notification as read', async () => {
    const res = await request(app)
      .patch(`/api/notifications/${notifId}/read`)
      .set('Authorization', `Bearer ${tokenA}`);
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });
});

/* ── DELETE /api/notifications/:id ─────────────────────────── */
describe('DELETE /api/notifications/:id', () => {
  let deleteId;

  beforeAll(async () => {
    const db = require('../db/database');
    const r = db.prepare(`INSERT INTO notification (user_id, title, message, type) VALUES (?,?,?,?)`)
      .run(userAId, 'To be deleted', 'Delete me', 'info');
    deleteId = r.lastInsertRowid;
  });

  it('returns 401 without auth', async () => {
    const res = await request(app).delete(`/api/notifications/${deleteId}`);
    expect(res.status).toBe(401);
  });

  it('deletes a notification successfully', async () => {
    const res = await request(app)
      .delete(`/api/notifications/${deleteId}`)
      .set('Authorization', `Bearer ${tokenA}`);
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);

    /* confirm it's gone */
    const check = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${tokenA}`);
    const ids = check.body.notifications.map(n => n.id);
    expect(ids).not.toContain(deleteId);
  });

  it('does not delete another user\'s notification', async () => {
    /* notifId belongs to user A — user B trying to delete should be silently ignored */
    const db = require('../db/database');
    const r = db.prepare(`INSERT INTO notification (user_id, title, message, type) VALUES (?,?,?,?)`)
      .run(userAId, 'User A private', 'Should stay', 'info');
    const aNotifId = r.lastInsertRowid;

    await request(app)
      .delete(`/api/notifications/${aNotifId}`)
      .set('Authorization', `Bearer ${tokenB}`);

    /* still in DB after B's delete attempt */
    const row = db.prepare(`SELECT id FROM notification WHERE id = ?`).get(aNotifId);
    expect(row).toBeTruthy();
  });
});
