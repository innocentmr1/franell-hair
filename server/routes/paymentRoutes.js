const express = require('express');
const router = express.Router();
const { createPaymentIntent } = require('../controllers/paymentController');
const { optionalAuth } = require('../middleware/authMiddleware');
const { paymentLimiter } = require('../middleware/rateLimit');

router.post('/create-payment-intent', paymentLimiter, optionalAuth, createPaymentIntent);

module.exports = router;
