const express = require('express');
const multer  = require('multer');
const path    = require('path');
const router = express.Router();
const {
  getProducts, getFeaturedProducts, getProduct,
  createProduct, updateProduct, deleteProduct, addReview, getTopReviews, getBestseller, getSiteStats, getRelatedProducts,
} = require('../controllers/productController');
const { protect, admin } = require('../middleware/authMiddleware');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../public/uploads')),
  filename: (req, file, cb) => {
    const unique = `prod-${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    cb(null, unique + path.extname(file.originalname));
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (/^(image\/(jpeg|jpg|png|webp|gif)|video\/(mp4|webm|quicktime))$/.test(file.mimetype)) cb(null, true);
    else cb(new Error('Images and videos only'));
  },
});

router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/top-reviews', getTopReviews);
router.get('/bestseller', getBestseller);
router.get('/stats', getSiteStats);
router.post('/upload', protect, admin, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  res.json({ url: `/uploads/${req.file.filename}` });
});
router.post('/', protect, admin, createProduct);
router.route('/:id')
  .get(getProduct)
  .put(protect, admin, updateProduct)
  .delete(protect, admin, deleteProduct);
router.get('/:id/related', getRelatedProducts);
router.post('/:id/reviews', protect, addReview);

module.exports = router;
