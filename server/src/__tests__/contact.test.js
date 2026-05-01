/**
 * Contact form API tests
 * POST /api/contact — validates required fields, delegates to mailer
 */
const request = require('supertest');

process.env.JWT_SECRET = 'test-secret-key';
process.env.CLIENT_URL = 'http://localhost:5173';

/* ── mock DB ─────────────────────────────────────────────────── */
jest.mock('../db/database', () => {
  const Database = require('better-sqlite3');
  const fs       = require('fs');
  const db = new Database(':memory:');
  db.exec(fs.readFileSync(require('path').join(__dirname, '../db/schema.sql'), 'utf8'));
  return db;
});

/* ── mock mailer so no real SMTP calls are made ─────────────── */
jest.mock('../services/mailer', () => ({
  send:       jest.fn().mockResolvedValue({}),
  ADMIN_EMAIL: 'admin@masa.fi',
}));

const app    = require('../index');
const mailer = require('../services/mailer');

beforeEach(() => jest.clearAllMocks());

describe('POST /api/contact', () => {
  it('returns 400 when name is missing', async () => {
    const res = await request(app)
      .post('/api/contact')
      .send({ email: 'user@test.com', message: 'Hello' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/name/i);
  });

  it('returns 400 when email is missing', async () => {
    const res = await request(app)
      .post('/api/contact')
      .send({ name: 'Jane', message: 'Hello' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/email/i);
  });

  it('returns 400 when message is missing', async () => {
    const res = await request(app)
      .post('/api/contact')
      .send({ name: 'Jane', email: 'jane@test.com' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/message/i);
  });

  it('returns 200 and ok:true with all required fields', async () => {
    const res = await request(app)
      .post('/api/contact')
      .send({ name: 'Jane', email: 'jane@test.com', message: 'Great shop!' });
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  it('calls mailer.send with recipient = ADMIN_EMAIL', async () => {
    await request(app)
      .post('/api/contact')
      .send({ name: 'Jane', email: 'jane@test.com', message: 'Hello there' });
    expect(mailer.send).toHaveBeenCalledTimes(1);
    const call = mailer.send.mock.calls[0][0];
    expect(call.to).toBe('admin@masa.fi');
  });

  it('includes the sender name and message in the email', async () => {
    await request(app)
      .post('/api/contact')
      .send({ name: 'Alice', email: 'alice@test.com', message: 'Need help' });
    const call = mailer.send.mock.calls[0][0];
    expect(call.html).toMatch(/Alice/);
    expect(call.html).toMatch(/alice@test\.com/);
  });

  it('uses the topic as email subject prefix when provided', async () => {
    await request(app)
      .post('/api/contact')
      .send({ name: 'Bob', email: 'bob@test.com', subject: 'Returns & warranty', message: 'Want to return' });
    const call = mailer.send.mock.calls[0][0];
    expect(call.subject).toContain('Returns & warranty');
  });

  it('falls back to sender name in subject when no topic provided', async () => {
    await request(app)
      .post('/api/contact')
      .send({ name: 'Charlie', email: 'charlie@test.com', message: 'Just saying hi' });
    const call = mailer.send.mock.calls[0][0];
    expect(call.subject).toContain('Charlie');
  });
});
