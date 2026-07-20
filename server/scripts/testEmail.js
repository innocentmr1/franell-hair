// One-off SMTP connectivity test: node scripts/testEmail.js you@example.com
require('dotenv').config();
const sendEmail = require('../utils/sendEmail');

const to = process.argv[2];
if (!to) {
  console.error('Usage: node scripts/testEmail.js <recipient-email>');
  process.exit(1);
}

console.log(`Sending test email via ${process.env.EMAIL_HOST || 'smtp.hostinger.com'} as ${process.env.EMAIL_USER} → ${to}...`);

sendEmail({
  to,
  subject: 'Franell Hair — SMTP test',
  html: '<p>If you can read this, your EMAIL_HOST / EMAIL_USER / EMAIL_PASS config is working correctly.</p>',
}).then(() => {
  console.log('Done. Check the inbox (and spam folder) for the recipient above.');
  console.log('If nothing arrived and no error was printed, EMAIL_USER/EMAIL_PASS were probably missing — check server/.env.');
});
