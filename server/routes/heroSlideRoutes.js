const express  = require('express');
const multer   = require('multer');
const path     = require('path');
const router   = express.Router();
const { getSlides, addSlide, deleteSlide, reorderSlides } = require('../controllers/heroSlideController');
const { protect, admin } = require('../middleware/authMiddleware');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../public/uploads')),
  filename:    (req, file, cb) => {
    const unique = `hero-${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    cb(null, unique + path.extname(file.originalname));
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 }, // 8 MB
  fileFilter: (req, file, cb) => {
    if (/image\/(jpeg|jpg|png|webp|gif)/.test(file.mimetype)) cb(null, true);
    else cb(new Error('Images only'));
  },
});

router.get('/', getSlides);

// Upload a local file → returns { imageUrl }
router.post('/upload', protect, admin, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  const imageUrl = `/uploads/${req.file.filename}`;
  res.json({ imageUrl });
});

router.post('/',            protect, admin, addSlide);
router.delete('/:id',       protect, admin, deleteSlide);
router.put('/reorder',      protect, admin, reorderSlides);

module.exports = router;
