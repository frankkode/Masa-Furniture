/**
 * Products & Categories API tests
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
  db.prepare(`INSERT INTO category (name, slug, description) VALUES ('Chairs','chair','Seating')`).run();
  const catId = db.prepare(`SELECT id FROM category WHERE slug='chair'`).get().id;
  db.prepare(`
    INSERT INTO product (category_id, name, slug, sku, description, price, stock, is_active)
    VALUES (?, 'Lounge Chair', 'lounge-chair', 'CHAIR-001', 'Comfortable', 299.99, 10, 1)
  `).run(catId);
  return db;
});

const app = require('../index');

describe('GET /api/categories', () => {
  it('returns list of categories', async () => {
    const res = await request(app).get('/api/categories');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
    expect(res.body[0]).toHaveProperty('slug');
  });
});

describe('GET /api/products', () => {
  it('returns paginated product list', async () => {
    const res = await request(app).get('/api/products');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('products');
    expect(Array.isArray(res.body.products)).toBe(true);
  });

  it('filters by category slug', async () => {
    const res = await request(app).get('/api/products?category=chair');
    expect(res.status).toBe(200);
    expect(res.body.products.length).toBeGreaterThanOrEqual(1);
  });

  it('returns empty list for unknown category', async () => {
    const res = await request(app).get('/api/products?category=nonexistent');
    expect(res.status).toBe(200);
    expect(res.body.products.length).toBe(0);
  });

  it('supports search query', async () => {
    const res = await request(app).get('/api/products?search=Lounge');
    expect(res.status).toBe(200);
    expect(res.body.products.length).toBeGreaterThanOrEqual(1);
  });
});

describe('GET /api/products/:id', () => {
  let productId;

  beforeAll(async () => {
    const res = await request(app).get('/api/products');
    productId = res.body.products[0]?.id;
  });

  it('returns a single product', async () => {
    if (!productId) return;
    const res = await request(app).get(`/api/products/${productId}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id', productId);
    expect(res.body).toHaveProperty('name');
    expect(res.body).toHaveProperty('price');
  });

  it('returns 404 for unknown product', async () => {
    const res = await request(app).get('/api/products/99999');
    expect(res.status).toBe(404);
  });
});
