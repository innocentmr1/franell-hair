const express = require('express');
const router = express.Router();
const { recordVisit, getVisitStats } = require('../controllers/visitController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/', recordVisit);
router.get('/stats', protect, admin, getVisitStats);

module.exports = router;
