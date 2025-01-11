const Doctor = require('../models/doctors');
const catchAsync = require('../utils/catchAsync');

exports.createDoctor = catchAsync(async (req, res) => {
    try {
        console.log(req.body);

        const doctorData = {
            ...req.body,
            availability: {
                days: req.body.availability.days,
                slots: req.body.availability.slots.map(daySlots =>
                    daySlots.map(slot => ({
                        startTime: slot.startTime,
                        endTime: slot.endTime,
                        isBooked: false
                    }))
                )
            }
        };

        const doctor = await Doctor.create(doctorData);
        res.status(201).json({
            status: 'success',
            data: doctor
        });
    } catch (error) {
        console.error('Doctor creation error:', error);
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

exports.getAllDoctors = catchAsync(async (req, res) => {
    // const doctors = await Doctor.find()
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const [doctors, count] = await Promise.all([
        Doctor.find().sort("-createdAt").skip(skip).limit(limit),
        Doctor.countDocuments(),
    ]);
    // .sort('name');
    // console.log("doctors     ", doctors);

    res.json({
        success: true,
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        count: count,
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