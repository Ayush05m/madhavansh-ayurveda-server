const jwt = require('jsonwebtoken');
const TempUser = require("../models/TempUser");
const catchAsync = require("../utils/catchAsync");
const { sendOtpEmail } = require('./SendMailController');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

exports.sendOtp = catchAsync(async (req, res, next) => {
    const { name, contact, email } = req.body;
    if (!contact || !email) {
        return res.status(400).json({
            success: false,
            message: 'Contact and email is required'
        });
    }

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000);

    const tempUser = await TempUser.findOne({ contact });
    if (tempUser) {
        // Update existing temp user with new OTP
        tempUser.otp = otp;
        await tempUser.save();

        // Send OTP email
        await sendOtpEmail(email, otp);

        const token = jwt.sign({ id: tempUser._id, contact: tempUser.contact, email: tempUser.email }, JWT_SECRET, {
            expiresIn: '1h'
        });
        return res.status(200).json({
            success: true,
            data: { tempUser, token },
            message: 'OTP sent successfully'
        });
    }

    let newtempUser;
    try {
        newtempUser = await TempUser.create({
            name,
            contact,
            email,
            otp,
            isVerified: false
        });

        // Send OTP email
        await sendOtpEmail(email, otp);

    } catch (error) {
        console.log("Unable to create tempUser", error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Internal Server Error'
        });
    }

    res.status(200).json({
        success: true,
        data: newtempUser,
        message: 'OTP sent successfully'
    });
});

exports.validateOtp = catchAsync(async (req, res, next) => {
    const { contact, email, otp } = req.body;
    console.log(req.body);
    
    if (!contact || !email) {
        return res.status(400).json({
            success: false,
            message: 'Contact and email is required'
        });
    }

    const tempUser = await TempUser.findOne({ contact });
    if (tempUser) {
        if (parseInt(otp) !== tempUser.otp) {
            return res.status(400).json({
                success: false,
                message: 'Invalid OTP'
            });
        }

        // Mark user as verified
        tempUser.isVerified = true;
        await tempUser.save();

        const token = jwt.sign({ id: tempUser._id, contact: tempUser.contact }, JWT_SECRET, {
            expiresIn: '4h'
        });

        return res.status(200).json({
            success: true,
            data: {
                tempUser,
                token,
            },
            message: 'OTP validated successfully'
        });
    }

    return res.status(404).json({
        success: false,
        message: 'User not found'
    });
});
