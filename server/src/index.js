require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const path    = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// middleware
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));

// Serve uploaded product images
// In production swap this for Vercel Blob CDN URLs (no static serving needed)
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

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
app.use('/api/admin',   require('./routes/admin'));

// health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Only start the HTTP server when run directly (not when imported by tests)
if (require.main === module) {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
