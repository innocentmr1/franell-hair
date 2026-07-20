// Uses Resend's HTTPS API instead of raw SMTP — Render (and many free/starter
// cloud tiers) block outbound SMTP ports entirely to prevent spam abuse, which
// no amount of DNS/IP tuning can work around. HTTPS on port 443 is never
// blocked the same way.
const RESEND_API_URL = 'https://api.resend.com/emails';

// Falls back to Resend's own sending domain until www.franellhair.com is
// verified on Resend (Settings → Domains) and EMAIL_FROM is set to an
// address on that domain, e.g. "Franell Hair <info@franellhair.com>".
const DEFAULT_FROM = 'Franell Hair <onboarding@resend.dev>';

// Best-effort send: logs and returns rather than throwing, so a broken/missing
// email config never blocks an order from being placed.
const sendEmail = async ({ to, subject, html }) => {
  if (!process.env.RESEND_API_KEY) {
    console.warn(`Email not configured (RESEND_API_KEY missing) — skipped "${subject}" to ${to}`);
    return;
  }
  try {
    const res = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || DEFAULT_FROM,
        to,
        subject,
        html,
      }),
    });
    if (!res.ok) {
      throw new Error(`Resend API ${res.status}: ${await res.text()}`);
    }
  } catch (err) {
    console.error(`Failed to send email "${subject}" to ${to}:`, err.message);
  }
};

module.exports = sendEmail;
