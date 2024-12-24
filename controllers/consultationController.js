const Consultation = require('../models/Consultation');
const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const TempUser = require('../models/TempUser');

exports.createConsultation = catchAsync(async (req, res) => {
    const consultationFees = {
        'General Consultation': 500,
        'Follow-up': 500,
        'Specific Treatment': 500,
        'Emergency': 500
    };

    // console.log(req.body)

    const consultation = await Consultation.create({
        ...req.body,
        amount: consultationFees[req.body.consultationType] || 1000
    });
    let updatedUser;
    let user = await User.findOne({ contact: consultation.contact });
    if (!user) {
        user = await TempUser.findOne({ contact: consultation.contact });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        user.consultations.push(`${consultation._id}`);
        updatedUser = await TempUser.findByIdAndUpdate(user._id, { consultations: user.consultations }, { new: true });
        if (updatedUser.consultations.length > 1) {
            const { name, contact, consultations, isVerified } = updatedUser;
            try {
                const newUser = await User.create({ name, contact, consultations, isVerified });
                console.log(newUser);
            }
            catch (error) {
                console.log(error);
                res.json({
                    success: true,
                    data: consultation,
                    message: "COnsultation Booked, Failed to create permanent user"
                })

            }
        }
    } else {
        user.consultations.push(`${consultation._id}`);
        updatedUser = await User.findByIdAndUpdate(user._id, { consultations: user.consultations }, { new: true });
    }

    if (!updatedUser) {
        return res.status(500).json({
            success: false,
            message: 'Failed to update user consultations'
        });
    }


    res.status(201).json({
        success: true,
        data: consultation
    });
});

exports.getConsultations = catchAsync(async (req, res) => {
    const contact = req.params.id;
    // console.log('User Role:', req);

    try {
        const consultations = await Consultation.find({ contact })
            .sort('-createdAt');

        console.log('Found consultations:', consultations);

        res.json({
            success: true,
            count: consultations.length,
            data: consultations
        });
    } catch (error) {
        console.error('Error fetching consultations:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching consultations',
            error: error.message
        });
    }
});

exports.getConsultation = catchAsync(async (req, res) => {
    // console.log(req.params.id);

    const consultation = await Consultation.findById(req.params.id)


    if (!consultation) {
        return res.status(404).json({
            success: false,
            message: 'Consultation not found'
        });
    }

    res.json({
        success: true,
        data: consultation
    });
});

exports.updateConsultationStatus = catchAsync(async (req, res) => {
    const { status } = req.body;

    const consultation = await Consultation.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true, runValidators: true }
    ).populate('patient', 'name email')
        .populate('doctor', 'name email');

    if (!consultation) {
        return res.status(404).json({
            success: false,
            message: 'Consultation not found'
        });
    }

    res.json({
        success: true,
        data: consultation
    });
}); 