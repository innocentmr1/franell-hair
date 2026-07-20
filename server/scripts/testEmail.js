// One-off Resend connectivity test: node scripts/testEmail.js you@example.com
require('dotenv').config();
const sendEmail = require('../utils/sendEmail');

const to = process.argv[2];
if (!to) {
  console.error('Usage: node scripts/testEmail.js <recipient-email>');
  process.exit(1);
}

console.log(`Sending test email via Resend as ${process.env.EMAIL_FROM || 'onboarding@resend.dev'} → ${to}...`);

sendEmail({
  to,
  subject: 'Franell Hair — Resend test',
  html: '<p>If you can read this, your RESEND_API_KEY / EMAIL_FROM config is working correctly.</p>',
}).then(() => {
  console.log('Done. Check the inbox (and spam folder) for the recipient above.');
  console.log('If nothing arrived and no error was printed, RESEND_API_KEY was probably missing — check server/.env.');
});
