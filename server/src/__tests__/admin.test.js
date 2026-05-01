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

describe('GET /api/admin/shipping-settings', () => {
  it('returns 401 without auth', async () => {
    const res = await request(app).get('/api/admin/shipping-settings');
    expect(res.status).toBe(401);
  });

  it('returns 403 for non-admin', async () => {
    const res = await request(app)
      .get('/api/admin/shipping-settings')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(403);
  });

  it('returns shipping_fee and free_shipping_threshold', async () => {
    const res = await request(app)
      .get('/api/admin/shipping-settings')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('shipping_fee');
    expect(res.body).toHaveProperty('free_shipping_threshold');
    expect(typeof res.body.shipping_fee).toBe('number');
    expect(typeof res.body.free_shipping_threshold).toBe('number');
  });
});

describe('PATCH /api/admin/shipping-settings', () => {
  it('returns 401 without auth', async () => {
    const res = await request(app)
      .patch('/api/admin/shipping-settings')
      .send({ shipping_fee: 5 });
    expect(res.status).toBe(401);
  });

  it('returns 403 for non-admin', async () => {
    const res = await request(app)
      .patch('/api/admin/shipping-settings')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ shipping_fee: 5 });
    expect(res.status).toBe(403);
  });

  it('updates shipping_fee and persists the change', async () => {
    const patch = await request(app)
      .patch('/api/admin/shipping-settings')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ shipping_fee: 7.50, free_shipping_threshold: 150 });
    expect(patch.status).toBe(200);
    expect(patch.body.ok).toBe(true);

    const get = await request(app)
      .get('/api/admin/shipping-settings')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(get.body.shipping_fee).toBeCloseTo(7.50);
    expect(get.body.free_shipping_threshold).toBeCloseTo(150);
  });

  it('allows updating only shipping_fee without touching threshold', async () => {
    /* first set both */
    await request(app)
      .patch('/api/admin/shipping-settings')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ shipping_fee: 12, free_shipping_threshold: 200 });

    /* update only fee */
    await request(app)
      .patch('/api/admin/shipping-settings')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ shipping_fee: 4 });

    const get = await request(app)
      .get('/api/admin/shipping-settings')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(get.body.shipping_fee).toBeCloseTo(4);
    expect(get.body.free_shipping_threshold).toBeCloseTo(200); /* unchanged */
  });
});
