const jwt = require('jsonwebtoken');
const TempUser = require("../models/TempUser");
const catchAsync = require("../utils/catchAsync");

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

exports.sendOtp = catchAsync(async (req, res, next) => {
    const { name, contact } = req.body
    if (!contact) {
        return res.status(400).json({
            success: false,
            message: 'Contact number is required'
        });
    }

    const tempUser = await TempUser.findOne({ contact });
    if (tempUser) {
        const token = jwt.sign({ id: tempUser._id, contact: tempUser.contact }, JWT_SECRET, {
            expiresIn: '1d'
        });
        return res.status(200).json({
            success: false,
            data: { tempUser, token },
            message: 'User already exists'
        });
    }

    let newtempUser;
    try {
        console.log("Creating TempUser with data:", { name, contact, isVerified: 'false' });
        newtempUser = await TempUser.create({
            name,
            contact,
            isVerified: 'false'
        });
        console.log(newtempUser);
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
        message: 'OTP validated successfully'
    });

    // Send OTP CODE handle
});

exports.validateOtp = catchAsync(async (req, res, next) => {
    const { name, contact, otp } = req.body;
    const OTP = 111111;

    if (!contact) {
        return res.status(400).json({
            success: false,
            message: 'Contact number is required'
        });
    }

    const tempUser = await TempUser.findOne({ contact });
    if (tempUser) {
        if (parseInt(otp) !== OTP) {
            return res.status(400).json({
                success: false,
                message: 'Invalid OTP'
            });
        }

        const token = jwt.sign({ id: tempUser._id, contact: tempUser.contact }, JWT_SECRET, {
            expiresIn: '1d'
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
