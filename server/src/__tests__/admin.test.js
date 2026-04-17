/**
 * Admin API tests
 */
const request = require('supertest');

process.env.JWT_SECRET = 'test-secret-key';
process.env.CLIENT_URL = 'http://localhost:5173';

jest.mock('../db/database', () => {
  const Database = require('better-sqlite3');
  const fs       = require('fs');
  const db = new Database(':memory:');
  db.exec(fs.readFileSync(require('path').join(__dirname, '../db/schema.sql'), 'utf8'));
  return db;
});

const app     = require('../index');
const bcrypt  = require('bcryptjs');

let userToken;
let adminToken;

beforeAll(async () => {
  // register regular user
  const userRes = await request(app)
    .post('/api/auth/register')
    .send({ username: 'reguser', email: 'reg@masa.fi', password: 'password1' });
  userToken = userRes.body.token;

  // create admin directly in DB
  const db   = require('../db/database');
  const hash = await bcrypt.hash('adminpass1', 12);
  db.prepare(`INSERT INTO user (username, email, password, is_staff, is_superuser) VALUES ('admin2','admin2@masa.fi',?,1,1)`).run(hash);
  db.prepare(`INSERT INTO user_profile (user_id) VALUES ((SELECT id FROM user WHERE email='admin2@masa.fi'))`).run();
  db.prepare(`INSERT INTO wishlist (user_id) VALUES ((SELECT id FROM user WHERE email='admin2@masa.fi'))`).run();

  const adminRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin2@masa.fi', password: 'adminpass1' });
  adminToken = adminRes.body.token;
});

describe('Admin guard', () => {
  it('blocks unauthenticated access', async () => {
    const res = await request(app).get('/api/admin/stats');
    expect(res.status).toBe(401);
  });

  it('blocks non-admin users', async () => {
    const res = await request(app)
      .get('/api/admin/stats')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(403);
  });
});

describe('GET /api/admin/stats', () => {
  it('returns stats object for admin', async () => {
    const res = await request(app)
      .get('/api/admin/stats')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('totalOrders');
    expect(res.body).toHaveProperty('totalRevenue');
    expect(res.body).toHaveProperty('totalProducts');
    expect(res.body).toHaveProperty('pendingOrders');
  });
});

describe('GET /api/admin/orders', () => {
  it('returns orders array for admin', async () => {
    const res = await request(app)
      .get('/api/admin/orders')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('orders');
    expect(Array.isArray(res.body.orders)).toBe(true);
  });

  it('supports status filter', async () => {
    const res = await request(app)
      .get('/api/admin/orders?status=pending')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
  });
});
