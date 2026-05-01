/**
 * Mailer service — Nodemailer wrapper
 *
 * Dev (no SMTP env vars): uses Ethereal test accounts.
 *   Preview URLs are printed to the server console.
 *
 * Prod: set these env vars in .env / Vercel dashboard:
 *   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM
 */
const nodemailer = require('nodemailer');

let _transport = null;

async function getTransport() {
  if (_transport) return _transport;

  if (process.env.SMTP_HOST) {
    _transport = nodemailer.createTransport({
      host:   process.env.SMTP_HOST,
      port:   Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // Auto-create Ethereal test account — no config needed in dev
    const test = await nodemailer.createTestAccount();
    _transport = nodemailer.createTransport({
      host:   'smtp.ethereal.email',
      port:   587,
      secure: false,
      auth: { user: test.user, pass: test.pass },
    });
    console.log('[mailer] Dev mode — using Ethereal test account:', test.user);
  }

  return _transport;
}

const FROM = process.env.EMAIL_FROM || '"Masa Furniture" <hello@masa.fi>';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@masa.fi';

/**
 * Send an email. Logs preview URL in dev.
 * Swallow errors so a mailer failure never breaks an API response.
 */
async function send({ to, subject, html, text }) {
  try {
    const transport = await getTransport();
    const info = await transport.sendMail({ from: FROM, to, subject, html, text });
    const preview = nodemailer.getTestMessageUrl(info);
    if (preview) console.log('[mailer] Preview:', preview);
    return info;
  } catch (err) {
    console.error('[mailer] Send failed:', err.message);
  }
}

/* ── Templated emails ─────────────────────────────────────── */

function orderConfirmationHtml(order, items) {
  const rows = items.map(i => `
    <tr>
      <td style="padding:8px;border-bottom:1px solid #eee">${i.name}${i.color ? ` — ${i.color}` : ''}${i.size ? ` / ${i.size}` : ''}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:center">${i.quantity}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">€${Number(i.unit_price).toFixed(2)}</td>
    </tr>`).join('');

  return `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#1a1a2e">
      <div style="background:#1a1a2e;padding:24px;text-align:center">
        <h1 style="color:#c8a96e;margin:0;font-size:24px">Masa Furniture</h1>
      </div>
      <div style="padding:32px">
        <h2 style="color:#1a1a2e">Order Confirmed! 🎉</h2>
        <p>Thank you for your order. Here's a summary:</p>
        <p><strong>Order #${String(order.id).padStart(5,'0')}</strong></p>
        <table style="width:100%;border-collapse:collapse">
          <thead>
            <tr style="background:#f5f5f0">
              <th style="padding:8px;text-align:left">Product</th>
              <th style="padding:8px;text-align:center">Qty</th>
              <th style="padding:8px;text-align:right">Price</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        <div style="margin-top:16px;text-align:right">
          <p>Subtotal: <strong>€${Number(order.subtotal).toFixed(2)}</strong></p>
          <p>Shipping: <strong>€${Number(order.shipping_cost).toFixed(2)}</strong></p>
          <p style="font-size:18px">Total: <strong style="color:#c8a96e">€${Number(order.total_price).toFixed(2)}</strong></p>
        </div>
        <p style="margin-top:24px">We'll notify you when your order ships. Thank you for choosing Masa Furniture!</p>
      </div>
      <div style="background:#f5f5f0;padding:16px;text-align:center;font-size:12px;color:#666">
        © ${new Date().getFullYear()} Masa Furniture · Finland
      </div>
    </div>`;
}

function orderStatusHtml(order) {
  const labels = { pending:'Pending',confirmed:'Confirmed',processing:'Processing',shipped:'Shipped 🚚',delivered:'Delivered ✅',cancelled:'Cancelled' };
  return `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#1a1a2e">
      <div style="background:#1a1a2e;padding:24px;text-align:center">
        <h1 style="color:#c8a96e;margin:0;font-size:24px">Masa Furniture</h1>
      </div>
      <div style="padding:32px">
        <h2>Order Update</h2>
        <p>Your order <strong>#${String(order.id).padStart(5,'0')}</strong> status has changed to:</p>
        <div style="background:#f5f5f0;border-radius:12px;padding:16px;text-align:center;font-size:20px;font-weight:bold;color:#c8a96e">
          ${labels[order.status] || order.status}
        </div>
        ${order.status === 'delivered' ? '<p style="margin-top:16px">We hope you love your new furniture! If you enjoyed it, please leave a review on our site.</p>' : ''}
      </div>
    </div>`;
}

module.exports = { send, FROM, ADMIN_EMAIL, orderConfirmationHtml, orderStatusHtml };
