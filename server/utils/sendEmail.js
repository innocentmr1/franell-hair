const nodemailer = require('nodemailer');
const dns = require('dns').promises;

// Some hosts (e.g. Render) have no outbound IPv6 route. Node's Happy-Eyeballs
// connection logic can still pick the AAAA record for smtp.hostinger.com and
// fail with ENETUNREACH before ever trying IPv4 — setDefaultResultOrder alone
// doesn't prevent that. So resolve the IPv4 address ourselves and connect to
// it directly, passing the original hostname as the TLS servername (SNI) so
// certificate validation still matches.
let transporterPromise = null;
const getTransporter = () => {
  if (!transporterPromise) {
    transporterPromise = (async () => {
      const hostname = process.env.EMAIL_HOST || 'smtp.hostinger.com';
      const port = Number(process.env.EMAIL_PORT) || 465;
      const secure = process.env.EMAIL_SECURE ? process.env.EMAIL_SECURE === 'true' : port === 465;

      let host = hostname;
      try {
        const [ipv4] = await dns.resolve4(hostname);
        if (ipv4) host = ipv4;
      } catch (err) {
        console.warn(`Could not resolve IPv4 address for ${hostname}, connecting by hostname instead:`, err.message);
      }

      return nodemailer.createTransport({
        host,
        port,
        secure,
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
        tls: { servername: hostname },
      });
    })();
  }
  return transporterPromise;
};

// Best-effort send: logs and returns rather than throwing, so a broken/missing
// email config never blocks an order from being placed.
const sendEmail = async ({ to, subject, html }) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn(`Email not configured (EMAIL_USER/EMAIL_PASS missing) — skipped "${subject}" to ${to}`);
    return;
  }
  try {
    const transporter = await getTransporter();
    await transporter.sendMail({
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
