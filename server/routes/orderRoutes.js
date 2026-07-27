const express = require('express');
const router = express.Router();
const {
  createOrder, getMyOrders, getOrderById,
  payOrder, getAllOrders, updateOrderStatus, sendReviewReminders,
} = require('../controllers/orderController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').post(protect, createOrder).get(protect, admin, getAllOrders);
router.get('/myorders', protect, getMyOrders);
// Must come before /:id so "send-review-reminders" isn't swallowed as an id param
router.post('/send-review-reminders', sendReviewReminders);
router.route('/:id').get(protect, getOrderById);
router.put('/:id/pay', protect, payOrder);
router.put('/:id/status', protect, admin, updateOrderStatus);

module.exports = router;
