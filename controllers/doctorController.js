const Doctor = require('../models/doctors');
const catchAsync = require('../utils/catchAsync');

exports.getAllActiveDoctors = catchAsync(async (req, res) => {
    const doctors = await Doctor.find({ status: "active" })
    // .sort('name');
    console.log("doctors     ", doctors);

    res.json({
        success: true,
        count: doctors.length,
        data: { doctors: doctors }
    });
});

exports.getDoctorById = catchAsync(async (req, res) => {
    const doctor = await Doctor.findById(req.params.id).select('-password');

    if (!doctor) {
        return res.status(404).json({
            success: false,
            message: 'Doctor not found'
        });
    }

    res.json({
        success: true,
        data: doctor
    });
});

