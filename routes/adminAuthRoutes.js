const express = require('express');
const router = express.Router();
const { adminLogin, logout, getMe, registerAdmin } = require('../controllers/authController');
const { protect, restrictTo } = require('../middleware/auth');

// Admin registration route
router.post('/register', registerAdmin);

// Existing routes
router.post('/login', adminLogin);
const protectedRouter = express.Router();
protectedRouter.use(protect);
protectedRouter.post('/logout', logout);
protectedRouter.get('/check', restrictTo('admin'), getMe);

router.use('/', protectedRouter);

module.exports = router;