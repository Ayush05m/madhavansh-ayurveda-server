const mongoose = require('mongoose');

const consultationSchema = new mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    doctorId: {
        type: String,
        required: true
    },
    consultationType: {
        type: String,
        required: true,
        enum: ['General Consultation', 'Follow-up', 'Specific Treatment', 'Emergency']
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
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'completed', 'cancelled'],
        default: 'pending'
    },
    amount: {
        type: Number,
        required: true,
        default: 1000
    },
    notes: {
        type: String
    },
    prescription: {
        medicines: [{
            name: String,
            dosage: String,
            duration: String
        }],
        instructions: String
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'refunded'],
        default: 'pending'
    }
}, {
    timestamps: true
});

// Add indexes for common queries
consultationSchema.index({ patient: 1, status: 1 });
consultationSchema.index({ doctorId: 1, date: 1 });

module.exports = mongoose.model('Consultation', consultationSchema); 