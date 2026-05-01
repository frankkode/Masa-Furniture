require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const path    = require('path');
const db      = require('./db/database');

/* ── auto-setup: create tables + seed if DB is empty ─────────── */
const hasTable = db.prepare(
  "SELECT name FROM sqlite_master WHERE type='table' AND name='product'"
).get();
if (!hasTable) {
  const fs     = require('fs');
  const schema = fs.readFileSync(path.join(__dirname, 'db/schema.sql'), 'utf8');
  db.exec(schema);
  require('./db/seed');
  console.log('Auto-setup: schema + seed applied');
}

const app = express();
const PORT = process.env.PORT || 5000;

// CORS — in production the React build is served from the same
// origin so CORS is not needed, but we keep it for dev (Vite on :5173).
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

// Serve uploaded product images
// In production swap this for Vercel Blob CDN URLs (no static serving needed)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// raw body needed for Stripe webhook signature verification
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());

// routes (will be added as we build each feature)
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/cart',     require('./routes/cart'));
app.use('/api/wishlist', require('./routes/wishlist'));
app.use('/api/orders',   require('./routes/orders'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/admin',         require('./routes/admin'));
app.use('/api/contact',       require('./routes/contact'));
app.use('/api/notifications', require('./routes/notifications'));

// health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// ── Serve React frontend in production ──────────────────────
// After `npm run build` in /client, the static files live in
// ../client/dist.  Express serves them so the whole app runs
// on a single Render Web Service — no separate Static Site needed.
const clientDist = path.join(__dirname, '../../client/dist');
if (require('fs').existsSync(clientDist)) {
  app.use(express.static(clientDist));
  // Any route that is NOT /api/* falls through to index.html
  // so React Router can handle client-side routing.
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
  console.log('Serving React build from', clientDist);
}

// Only start the HTTP server when run directly (not when imported by tests)
if (require.main === module) {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
