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
router.use(restrictTo('admin'));

router.route('/').get(getAllDoctors)
router.post('/', createDoctor);
router.put('/:id', updateDoctor);
router.patch('/:id/status', updateDoctorStatus);
router.patch('/:id/availability', updateAvailability);

module.exports = router; 