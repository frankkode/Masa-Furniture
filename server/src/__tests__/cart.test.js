/**
 * Cart & Wishlist API tests
 */
const request = require('supertest');

process.env.JWT_SECRET = 'test-secret-key';
process.env.CLIENT_URL = 'http://localhost:5173';

jest.mock('../db/database', () => {
  const Database = require('better-sqlite3');
  const fs       = require('fs');
  const db = new Database(':memory:');
  db.exec(fs.readFileSync(require('path').join(__dirname, '../db/schema.sql'), 'utf8'));
  // seed category + product
  db.prepare(`INSERT INTO category (name, slug) VALUES ('Chairs','chair')`).run();
  const catId = db.prepare(`SELECT id FROM category WHERE slug='chair'`).get().id;
  db.prepare(`INSERT INTO product (category_id, name, slug, sku, price, stock, is_active) VALUES (?, 'Test Chair', 'test-chair', 'CHAIR-TEST-001', 199.00, 5, 1)`).run(catId);
  return db;
});

const app = require('../index');
let token;
let productId;

beforeAll(async () => {
  const regRes = await request(app)
    .post('/api/auth/register')
    .send({ username: 'carttest', email: 'carttest@masa.fi', password: 'cartpass1' });
  token = regRes.body.token;
  const prodRes = await request(app).get('/api/products');
  productId = prodRes.body.products[0]?.id;
});

describe('Cart /api/cart', () => {
  it('returns empty cart for new user', async () => {
    const res = await request(app)
      .get('/api/cart')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('items');
    expect(Array.isArray(res.body.items)).toBe(true);
  });

  it('adds a product to cart', async () => {
    if (!productId) return;
    const res = await request(app)
      .post('/api/cart')
      .set('Authorization', `Bearer ${token}`)
      .send({ product_id: productId, quantity: 2 });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('items');
  });

  it('returns a guest cart without auth (cart supports guest sessions)', async () => {
    const res = await request(app).get('/api/cart');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('items');
  });
});

describe('Wishlist /api/wishlist', () => {
  it('returns empty wishlist', async () => {
    const res = await request(app)
      .get('/api/wishlist')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('items');
  });

  it('adds product to wishlist', async () => {
    if (!productId) return;
    const res = await request(app)
      .post(`/api/wishlist/${productId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(201);
  });

  it('returns 409 when adding duplicate', async () => {
    if (!productId) return;
    const res = await request(app)
      .post(`/api/wishlist/${productId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(409);
  });

  it('removes product from wishlist', async () => {
    if (!productId) return;
    const res = await request(app)
      .delete(`/api/wishlist/${productId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });

  it('returns 401 without auth token', async () => {
    const res = await request(app).get('/api/wishlist');
    expect(res.status).toBe(401);
  });
});
