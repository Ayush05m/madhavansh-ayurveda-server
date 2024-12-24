const User = require('../models/User');
const Admin = require('../models/Admin')
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const jwt = require('jsonwebtoken');
// const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');

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

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;
    // console.log('Login attempt with:', { email, password });

    if (!email || !password) {
        console.log('Missing email or password');
        return res.status(400).json({
            success: false,
            message: 'Please provide email and password'
        });
    }

    // Explicitly select the password field
    // const user = await User.find()
    // console.log('User found:', user );
    const user = await User.findOne({ email }).select('+password');
    // const user = await User.findOne({ email });
    // console.log('User found:', user );
    // console.log('User found:', user ? 'Yes' : 'No');

    // const existingUser = await User.find();
    // console.log('Existing users:', existingUser);


    if (!user) {
        console.log('No user found with this email');
        return res.status(401).json({
            success: false,
            message: 'Invalid email'
        });
    }

    // console.log('User found:', user);

    const isPasswordValid = await user.comparePassword(password);


    if (!isPasswordValid) {
        console.log('Invalid password');
        return res.status(401).json({
            success: false,
            message: 'Invalid password'
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
        data: {
            user: {
                _id: user._id,
                patientId: user._id,
                name: user.name,
                email: user.email,
                age: user.age,
                phone: user.phone,
                role: user.role
            }
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

exports.getMe = catchAsync(async (req, res, next) => {
    // console.log(req);
    // console.log("hello")

    res.status(200).json({
        success: true,
    });
});

exports.adminLogin = catchAsync(async (req, res, next) => {
    try {
        const { email, password } = req.body;
        console.log('Login attempt with:', { email, password });

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        const admin = await Admin.findOne({ email }).select('+password');
        console.log('Admin details:', {
            found: !!admin,
            storedPassword: admin ? admin.password : null
        });

        if (!admin) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        const isPasswordValid = await admin.comparePassword(password);
        console.log('Password comparison result:', isPasswordValid);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        const token = signToken(admin._id);

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 24 * 60 * 60 * 1000
        });

        res.status(200).json({
            success: true,
            token,
            user: admin
        });
    } catch (error) {
        console.error('Login error:', error);
        next(error);
    }
});

exports.registerAdmin = catchAsync(async (req, res, next) => {
    try {
        const { name, email, password, phone } = req.body;
        console.log('Registering new admin with email:', email);

        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            return res.status(400).json({
                success: false,
                message: 'Email already registered'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        console.log('Generated hash:', hashedPassword);

        const admin = await Admin.create({
            name,
            email,
            password: hashedPassword,
            phone
        });

        const token = signToken(admin._id);

        res.status(201).json({
            success: true,
            admin: {
                _id: admin._id,
                name: admin.name,
                email: admin.email,
                phone: admin.phone
            },
            token
        });
    } catch (error) {
        console.error('Registration error:', error);
        next(error);
    }
});