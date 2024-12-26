const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const doctorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name']
    },
    email: {
        type: String,
        unique: true,
        lowercase: true
    },
    phone: {
        type: String,
        required: [true, 'Please provide phone number']
    },
    specialization: {
        type: String,
        required: [true, 'Please provide specialization'],
        enum: ['Ayurveda', 'Panchakarma', 'Yoga', 'General']
    },
    qualification: {
        type: String,
    },
    experience: {
        type: Number,
        required: [true, 'Please provide years of experience']
    },
    registrationNumber: {
        type: String,
        required: [true, 'Please provide registration number'],
        unique: true
    },
    availability: [{
        days: {
            type: [String],
            enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        },
        slots: [[{
            startTime: String,
            endTime: String,
            isBooked: {
                type: Boolean,
                default: false
            }
        }]]
    }],
    status: {
        type: String,
        enum: ['active', 'inactive', 'on-leave'],
        default: 'active'
    },
    // consultationFee: {
    //     type: Number,
    //     required: [true, 'Please provide consultation fee']
    // },
    profileImage: {
        type: String
    }
}, {
    timestamps: true
});

// Hash password before saving
doctorSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

// Compare password method
doctorSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Doctor', doctorSchema); 