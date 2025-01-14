const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/auth');
const {
    getAllActiveDoctors,
    getDoctorById,
} = require('../controllers/doctorController');

router.route('/active').get(getAllActiveDoctors)
router.route('/:id').get(getDoctorById)

// Admin routes protected by auth middleware and restricted to admin

module.exports = router; 