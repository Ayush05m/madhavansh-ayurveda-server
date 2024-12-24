const express = require('express');
const router = express.Router();
const { 
    createConsultation,
    getConsultations,
    getConsultation,
    updateConsultationStatus
} = require('../controllers/consultationController');
const { protect, restrictTo } = require('../middleware/auth');

router.post('/', createConsultation);
router.get('/:id', getConsultation);

// All routes are protected
router.use(protect);

router.get('/user/:id', protect, getConsultations);

router.patch('/:id/status', restrictTo('admin', 'doctor'), updateConsultationStatus);

module.exports = router; 