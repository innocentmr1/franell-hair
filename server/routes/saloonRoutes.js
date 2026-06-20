const express = require('express');
const router  = express.Router();
const Saloon  = require('../models/Saloon');
const { protect, admin } = require('../middleware/authMiddleware');

// Public — get active saloons
router.get('/', async (req, res) => {
  try {
    const saloons = await Saloon.find({ active: true }).sort('name');
    res.json(saloons);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin — get all saloons
router.get('/all', protect, admin, async (req, res) => {
  try {
    const saloons = await Saloon.find().sort('-createdAt');
    res.json(saloons);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin — create
router.post('/', protect, admin, async (req, res) => {
  try {
    const saloon = await Saloon.create(req.body);
    res.status(201).json(saloon);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Admin — update
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const saloon = await Saloon.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!saloon) return res.status(404).json({ message: 'Not found' });
    res.json(saloon);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Admin — delete
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    await Saloon.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
