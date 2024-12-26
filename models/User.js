const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    // patientId: {
    //     type: String,
    //     unique: true,
    //     required: true
    // },
    name: {
        type: String,
        required: [true, 'Please provide a name']
    },
    email: {
        type: String,
        lowercase: true,
        sparse: true
    },
    password: {
        type: String,
        minlength: 6,
        select: false
    },
    age: {
        type: Number
    },
    contact: {
        type: String,
        unique: true,
        required: [true, 'Please provide phone number']
    },
    consultations: {
        type: [String],
    },
    NoOfConsultations: {
        type: Number,
        default: 0
    },
    isVerified: {
        type: Boolean,
        default: false
    },
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema); 