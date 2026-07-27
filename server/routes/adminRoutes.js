const express = require('express');
const router  = express.Router();
const { getStats, getUsers, deleteUser, getAuditLog } = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

router.use(protect, admin);
router.get('/stats', getStats);
router.get('/users', getUsers);
router.delete('/users/:id', deleteUser);
router.get('/audit-log', getAuditLog);

module.exports = router;
