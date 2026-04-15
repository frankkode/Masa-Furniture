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

module.exports = router;
