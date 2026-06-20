const express = require('express');
const router  = express.Router();
const ContactMessage = require('../models/ContactMessage');
const { protect, admin } = require('../middleware/authMiddleware');

// Public — submit a contact message
router.post('/', async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: 'All fields are required.' });
    }
    const msg = await ContactMessage.create({ name, email, subject, message });
    res.status(201).json({ message: 'Message received. We will get back to you within 24 hours.', id: msg._id });
  } catch (err) {
    next(err);
  }
});

// Admin — list all messages
router.get('/', protect, admin, async (req, res, next) => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    next(err);
  }
});

// Admin — mark as read
router.put('/:id/read', protect, admin, async (req, res, next) => {
  try {
    const msg = await ContactMessage.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
    if (!msg) return res.status(404).json({ message: 'Not found' });
    res.json(msg);
  } catch (err) {
    next(err);
  }
});

// Admin — delete
router.delete('/:id', protect, admin, async (req, res, next) => {
  try {
    await ContactMessage.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
