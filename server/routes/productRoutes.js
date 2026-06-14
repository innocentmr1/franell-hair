const express = require('express');
const router = express.Router();
const {
  getProducts, getFeaturedProducts, getProduct,
  createProduct, updateProduct, deleteProduct, addReview, getTopReviews, getBestseller, getSiteStats,
} = require('../controllers/productController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/top-reviews', getTopReviews);
router.get('/bestseller', getBestseller);
router.get('/stats', getSiteStats);
router.post('/', protect, admin, createProduct);
router.route('/:id')
  .get(getProduct)
  .put(protect, admin, updateProduct)
  .delete(protect, admin, deleteProduct);
router.post('/:id/reviews', protect, addReview);

module.exports = router;
