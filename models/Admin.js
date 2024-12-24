const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name']
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 6,
        select: false
    },
    phone: {
        type: String,
        required: [true, 'Please provide phone number']
    }
}, {
    timestamps: true
});

adminSchema.virtual('role').get(function () {
    return 'admin'; // Always return 'admin' as the role
});

// Hash password before saving
adminSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

// Compare password method
adminSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Static method to create an admin
adminSchema.statics.createAdmin = async function (name, email, password, phone) {
    const existingAdmin = await this.findOne({ email });
    if (existingAdmin) {
        console.log('Admin with this email already exists.');
        return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const admin = await this.create({
        name,
        email,
        password: hashedPassword,
        phone
    });

    console.log('Admin created:', admin);
};

module.exports = mongoose.model('Admin', adminSchema); 