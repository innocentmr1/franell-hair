const AbandonedCart = require('../models/AbandonedCart');
const sendEmail = require('../utils/sendEmail');
const { abandonedCartEmail } = require('../utils/emailTemplates');

// Called from checkout right before payment — captures enough to send a
// recovery email later. Not security/financial-sensitive (nothing is
// charged from this data), so validation stays light.
const recordAbandonedCart = async (req, res) => {
  const { email, name, items, subtotal } = req.body;
  if (
    typeof email !== 'string' || !email.trim() ||
    !Array.isArray(items) || !items.length
  ) {
    return res.status(400).json({ message: 'Invalid request' });
  }

  await AbandonedCart.findOneAndUpdate(
    { email: email.trim().toLowerCase() },
    {
      email: email.trim().toLowerCase(),
      name: typeof name === 'string' ? name.trim().slice(0, 200) : '',
      items: items.slice(0, 20).map((i) => ({
        product: i.product,
        name: String(i.name || '').slice(0, 200),
        image: i.image || '',
        price: Number(i.price) || 0,
        qty: Number(i.qty) || 1,
      })),
      subtotal: Number(subtotal) || 0,
      reminderSentAt: null, // a fresh attempt deserves a fresh reminder window
    },
    { upsert: true }
  );

  res.status(204).end();
};

const ABANDON_DELAY_MS = 2 * 60 * 60 * 1000; // 2 hours

// Called by an external scheduler, authenticated via a shared secret header
// rather than the normal JWT flow — same pattern as sendReviewReminders.
const sendAbandonedCartReminders = async (req, res) => {
  if (req.headers['x-cron-secret'] !== process.env.CRON_SECRET || !process.env.CRON_SECRET) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  const cutoff = new Date(Date.now() - ABANDON_DELAY_MS);
  const carts = await AbandonedCart.find({ updatedAt: { $lte: cutoff }, reminderSentAt: null });

  let sent = 0;
  for (const cart of carts) {
    const { subject, html } = abandonedCartEmail(cart);
    sendEmail({ to: cart.email, subject, html });
    cart.reminderSentAt = new Date();
    await cart.save();
    sent += 1;
  }

  res.json({ checked: carts.length, sent });
};

module.exports = { recordAbandonedCart, sendAbandonedCartReminders };
