const express = require('express');
const router  = express.Router();
const { getAnnouncement, updateAnnouncement, getPerks, updatePerks, getHeroPill, updateHeroPill } = require('../controllers/settingController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/announcement',           getAnnouncement);
router.put('/announcement', protect, admin, updateAnnouncement);

router.get('/perks',                  getPerks);
router.put('/perks',       protect, admin, updatePerks);

router.get('/hero-pill',              getHeroPill);
router.put('/hero-pill',   protect, admin, updateHeroPill);

module.exports = router;
