/**
 * Auth API tests — POST /api/auth/register, /login, /me, /profile, addresses
 */
const request = require('supertest');

process.env.JWT_SECRET = 'test-secret-key';
process.env.CLIENT_URL = 'http://localhost:5173';

// ── use in-memory DB via jest.mock (no out-of-scope vars in factory) ───
jest.mock('../db/database', () => {
  const Database = require('better-sqlite3');
  const fs       = require('fs');
  const path     = require('path');
  const db = new Database(':memory:');
  db.exec(fs.readFileSync(require('path').join(__dirname, '../db/schema.sql'), 'utf8'));
  return db;
});

const app = require('../index');

const TEST_USER = { username: 'testuser', email: 'test@masa.fi', password: 'password123' };
let token;

beforeAll(async () => {
  const res = await request(app).post('/api/auth/register').send(TEST_USER);
  token = res.body.token;
});

// ────────────────────────────────────────────────────────────────
describe('POST /api/auth/register', () => {
  it('creates a new user and returns token + user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'newuser2', email: 'new2@masa.fi', password: 'secret99' });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.email).toBe('new2@masa.fi');
    expect(res.body.user).not.toHaveProperty('password');
  });

  it('rejects duplicate email', async () => {
    const res = await request(app).post('/api/auth/register').send(TEST_USER);
    expect(res.status).toBe(409);
  });

  it('rejects short password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'x', email: 'short@masa.fi', password: '123' });
    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/login', () => {
  it('returns token for valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: TEST_USER.email, password: TEST_USER.password });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  it('rejects wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: TEST_USER.email, password: 'wrongpassword' });
    expect(res.status).toBe(401);
  });

  it('rejects unknown email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@masa.fi', password: 'any' });
    expect(res.status).toBe(401);
  });
});

describe('GET /api/auth/me', () => {
  it('returns current user when token is valid', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(TEST_USER.email);
  });

  it('returns 401 without token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });
});

describe('GET /api/auth/profile', () => {
  it('returns user + profile object', async () => {
    const res = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('user');
    expect(res.body).toHaveProperty('profile');
  });
});

describe('PATCH /api/auth/profile', () => {
  it('updates username and phone', async () => {
    const res = await request(app)
      .patch('/api/auth/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ username: 'updated_user', phone: '+358401234567' });
    expect(res.status).toBe(200);
    expect(res.body.user.username).toBe('updated_user');
  });
});

describe('Address CRUD /api/auth/addresses', () => {
  let addrId;

  it('returns empty list initially', async () => {
    const res = await request(app)
      .get('/api/auth/addresses')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.addresses)).toBe(true);
  });

  it('creates a new address', async () => {
    const res = await request(app)
      .post('/api/auth/addresses')
      .set('Authorization', `Bearer ${token}`)
      .send({ full_name: 'Testi Käyttäjä', street: 'Testitie 1', city: 'Helsinki', country: 'Finland', is_default: true });
    expect(res.status).toBe(201);
    expect(res.body.address.city).toBe('Helsinki');
    addrId = res.body.address.id;
  });

  it('lists the created address', async () => {
    const res = await request(app)
      .get('/api/auth/addresses')
      .set('Authorization', `Bearer ${token}`);
    expect(res.body.addresses.length).toBeGreaterThanOrEqual(1);
    expect(res.body.addresses[0].country).toBe('Finland');
  });

  it('updates the address', async () => {
    const res = await request(app)
      .patch(`/api/auth/addresses/${addrId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ city: 'Tampere' });
    expect(res.status).toBe(200);
    expect(res.body.address.city).toBe('Tampere');
  });

  it('sets address as default', async () => {
    const res = await request(app)
      .post(`/api/auth/addresses/${addrId}/set-default`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });

  it('deletes the address', async () => {
    const res = await request(app)
      .delete(`/api/auth/addresses/${addrId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });

  it('returns 404 for unknown address', async () => {
    const res = await request(app)
      .delete('/api/auth/addresses/99999')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
  });
});

describe('POST /api/auth/change-password', () => {
  it('changes password with correct current password', async () => {
    const res = await request(app)
      .post('/api/auth/change-password')
      .set('Authorization', `Bearer ${token}`)
      .send({ current_password: TEST_USER.password, new_password: 'newpassword99' });
    expect(res.status).toBe(200);
  });

  it('rejects wrong current password', async () => {
    const res = await request(app)
      .post('/api/auth/change-password')
      .set('Authorization', `Bearer ${token}`)
      .send({ current_password: 'wrong', new_password: 'doesntmatter' });
    expect(res.status).toBe(401);
  });
});

describe('GET /api/health', () => {
  it('returns ok status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});
