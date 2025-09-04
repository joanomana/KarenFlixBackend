import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    reviewId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    mediaId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Media',
        required: true
    },
    message: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['pendiente', 'leida'],
        default: 'pendiente'
    }
}, {
    timestamps: true
});

// Índice para optimizar consultas por fecha
notificationSchema.index({ createdAt: -1 });


const Notification = mongoose.model('Notification',notificationSchema)

export default Notification