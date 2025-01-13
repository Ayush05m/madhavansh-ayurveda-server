const mongoose = require('mongoose');
const consultationSchema = new mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' || 'TempUser',
    },
    name: {
        type: String,
        required: true
    },
    contact: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
    },
    consultationType: {
        type: String,
        enum: ['General Consultation', 'Follow-up', 'Specific Treatment', 'Emergency'],
        required: true,
    },
    department: {
        type: String,
        required: true,
    },
    doctor: {
        doctorName: {
            type: String,
            required: true
        },
        doctorId: {
            type: String,
            required: true
        },
    },
    previousConsultationId: {
        type: String
    },
    date: {
        type: Date,
        required: true
    },
    timeSlot: {
        type: String,
        required: true
    },
    symptoms: {
        type: String,
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'completed', 'cancelled'],
        default: 'pending'
    },
    amount: {
        type: Number,
        required: true,
        default: 500
    },
    notes: {
        type: String
    },
    prescription: {
        files: [String],
        instructions: String
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'refunded'],
        default: 'pending'
    },
    additionalInfo: {
        img: [String],
        file: [String],
    },
    mode: {
        type: String,
        enum: ['online', 'offline'],
        default: 'offline'
    }
}, {
    timestamps: true
});

// Add indexes for common queries
consultationSchema.index({ patient: 1, status: 1 });
consultationSchema.index({ doctorId: 1, date: 1 });

module.exports = mongoose.model('Consultation', consultationSchema); 