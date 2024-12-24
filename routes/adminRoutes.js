const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/auth');
const {
    getDashboardStats,
    getAllUsers,
    getAllDoctors,
    updateUserRole,
    getAllConsultations,
    getConsultationStats
} = require('../controllers/adminController');

const adminAuthRoutes = require('./adminAuthRoutes');

// Admin auth routes
router.use('/auth', adminAuthRoutes);


// Protect all admin routes below this middleware
router.use(protect);

// Dashboard stats
router.get('/dashboard-stats', getDashboardStats);
// Users management
router.get('/users', getAllUsers);
router.patch('/users/:userId/role', updateUserRole);

// Consultations management
router.get('/consultations', getAllConsultations);
router.get('/consultation-stats', getConsultationStats);

module.exports = router;