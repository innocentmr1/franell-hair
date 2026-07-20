const nodemailer = require('nodemailer');

let transporter = null;
const getTransporter = () => {
  if (!transporter) {
    const port = Number(process.env.EMAIL_PORT) || 465;
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.hostinger.com',
      port,
      // Port 465 uses implicit TLS; 587 (and others) use STARTTLS instead.
      secure: process.env.EMAIL_SECURE ? process.env.EMAIL_SECURE === 'true' : port === 465,
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });
  }
  return transporter;
};

// Best-effort send: logs and returns rather than throwing, so a broken/missing
// email config never blocks an order from being placed.
const sendEmail = async ({ to, subject, html }) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn(`Email not configured (EMAIL_USER/EMAIL_PASS missing) — skipped "${subject}" to ${to}`);
    return;
  }
  try {
    await getTransporter().sendMail({
      from: `"Franell Hair" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
  } catch (err) {
    console.error(`Failed to send email "${subject}" to ${to}:`, err.message);
  }
};

module.exports = sendEmail;
