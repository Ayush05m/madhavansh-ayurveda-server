const express = require('express');
const router = express.Router();
const { 
    createConsultation,
    getConsultations,
    getConsultation,
    updateConsultationStatus
} = require('../controllers/consultationController');
const { protect, restrictTo } = require('../middleware/auth');

// All routes are protected
router.use(protect);

// Routes
router.post('/', createConsultation);
router.get('/user/:userId', protect, getConsultations);
router.get('/:id', protect, getConsultation);
router.patch('/:id/status', restrictTo('admin', 'doctor'), updateConsultationStatus);

module.exports = router; 