const express = require('express');
const router = express.Router();
const { createPaymentIntent } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');
const { paymentLimiter } = require('../middleware/rateLimit');

router.post('/create-payment-intent', paymentLimiter, protect, createPaymentIntent);

module.exports = router;
