const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');
const jwt = require('jsonwebtoken');

const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '1d'
    });
};

exports.register = catchAsync(async (req, res, next) => {
    try {
        const { name, email, password, age, phone } = req.body;
        
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email already registered'
            });
        }

        const user = await User.create({
            name,
            email,
            password,
            age,
            phone
        });

        const token = signToken(user._id);

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 24 * 60 * 60 * 1000
        });

        res.status(201).json({
            success: true,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                age: user.age,
                phone: user.phone,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Registration failed',
            error: error.message
        });
    }
});

exports.login = catchAsync(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: 'Please provide email and password'
        });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({
            success: false,
            message: 'Invalid email or password'
        });
    }

    const token = signToken(user._id);

    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 24 * 60 * 60 * 1000
    });

    res.json({
        success: true,
        user: {
            id: user._id,
            patientId: user._id,
            name: user.name,
            email: user.email,
            age: user.age,
            phone: user.phone,
            role: user.role
        }
    });
});

exports.logout = catchAsync(async (req, res) => {
    res.cookie('token', 'none', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        expires: new Date(Date.now() + 5 * 1000)
    });

    res.status(200).json({
        success: true,
        message: 'Logged out successfully'
    });
});

exports.getMe = catchAsync(async (req, res) => {
    res.status(200).json({
        success: true,
        user: {
            id: req.user._id,
            patientId: req.user._id,
            name: req.user.name,
            email: req.user.email,
            age: req.user.age,
            phone: req.user.phone,
            role: req.user.role
        }
    });
}); 