const mongoose = require('mongoose');

const TempUserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name']
    },
    contact: {
        type: String,
        // unique: true,
        required: [true, 'Please provide phone number']
    },
    consultations: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "Consultation"
    },
    email: {
        type: String,
        required: [true, 'Please provide email'],
    },
    isVerified: {
        type: String,
        required: true
    },
    otp: {
        type: Number,
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('TempUser', TempUserSchema); 