const router   = require('express').Router();
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const db       = require('../db/database');
const requireAuth = require('../middleware/auth');

const sign = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, is_staff: user.is_staff },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

const safeUser = ({ id, username, email, is_staff, date_joined }) =>
  ({ id, username, email, is_staff, date_joined });

// POST /api/auth/register
router.post('/register', [
  body('username').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { username, email, password } = req.body;

  const existing = db.prepare('SELECT id FROM user WHERE email = ? OR username = ?').get(email, username);
  if (existing) return res.status(409).json({ error: 'Email or username already taken' });

  const hashed = await bcrypt.hash(password, 12);
  const result = db.prepare(
    'INSERT INTO user (username, email, password) VALUES (?, ?, ?)'
  ).run(username, email, hashed);

  // create empty wishlist and profile for new user
  db.prepare('INSERT INTO wishlist (user_id) VALUES (?)').run(result.lastInsertRowid);
  db.prepare('INSERT INTO user_profile (user_id) VALUES (?)').run(result.lastInsertRowid);

  const user = db.prepare('SELECT * FROM user WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json({ token: sign(user), user: safeUser(user) });
});

// POST /api/auth/login
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, password } = req.body;
  const user = db.prepare('SELECT * FROM user WHERE email = ?').get(email);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

  const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
  db.prepare('UPDATE user SET last_login = ? WHERE id = ?').run(now, user.id);
  res.json({ token: sign(user), user: safeUser(user) });
});

// GET /api/auth/me  — verify token and return current user
router.get('/me', requireAuth, (req, res) => {
  const user = db.prepare('SELECT * FROM user WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ user: safeUser(user) });
});

// PATCH /api/auth/profile — update username / phone / avatar
router.patch('/profile', requireAuth, async (req, res) => {
  const { username, phone, avatar_url } = req.body;
  if (username) {
    db.prepare('UPDATE user SET username = ? WHERE id = ?').run(username, req.user.id);
  }
  db.prepare(`
    INSERT INTO user_profile (user_id, phone, avatar_url)
    VALUES (?, ?, ?)
    ON CONFLICT(user_id) DO UPDATE SET phone = excluded.phone, avatar_url = excluded.avatar_url
  `).run(req.user.id, phone || null, avatar_url || null);

  const user = db.prepare('SELECT * FROM user WHERE id = ?').get(req.user.id);
  res.json({ user: safeUser(user) });
});

// POST /api/auth/change-password
router.post('/change-password', requireAuth, async (req, res) => {
  const { current_password, new_password } = req.body;
  if (!current_password || !new_password || new_password.length < 6) {
    return res.status(400).json({ error: 'Invalid password data' });
  }
  const user = db.prepare('SELECT * FROM user WHERE id = ?').get(req.user.id);
  const valid = await bcrypt.compare(current_password, user.password);
  if (!valid) return res.status(401).json({ error: 'Current password is wrong' });

  const hashed = await bcrypt.hash(new_password, 12);
  db.prepare('UPDATE user SET password = ? WHERE id = ?').run(hashed, req.user.id);
  res.json({ message: 'Password updated' });
});

// GET /api/auth/profile — return user + profile data (phone, etc.)
router.get('/profile', requireAuth, (req, res) => {
  const user    = db.prepare('SELECT * FROM user WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const profile = db.prepare('SELECT * FROM user_profile WHERE user_id = ?').get(req.user.id);
  res.json({
    user:    safeUser(user),
    profile: profile || {},
  });
});

// ── Address routes ────────────────────────────────────────────

// GET /api/auth/addresses
router.get('/addresses', requireAuth, (req, res) => {
  const addresses = db.prepare(
    'SELECT * FROM address WHERE user_id = ? ORDER BY is_default DESC, id DESC'
  ).all(req.user.id);
  res.json({ addresses });
});

// POST /api/auth/addresses
router.post('/addresses', requireAuth, (req, res) => {
  const { full_name, phone, street, city, state, country, postal_code, type, is_default } = req.body;
  if (!full_name || !street || !city || !country) {
    return res.status(400).json({ error: 'full_name, street, city and country are required' });
  }
  // if new address is default, unset any previous default
  if (is_default) {
    db.prepare('UPDATE address SET is_default = 0 WHERE user_id = ?').run(req.user.id);
  }
  const result = db.prepare(`
    INSERT INTO address (user_id, full_name, phone, street, city, state, country, postal_code, type, is_default)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    req.user.id,
    full_name,
    phone        || null,
    street,
    city,
    state        || null,
    country,
    postal_code  || null,
    type         || 'shipping',
    is_default   ? 1 : 0,
  );
  const address = db.prepare('SELECT * FROM address WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json({ address });
});

// PATCH /api/auth/addresses/:id
router.patch('/addresses/:id', requireAuth, (req, res) => {
  const addr = db.prepare('SELECT * FROM address WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!addr) return res.status(404).json({ error: 'Address not found' });

  const { full_name, phone, street, city, state, country, postal_code, type, is_default } = req.body;
  if (is_default) {
    db.prepare('UPDATE address SET is_default = 0 WHERE user_id = ?').run(req.user.id);
  }
  db.prepare(`
    UPDATE address SET
      full_name   = COALESCE(?, full_name),
      phone       = COALESCE(?, phone),
      street      = COALESCE(?, street),
      city        = COALESCE(?, city),
      state       = COALESCE(?, state),
      country     = COALESCE(?, country),
      postal_code = COALESCE(?, postal_code),
      type        = COALESCE(?, type),
      is_default  = COALESCE(?, is_default)
    WHERE id = ? AND user_id = ?
  `).run(
    full_name   ?? null,
    phone       ?? null,
    street      ?? null,
    city        ?? null,
    state       ?? null,
    country     ?? null,
    postal_code ?? null,
    type        ?? null,
    is_default !== undefined ? (is_default ? 1 : 0) : null,
    req.params.id, req.user.id,
  );
  const updated = db.prepare('SELECT * FROM address WHERE id = ?').get(req.params.id);
  res.json({ address: updated });
});

// DELETE /api/auth/addresses/:id
router.delete('/addresses/:id', requireAuth, (req, res) => {
  const addr = db.prepare('SELECT * FROM address WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!addr) return res.status(404).json({ error: 'Address not found' });
  db.prepare('DELETE FROM address WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
  res.json({ message: 'Address deleted' });
});

// POST /api/auth/addresses/:id/set-default
router.post('/addresses/:id/set-default', requireAuth, (req, res) => {
  const addr = db.prepare('SELECT * FROM address WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!addr) return res.status(404).json({ error: 'Address not found' });
  db.prepare('UPDATE address SET is_default = 0 WHERE user_id = ?').run(req.user.id);
  db.prepare('UPDATE address SET is_default = 1 WHERE id = ?').run(req.params.id);
  res.json({ message: 'Default address updated' });
});

module.exports = router;
