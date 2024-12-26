const Consultation = require('../models/Consultation');
const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const TempUser = require('../models/TempUser');
const multer = require('multer');
const path = require('path');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/prescriptions/') // Make sure this directory exists
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`)
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit per file
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.jpg', '.jpeg', '.png'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

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
        user.NoOfConsultations += 1;
        updatedUser = await TempUser.findByIdAndUpdate(user._id, { consultations: user.consultations, NoOfConsultations: user.NoOfConsultations }, { new: true });
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

        // console.log('Found consultations:', consultations);

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
    console.log(req.body);
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

exports.updateConsultation = catchAsync(async (req, res) => {
    const consultation = await Consultation.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
    );

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

exports.uploadPrescription = async (req, res) => {
  try {
    // Handle multiple file upload
    upload.array('prescriptions', 5)(req, res, async (err) => { // Allow up to 5 files
      if (err) {
        return res.status(400).json({ message: err.message });
      }

      const consultationId = req.params.consultationId;
      const files = req.files;

      if (!files || files.length === 0) {
        return res.status(400).json({ message: 'No files uploaded' });
      }

      // Update the consultation with the file paths
      const consultation = await Consultation.findById(consultationId);
      if (!consultation) {
        return res.status(404).json({ message: 'Consultation not found' });
      }

      // Create the file URLs
      const fileUrls = files.map(file => 
        `${process.env.BASE_URL}/uploads/prescriptions/${file.filename}`
      );

      // Update the consultation
      consultation.prescription = {
        ...consultation.prescription,
        files: [
          ...(consultation.prescription?.files || []),
          ...fileUrls
        ],
      };
      await consultation.save();

      res.json({ 
        message: 'Prescriptions uploaded successfully',
        fileUrls 
      });
    });
  } catch (error) {
    console.error('Error uploading prescriptions:', error);
    res.status(500).json({ message: 'Error uploading prescriptions' });
  }
}; 