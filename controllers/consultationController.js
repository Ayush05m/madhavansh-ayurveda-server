const Consultation = require('../models/Consultation');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

exports.createConsultation = catchAsync(async (req, res) => {
    const consultationFees = {
        'General Consultation': 1000,
        'Follow-up': 800,
        'Specific Treatment': 1500,
        'Emergency': 2000
    };

    const consultation = await Consultation.create({
        ...req.body,
        patient: req.user._id,
        amount: consultationFees[req.body.consultationType] || 1000
    });

    const populatedConsultation = await Consultation.findById(consultation._id)
        .populate('patient', 'name email')
        .populate('doctor', 'name email');

    res.status(201).json({
        success: true,
        data: populatedConsultation
    });
});

exports.getConsultations = catchAsync(async (req, res) => {
    const userId = req.params.userId;
    console.log('User ID:', userId);
    console.log('User Role:', req.user.role);

    let query;
    if (req.user.role === 'doctor') {
        query = { doctorId: userId };
    } else {
        query = { patient: userId };
    }

    console.log('Query:', query);

    try {
        const consultations = await Consultation.find(query)
            .populate({
                path: 'patient',
                select: 'name email'
            })
            .sort('-createdAt');

        console.log('Found consultations:', consultations);

        const transformedConsultations = consultations.map(consultation => {
            const doc = consultation.toObject();
            return {
                ...doc,
                doctorName: `Doctor ${doc.doctorId}`
            };
        });

        res.json({
            success: true,
            count: consultations.length,
            data: transformedConsultations
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
    const consultation = await Consultation.findById(req.params.id)
        .populate('patient', 'name email')
        .populate('doctor', 'name email');

    if (!consultation) {
        return res.status(404).json({
            success: false,
            message: 'Consultation not found'
        });
    }

    if (req.user.role === 'patient' && consultation.patient._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({
            success: false,
            message: 'You do not have permission to view this consultation'
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