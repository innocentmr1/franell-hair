const express  = require('express');
const multer   = require('multer');
const path     = require('path');
const fs       = require('fs');
const router   = express.Router();
const { getSlides, addSlide, deleteSlide, reorderSlides } = require('../controllers/heroSlideController');
const { protect, admin } = require('../middleware/authMiddleware');
const verifyFileType = require('../utils/verifyFileType');

const upload = multer({
  storage: multer.memoryStorage(),
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
  if (!verifyFileType(req.file.buffer, req.file.mimetype)) {
    return res.status(400).json({ message: 'File content does not match its declared type' });
  }
  const filename = `hero-${Date.now()}-${Math.round(Math.random() * 1e6)}${path.extname(req.file.originalname)}`;
  fs.writeFileSync(path.join(__dirname, '../public/uploads', filename), req.file.buffer);
  res.json({ imageUrl: `/uploads/${filename}` });
});

router.post('/',            protect, admin, addSlide);
router.delete('/:id',       protect, admin, deleteSlide);
router.put('/reorder',      protect, admin, reorderSlides);

module.exports = router;
