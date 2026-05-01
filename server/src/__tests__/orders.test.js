/**
 * Orders API tests
 * GET  /api/orders/shipping-cost — returns fee + threshold from settings table
 * POST /api/orders               — dynamic shipping, items_meta (color/size), notifications
 * GET  /api/orders               — list user's orders
 * GET  /api/orders/:id           — includes selected_color + selected_size per item
 */
const request = require('supertest');

process.env.JWT_SECRET = 'test-secret-key';
process.env.CLIENT_URL = 'http://localhost:5173';

/* ── in-memory DB ─────────────────────────────────────────── */
jest.mock('../db/database', () => {
  const Database = require('better-sqlite3');
  const fs       = require('fs');
  const db = new Database(':memory:');
  db.exec(fs.readFileSync(require('path').join(__dirname, '../db/schema.sql'), 'utf8'));

  /* seed category + product */
  db.prepare(`INSERT INTO category (name, slug) VALUES ('Chairs','chairs')`).run();
  const catId = db.prepare(`SELECT id FROM category WHERE slug='chairs'`).get().id;
  db.prepare(`
    INSERT INTO product (category_id, name, slug, sku, price, stock, is_active, color)
    VALUES (?, 'Oak Chair', 'oak-chair', 'CHAIR-ORD-001', 200, 20, 1, 'Oak')
  `).run(catId);

  return db;
});

/* ── mock mailer ─────────────────────────────────────────── */
jest.mock('../services/mailer', () => ({
  send:                  jest.fn().mockResolvedValue({}),
  orderConfirmationHtml: jest.fn().mockReturnValue('<p>conf</p>'),
  orderStatusHtml:       jest.fn().mockReturnValue('<p>stat</p>'),
  ADMIN_EMAIL:           'admin@masa.fi',
}));

const app    = require('../index');
const mailer = require('../services/mailer');

let token;
let productId;

const ADDR = {
  full_name:   'Testi User',
  street:      'Mannerheimintie 10',
  city:        'Helsinki',
  country:     'Finland',
  postal_code: '00100',
};

beforeAll(async () => {
  /* register user */
  const reg = await request(app).post('/api/auth/register')
    .send({ username: 'ordertest', email: 'ordertest@masa.fi', password: 'orderpass1' });
  token = reg.body.token;

  const db = require('../db/database');
  productId = db.prepare(`SELECT id FROM product WHERE sku='CHAIR-ORD-001'`).get().id;
});

beforeEach(() => jest.clearAllMocks());

/* helper: add product to cart */
async function addToCart(qty = 1) {
  await request(app).post('/api/cart')
    .set('Authorization', `Bearer ${token}`)
    .send({ product_id: productId, quantity: qty });
}

/* ── GET /api/orders/shipping-cost ───────────────────────── */
describe('GET /api/orders/shipping-cost', () => {
  it('returns 401 without auth', async () => {
    const res = await request(app).get('/api/orders/shipping-cost');
    expect(res.status).toBe(401);
  });

  it('returns fee and threshold with correct shape', async () => {
    const res = await request(app)
      .get('/api/orders/shipping-cost')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('fee');
    expect(res.body).toHaveProperty('threshold');
    expect(typeof res.body.fee).toBe('number');
    expect(typeof res.body.threshold).toBe('number');
  });

  it('reflects custom settings saved in DB', async () => {
    const db = require('../db/database');
    db.prepare(`INSERT INTO settings (key, value) VALUES ('shipping_fee','5.50')
                ON CONFLICT(key) DO UPDATE SET value=excluded.value`).run();
    db.prepare(`INSERT INTO settings (key, value) VALUES ('free_shipping_threshold','75')
                ON CONFLICT(key) DO UPDATE SET value=excluded.value`).run();

    const res = await request(app)
      .get('/api/orders/shipping-cost')
      .set('Authorization', `Bearer ${token}`);
    expect(res.body.fee).toBeCloseTo(5.50);
    expect(res.body.threshold).toBeCloseTo(75);
  });
});

/* ── POST /api/orders ────────────────────────────────────── */
describe('POST /api/orders', () => {
  it('returns 401 without auth', async () => {
    const res = await request(app).post('/api/orders').send({ shipping_address: ADDR });
    expect(res.status).toBe(401);
  });

  it('returns 400 when cart is empty', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({ shipping_address: ADDR });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/cart/i);
  });

  it('returns 400 when shipping_address is missing', async () => {
    await addToCart();
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/shipping/i);
  });

  it('creates an order and returns order_id + total', async () => {
    await addToCart();
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({ shipping_address: ADDR });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('order_id');
    expect(res.body).toHaveProperty('total');
    expect(res.body.status).toBe('pending');
  });

  it('applies dynamic shipping fee from settings table', async () => {
    /* set fee to €3, threshold €500 (product is €200, so fee should apply) */
    const db = require('../db/database');
    db.prepare(`INSERT INTO settings (key, value) VALUES ('shipping_fee','3.00')
                ON CONFLICT(key) DO UPDATE SET value=excluded.value`).run();
    db.prepare(`INSERT INTO settings (key, value) VALUES ('free_shipping_threshold','500')
                ON CONFLICT(key) DO UPDATE SET value=excluded.value`).run();

    await addToCart();
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({ shipping_address: ADDR });
    expect(res.status).toBe(201);
    /* total = 200 (product) + 3 (shipping) */
    expect(res.body.total).toBeCloseTo(203, 0);
  });

  it('applies free shipping when subtotal meets threshold', async () => {
    const db = require('../db/database');
    /* fee €10, threshold €100 — product is €200 so free shipping */
    db.prepare(`INSERT INTO settings (key, value) VALUES ('shipping_fee','10.00')
                ON CONFLICT(key) DO UPDATE SET value=excluded.value`).run();
    db.prepare(`INSERT INTO settings (key, value) VALUES ('free_shipping_threshold','100')
                ON CONFLICT(key) DO UPDATE SET value=excluded.value`).run();

    await addToCart();
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({ shipping_address: ADDR });
    expect(res.status).toBe(201);
    expect(res.body.total).toBeCloseTo(200, 0); /* no shipping added */
  });

  it('stores color and size from items_meta', async () => {
    await addToCart();
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        shipping_address: ADDR,
        items_meta: [{ product_id: productId, color: 'Midnight Black', size: 'L' }],
      });
    expect(res.status).toBe(201);

    /* verify via GET /api/orders/:id */
    const detail = await request(app)
      .get(`/api/orders/${res.body.order_id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(detail.status).toBe(200);
    const item = detail.body.items[0];
    expect(item.selected_color).toBe('Midnight Black');
    expect(item.selected_size).toBe('L');
  });

  it('sends confirmation email to customer', async () => {
    await addToCart();
    await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({ shipping_address: ADDR });
    /* mailer.send is called at least once (customer + admin) */
    expect(mailer.send).toHaveBeenCalled();
    const calls = mailer.send.mock.calls.map(c => c[0]);
    const toCustomer = calls.find(c => c.to === 'ordertest@masa.fi');
    expect(toCustomer).toBeTruthy();
    expect(toCustomer.subject).toMatch(/confirmed/i);
  });

  it('sends alert email to admin', async () => {
    await addToCart();
    await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({ shipping_address: ADDR });
    const calls = mailer.send.mock.calls.map(c => c[0]);
    const toAdmin = calls.find(c => c.to === 'admin@masa.fi');
    expect(toAdmin).toBeTruthy();
  });

  it('creates in-app notification for the user', async () => {
    await addToCart();
    const orderRes = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({ shipping_address: ADDR });
    expect(orderRes.status).toBe(201);

    const notifRes = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${token}`);
    const titles = notifRes.body.notifications.map(n => n.title);
    expect(titles.some(t => /order placed/i.test(t))).toBe(true);
  });
});

/* ── GET /api/orders ─────────────────────────────────────── */
describe('GET /api/orders', () => {
  it('returns 401 without auth', async () => {
    const res = await request(app).get('/api/orders');
    expect(res.status).toBe(401);
  });

  it('returns orders array for logged-in user', async () => {
    const res = await request(app)
      .get('/api/orders')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('each order has item_count field', async () => {
    const res = await request(app)
      .get('/api/orders')
      .set('Authorization', `Bearer ${token}`);
    if (res.body.length > 0) {
      expect(res.body[0]).toHaveProperty('item_count');
    }
  });
});

/* ── GET /api/orders/:id ─────────────────────────────────── */
describe('GET /api/orders/:id', () => {
  it('returns 404 for non-existent order', async () => {
    const res = await request(app)
      .get('/api/orders/99999')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
  });

  it('returns order with items array', async () => {
    /* create an order first */
    await addToCart();
    const created = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({ shipping_address: ADDR });
    const orderId = created.body.order_id;

    const res = await request(app)
      .get(`/api/orders/${orderId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.items)).toBe(true);
    expect(res.body.items.length).toBeGreaterThan(0);
  });
});
