const express = require('express');
const router = express.Router();
const {
  createOrder, getMyOrders, getOrderById,
  payOrder, getAllOrders, updateOrderStatus, sendReviewReminders,
} = require('../controllers/orderController');
const { protect, optionalAuth, admin } = require('../middleware/authMiddleware');

// Guest checkout: order creation, viewing, and payment confirmation work for
// both logged-in and anonymous customers.
router.route('/').post(optionalAuth, createOrder).get(protect, admin, getAllOrders);
router.get('/myorders', protect, getMyOrders);
// Must come before /:id so "send-review-reminders" isn't swallowed as an id param
router.post('/send-review-reminders', sendReviewReminders);
router.route('/:id').get(optionalAuth, getOrderById);
router.put('/:id/pay', optionalAuth, payOrder);
router.put('/:id/status', protect, admin, updateOrderStatus);

module.exports = router;
