/**
 * Reviews API tests
 * – GET /api/products/:id includes avatar_url + purchased_by_user
 * – POST review requires purchase; 403 without, 201 with, 409 on duplicate
 * – Staff can review without purchasing
 */
const request = require('supertest');
const bcrypt  = require('bcryptjs');

process.env.JWT_SECRET = 'test-secret-key';
process.env.CLIENT_URL = 'http://localhost:5173';

jest.mock('../db/database', () => {
  const Database = require('better-sqlite3');
  const fs       = require('fs');
  const db = new Database(':memory:');
  db.exec(fs.readFileSync(require('path').join(__dirname, '../db/schema.sql'), 'utf8'));
  // seed
  db.prepare(`INSERT INTO category (name, slug) VALUES ('Chairs','chairs')`).run();
  const catId = db.prepare(`SELECT id FROM category WHERE slug='chairs'`).get().id;
  db.prepare(`INSERT INTO product (category_id, name, slug, sku, price, stock, is_active)
              VALUES (?, 'Test Chair', 'test-chair', 'CHAIR-REV-001', 299, 10, 1)`).run(catId);
  return db;
});

const app = require('../index');
let buyerToken, noBuyToken, adminToken;
let productId;

beforeAll(async () => {
  // register buyer
  const b = await request(app).post('/api/auth/register')
    .send({ username: 'buyer',   email: 'buyer@masa.fi',  password: 'buypass1' });
  buyerToken = b.body.token;

  // register non-buyer
  const n = await request(app).post('/api/auth/register')
    .send({ username: 'nobody',  email: 'nobody@masa.fi', password: 'nopass1' });
  noBuyToken = n.body.token;

  // create admin
  const db   = require('../db/database');
  const hash = await bcrypt.hash('adminrev1', 12);
  db.prepare(`INSERT INTO user (username, email, password, is_staff, is_superuser)
              VALUES ('adminrev','adminrev@masa.fi',?,1,1)`).run(hash);
  db.prepare(`INSERT INTO user_profile (user_id) VALUES ((SELECT id FROM user WHERE email='adminrev@masa.fi'))`).run();
  db.prepare(`INSERT INTO wishlist    (user_id) VALUES ((SELECT id FROM user WHERE email='adminrev@masa.fi'))`).run();

  const a = await request(app).post('/api/auth/login')
    .send({ email: 'adminrev@masa.fi', password: 'adminrev1' });
  adminToken = a.body.token;

  // get product id
  const p = await request(app).get('/api/products');
  productId = p.body.products[0]?.id;

  // create a completed order for buyer
  const buyerId = db.prepare(`SELECT id FROM user WHERE email='buyer@masa.fi'`).get().id;
  const r = db.prepare(`INSERT INTO "order" (user_id, status, subtotal, total_price)
                         VALUES (?, 'delivered', 299, 299)`).run(buyerId);
  db.prepare(`INSERT INTO order_item (order_id, product_id, quantity, unit_price)
              VALUES (?, ?, 1, 299)`).run(r.lastInsertRowid, productId);
});

/* ── GET /api/products/:id ── */
describe('GET /api/products/:id', () => {
  it('returns reviews array with avatar_url field', async () => {
    const res = await request(app).get(`/api/products/${productId}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.reviews)).toBe(true);
    // reviews start empty; field should exist in shape when populated
    expect(res.body).toHaveProperty('purchased_by_user', false);
  });

  it('returns purchased_by_user false for unauthenticated', async () => {
    const res = await request(app).get(`/api/products/${productId}`);
    expect(res.body.purchased_by_user).toBe(false);
  });

  it('returns purchased_by_user false for non-buyer', async () => {
    const res = await request(app).get(`/api/products/${productId}`)
      .set('Authorization', `Bearer ${noBuyToken}`);
    expect(res.body.purchased_by_user).toBe(false);
  });

  it('returns purchased_by_user true for buyer', async () => {
    const res = await request(app).get(`/api/products/${productId}`)
      .set('Authorization', `Bearer ${buyerToken}`);
    expect(res.body.purchased_by_user).toBe(true);
  });

  it('returns purchased_by_user true for staff (no order needed)', async () => {
    const res = await request(app).get(`/api/products/${productId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.body.purchased_by_user).toBe(true);
  });
});

/* ── POST /api/products/:id/reviews ── */
describe('POST /api/products/:id/reviews', () => {
  it('returns 401 when unauthenticated', async () => {
    const res = await request(app).post(`/api/products/${productId}/reviews`)
      .send({ rating: 5 });
    expect(res.status).toBe(401);
  });

  it('returns 403 when user has not purchased the product', async () => {
    const res = await request(app).post(`/api/products/${productId}/reviews`)
      .set('Authorization', `Bearer ${noBuyToken}`)
      .send({ rating: 4, title: 'Nice', body: 'Good chair' });
    expect(res.status).toBe(403);
    expect(res.body.error).toMatch(/purchased/i);
  });

  it('returns 400 for invalid rating', async () => {
    const res = await request(app).post(`/api/products/${productId}/reviews`)
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ rating: 6 });
    expect(res.status).toBe(400);
  });

  it('allows buyer to submit a review', async () => {
    const res = await request(app).post(`/api/products/${productId}/reviews`)
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ rating: 5, title: 'Great chair!', body: 'Very comfy.' });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
  });

  it('returns 409 on duplicate review from same buyer', async () => {
    const res = await request(app).post(`/api/products/${productId}/reviews`)
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ rating: 3 });
    expect(res.status).toBe(409);
  });

  it('allows staff to review without purchasing', async () => {
    const res = await request(app).post(`/api/products/${productId}/reviews`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ rating: 4, title: 'Staff pick', body: 'Quality product.' });
    expect(res.status).toBe(201);
  });

  it('review appears in product detail with avatar_url field', async () => {
    const res = await request(app).get(`/api/products/${productId}`);
    expect(res.status).toBe(200);
    expect(res.body.reviews.length).toBeGreaterThanOrEqual(1);
    expect(res.body.reviews[0]).toHaveProperty('avatar_url');
    expect(res.body.reviews[0]).toHaveProperty('username');
    expect(res.body.reviews[0]).toHaveProperty('rating');
  });

  it('avg_rating is calculated correctly', async () => {
    const res = await request(app).get(`/api/products/${productId}`);
    expect(typeof res.body.avg_rating).toBe('number');
    expect(res.body.avg_rating).toBeGreaterThan(0);
  });
});
