const express = require('express');
const router  = express.Router();
const PromoCode = require('../models/PromoCode');
const { protect, admin } = require('../middleware/authMiddleware');

// Public: validate a code
router.post('/validate', async (req, res) => {
  const { code, orderTotal } = req.body;
  if (!code) return res.status(400).json({ message: 'Code required' });
  const promo = await PromoCode.findOne({ code: code.trim().toUpperCase(), active: true });
  if (!promo) return res.status(404).json({ message: 'Invalid or expired promo code' });
  if (promo.expiresAt && promo.expiresAt < new Date()) return res.status(400).json({ message: 'This promo code has expired' });
  if (promo.maxUses > 0 && promo.usedCount >= promo.maxUses) return res.status(400).json({ message: 'This promo code has reached its usage limit' });
  if (orderTotal !== undefined && orderTotal < promo.minOrder) return res.status(400).json({ message: `Minimum order of $${promo.minOrder.toFixed(2)} required` });
  const discount = promo.type === 'percent'
    ? Math.min((orderTotal || 0) * (promo.value / 100), orderTotal || Infinity)
    : Math.min(promo.value, orderTotal || Infinity);
  res.json({ code: promo.code, type: promo.type, value: promo.value, discount: +discount.toFixed(2), minOrder: promo.minOrder });
});

// Admin: CRUD
router.get('/',      protect, admin, async (req, res) => {
  const codes = await PromoCode.find().sort('-createdAt');
  res.json(codes);
});
router.post('/',     protect, admin, async (req, res) => {
  try {
    const promo = await PromoCode.create(req.body);
    res.status(201).json(promo);
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: 'Code already exists' });
    res.status(500).json({ message: err.message });
  }
});
router.put('/:id',   protect, admin, async (req, res) => {
  const promo = await PromoCode.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!promo) return res.status(404).json({ message: 'Not found' });
  res.json(promo);
});
router.delete('/:id', protect, admin, async (req, res) => {
  await PromoCode.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

module.exports = router;
