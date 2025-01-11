const mongoose = require('mongoose');

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
        type: [String],
        required: [true, 'Please provide specialization'],
        enum: ['Ayurveda', 'Panchakarma', 'Yoga', 'General']
    },
    department: {
        type: [String],
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
    availability: {
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
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'on-leave'],
        default: 'active'
    },
    profileImage: {
        type: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Doctor', doctorSchema); 