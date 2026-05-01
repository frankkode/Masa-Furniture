/**
 * Admin product multi-image tests
 *
 * POST /api/admin/products   — accepts images[] array (up to 4), first is primary
 * PATCH /api/admin/products/:id — replaces images with new array
 * GET  /api/admin/products/:id  — returns product + images[]
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
  db.prepare(`INSERT INTO category (name, slug) VALUES ('Chairs','chairs')`).run();
  return db;
});

const app = require('../index');
let adminToken;
let categoryId;

beforeAll(async () => {
  const db   = require('../db/database');
  const hash = await bcrypt.hash('adminimg1', 12);
  db.prepare(`INSERT INTO user (username, email, password, is_staff, is_superuser)
              VALUES ('adminimg','adminimg@masa.fi',?,1,1)`).run(hash);
  db.prepare(`INSERT INTO user_profile (user_id) VALUES ((SELECT id FROM user WHERE email='adminimg@masa.fi'))`).run();
  db.prepare(`INSERT INTO wishlist (user_id) VALUES ((SELECT id FROM user WHERE email='adminimg@masa.fi'))`).run();

  const r = await request(app).post('/api/auth/login')
    .send({ email: 'adminimg@masa.fi', password: 'adminimg1' });
  adminToken = r.body.token;

  categoryId = db.prepare(`SELECT id FROM category WHERE slug='chairs'`).get().id;
});

const BASE_PRODUCT = (sku) => ({
  name: `Test Chair ${sku}`,
  sku,
  category_id: null, // filled in beforeEach
  price: 199,
  stock: 5,
});

describe('POST /api/admin/products — images[] array', () => {
  it('creates product with single primary image from images[]', async () => {
    const res = await request(app)
      .post('/api/admin/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        ...BASE_PRODUCT('IMG-001'),
        category_id: categoryId,
        images: [{ url: '/uploads/chair1.jpg', alt_text: 'Chair front' }],
      });
    expect(res.status).toBe(201);
    expect(res.body.images).toHaveLength(1);
    expect(res.body.images[0].image_url).toBe('/uploads/chair1.jpg');
    expect(res.body.images[0].is_primary).toBe(1);
  });

  it('creates product with up to 4 images, first is primary', async () => {
    const res = await request(app)
      .post('/api/admin/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        ...BASE_PRODUCT('IMG-002'),
        category_id: categoryId,
        images: [
          { url: '/uploads/a.jpg', alt_text: 'Front' },
          { url: '/uploads/b.jpg', alt_text: 'Side'  },
          { url: '/uploads/c.jpg', alt_text: 'Back'  },
          { url: '/uploads/d.jpg', alt_text: 'Detail'},
        ],
      });
    expect(res.status).toBe(201);
    expect(res.body.images).toHaveLength(4);
    expect(res.body.images[0].is_primary).toBe(1);
    expect(res.body.images[1].is_primary).toBe(0);
    expect(res.body.images[2].is_primary).toBe(0);
    expect(res.body.images[3].is_primary).toBe(0);
  });

  it('caps at 4 images even when more are sent', async () => {
    const res = await request(app)
      .post('/api/admin/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        ...BASE_PRODUCT('IMG-003'),
        category_id: categoryId,
        images: [
          { url: '/uploads/1.jpg' },
          { url: '/uploads/2.jpg' },
          { url: '/uploads/3.jpg' },
          { url: '/uploads/4.jpg' },
          { url: '/uploads/5.jpg' }, // 5th should be ignored
        ],
      });
    expect(res.status).toBe(201);
    expect(res.body.images).toHaveLength(4);
  });

  it('falls back to legacy image_url when images[] is absent', async () => {
    const res = await request(app)
      .post('/api/admin/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        ...BASE_PRODUCT('IMG-004'),
        category_id: categoryId,
        image_url: '/uploads/legacy.jpg',
      });
    expect(res.status).toBe(201);
    expect(res.body.images).toHaveLength(1);
    expect(res.body.images[0].image_url).toBe('/uploads/legacy.jpg');
  });
});

describe('GET /api/admin/products/:id', () => {
  let productId;

  beforeAll(async () => {
    const r = await request(app)
      .post('/api/admin/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        ...BASE_PRODUCT('IMG-GET-001'),
        category_id: categoryId,
        images: [{ url: '/uploads/get1.jpg' }, { url: '/uploads/get2.jpg' }],
      });
    productId = r.body.product.id;
  });

  it('returns product with images array', async () => {
    const res = await request(app)
      .get(`/api/admin/products/${productId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('product');
    expect(Array.isArray(res.body.images)).toBe(true);
    expect(res.body.images).toHaveLength(2);
    expect(res.body.images[0].image_url).toBe('/uploads/get1.jpg');
    expect(res.body.images[1].image_url).toBe('/uploads/get2.jpg');
  });

  it('returns 404 for non-existent product', async () => {
    const res = await request(app)
      .get('/api/admin/products/99999')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(404);
  });

  it('returns 403 for non-admin', async () => {
    const reg = await request(app).post('/api/auth/register')
      .send({ username: 'nonimg', email: 'nonimg@masa.fi', password: 'nonpass1' });
    const res = await request(app)
      .get(`/api/admin/products/${productId}`)
      .set('Authorization', `Bearer ${reg.body.token}`);
    expect(res.status).toBe(403);
  });
});

describe('PATCH /api/admin/products/:id — images[] update', () => {
  let productId;

  beforeAll(async () => {
    const r = await request(app)
      .post('/api/admin/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        ...BASE_PRODUCT('IMG-PATCH-001'),
        category_id: categoryId,
        images: [{ url: '/uploads/old1.jpg' }, { url: '/uploads/old2.jpg' }],
      });
    productId = r.body.product.id;
  });

  it('replaces all images with a new set', async () => {
    const res = await request(app)
      .patch(`/api/admin/products/${productId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        images: [
          { url: '/uploads/new1.jpg', alt_text: 'New front' },
          { url: '/uploads/new2.jpg', alt_text: 'New side'  },
          { url: '/uploads/new3.jpg', alt_text: 'New back'  },
        ],
      });
    expect(res.status).toBe(200);
    expect(res.body.images).toHaveLength(3);
    expect(res.body.images[0].image_url).toBe('/uploads/new1.jpg');
    expect(res.body.images[0].is_primary).toBe(1);
    /* old images should be gone */
    const urls = res.body.images.map(i => i.image_url);
    expect(urls).not.toContain('/uploads/old1.jpg');
  });

  it('can reduce to a single image', async () => {
    const res = await request(app)
      .patch(`/api/admin/products/${productId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ images: [{ url: '/uploads/only.jpg' }] });
    expect(res.status).toBe(200);
    expect(res.body.images).toHaveLength(1);
    expect(res.body.images[0].image_url).toBe('/uploads/only.jpg');
    expect(res.body.images[0].is_primary).toBe(1);
  });

  it('respects 4-image cap on patch', async () => {
    const res = await request(app)
      .patch(`/api/admin/products/${productId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        images: [
          { url: '/uploads/p1.jpg' },
          { url: '/uploads/p2.jpg' },
          { url: '/uploads/p3.jpg' },
          { url: '/uploads/p4.jpg' },
          { url: '/uploads/p5.jpg' }, // should be dropped
        ],
      });
    expect(res.status).toBe(200);
    expect(res.body.images).toHaveLength(4);
  });
});
