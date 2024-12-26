const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/auth');
const {
    createDoctor,
    getAllDoctors,
    getAllActiveDoctors,
    getDoctorById,
    updateDoctor,
    updateDoctorStatus,
    updateAvailability
} = require('../controllers/doctorController');

router.route('/active').get(getAllActiveDoctors)
router.route('/:id').get(getDoctorById)

// Admin routes protected by auth middleware and restricted to admin
router.use(protect);

router.get('/', getAllDoctors)
router.post('/', createDoctor);
router.put('/:id', updateDoctor);
router.patch('/:id/availability', updateAvailability);

module.exports = router; 