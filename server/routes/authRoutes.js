const express = require('express');
const router = express.Router();
const { register, login, forgotPassword, resetPassword, verifyEmail, resendOtp, getProfile, updateProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/rateLimit');

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password/:token', authLimiter, resetPassword);
router.post('/verify-email', protect, authLimiter, verifyEmail);
router.post('/resend-otp', protect, authLimiter, resendOtp);
router.route('/profile').get(protect, getProfile).put(protect, updateProfile);

module.exports = router;
