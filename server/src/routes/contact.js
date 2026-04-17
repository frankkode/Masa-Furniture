/**
 * POST /api/contact
 * Receives contact-form submissions and emails them to the admin.
 */
const router = require('express').Router();
const { send, ADMIN_EMAIL } = require('../services/mailer');

router.post('/', async (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'name, email and message are required' });
  }

  const subj = subject ? `[Contact] ${subject}` : `[Contact] Message from ${name}`;

  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
      <h2 style="color:#1a1a2e">New contact form message</h2>
      <table style="width:100%;border-collapse:collapse">
        <tr><td style="padding:6px;font-weight:bold;width:100px">Name</td><td style="padding:6px">${name}</td></tr>
        <tr style="background:#f5f5f0"><td style="padding:6px;font-weight:bold">Email</td><td style="padding:6px"><a href="mailto:${email}">${email}</a></td></tr>
        <tr><td style="padding:6px;font-weight:bold">Subject</td><td style="padding:6px">${subject || '—'}</td></tr>
      </table>
      <div style="margin-top:16px;padding:16px;background:#f5f5f0;border-radius:8px;white-space:pre-wrap">${message}</div>
      <p style="font-size:12px;color:#999;margin-top:24px">Sent via Masa Furniture contact form</p>
    </div>`;

  await send({
    to:      ADMIN_EMAIL,
    subject: subj,
    html,
    text: `From: ${name} <${email}>\n\n${message}`,
  });

  res.json({ ok: true, message: 'Message sent successfully' });
});

module.exports = router;
