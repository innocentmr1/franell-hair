const express = require('express');
const router = express.Router();
const { recordAbandonedCart, sendAbandonedCartReminders } = require('../controllers/abandonedCartController');

router.post('/', recordAbandonedCart);
router.post('/send-reminders', sendAbandonedCartReminders);

module.exports = router;
