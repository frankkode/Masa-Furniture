/**
 * File upload middleware
 *
 * Development: saves files to server/uploads/ and returns a local URL.
 *
 * Production (Vercel Blob) — swap this entire file:
 *   const { put } = require('@vercel/blob');
 *   exports.uploadImage = async (req, res) => {
 *     const { url } = await put(req.file.originalname, req.file.buffer, { access: 'public' });
 *     res.json({ url });
 *   };
 *   exports.multerMiddleware = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } })
 *     .single('image');
 */

const multer = require('multer');
const path   = require('path');
const crypto = require('crypto');

const UPLOADS_DIR = path.join(__dirname, '../../uploads');

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename:    (_req, file, cb) => {
    // unique name: timestamp-random.ext  (avoids collisions, safe for URLs)
    const ext    = path.extname(file.originalname).toLowerCase();
    const unique = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`;
    cb(null, unique);
  },
});

const fileFilter = (_req, file, cb) => {
  const allowed = /^image\/(jpeg|jpg|png|webp|gif|avif)$/;
  if (allowed.test(file.mimetype)) cb(null, true);
  else cb(new Error('Only image files are allowed (jpeg, png, webp, gif, avif)'));
};

exports.multerMiddleware = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
}).single('image');

/**
 * POST /api/admin/upload
 * Returns { url: '/uploads/<filename>' }
 */
exports.uploadImage = (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No image file received' });
  res.json({ url: `/uploads/${req.file.filename}` });
};
