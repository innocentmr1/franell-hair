const express = require('express');
const router  = express.Router();
const { getAnnouncement, updateAnnouncement } = require('../controllers/settingController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/announcement',           getAnnouncement);
router.put('/announcement', protect, admin, updateAnnouncement);

module.exports = router;
