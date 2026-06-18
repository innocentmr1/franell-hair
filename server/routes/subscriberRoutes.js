const express = require('express');
const router  = express.Router();
const Subscriber = require('../models/Subscriber');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/', async (req, res) => {
  const { email } = req.body;
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return res.status(400).json({ message: 'Valid email required' });
  try {
    await Subscriber.create({ email });
    res.status(201).json({ message: 'Subscribed!' });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: 'Already subscribed' });
    res.status(500).json({ message: err.message });
  }
});

router.post('/stock-alert', async (req, res) => {
  const { productId, email } = req.body;
  if (!email || !productId) return res.status(400).json({ message: 'Email and product required' });
  // Store as a setting key for simplicity
  const Setting = require('../models/Setting');
  const key = `stock_alert_${productId}`;
  const existing = await Setting.findOne({ key });
  const emails = existing ? JSON.parse(existing.value) : [];
  if (!emails.includes(email)) {
    emails.push(email);
    await Setting.findOneAndUpdate({ key }, { value: JSON.stringify(emails) }, { upsert: true });
  }
  res.json({ message: 'You will be notified when back in stock.' });
});

router.get('/', protect, admin, async (req, res) => {
  const subs = await Subscriber.find().sort('-createdAt');
  res.json(subs);
});

module.exports = router;
