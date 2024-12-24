const Doctor = require('../models/doctors');
const catchAsync = require('../utils/catchAsync');

exports.createDoctor = catchAsync(async (req, res) => {
    const doctor = await Doctor.create(req.body);
    res.status(201).json({
        success: true,
        data: doctor
    });
});

exports.getAllDoctors = catchAsync(async (req, res) => {
    const doctors = await Doctor.find()
    // .sort('name');
    // console.log("doctors     ", doctors);

    res.json({
        success: true,
        count: doctors.length,
        data: doctors
    });
});

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

exports.updateDoctor = catchAsync(async (req, res) => {
    const doctor = await Doctor.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
    ).select('-password');

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

exports.updateDoctorStatus = catchAsync(async (req, res) => {
    const { status } = req.body;
    const doctor = await Doctor.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true }
    ).select('-password');

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

exports.updateAvailability = catchAsync(async (req, res) => {
    const { availability } = req.body;
    const doctor = await Doctor.findByIdAndUpdate(
        req.params.id,
        { availability },
        { new: true }
    ).select('-password');

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