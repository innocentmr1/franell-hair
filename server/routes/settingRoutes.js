const express = require('express');
const router  = express.Router();
const { getAnnouncement, updateAnnouncement, getPerks, updatePerks, getHeroPill, updateHeroPill, getAboutPage, updateAboutPage } = require('../controllers/settingController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/announcement',           getAnnouncement);
router.put('/announcement', protect, admin, updateAnnouncement);

router.get('/perks',                  getPerks);
router.put('/perks',       protect, admin, updatePerks);

router.get('/hero-pill',              getHeroPill);
router.put('/hero-pill',   protect, admin, updateHeroPill);

router.get('/about-page',             getAboutPage);
router.put('/about-page',  protect, admin, updateAboutPage);

module.exports = router;
