import mongoose from 'mongoose';

const ReviewReactionSchema = new mongoose.Schema({
  reviewId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review',
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  value: {
    type: Number,
    enum: [1, -1], // 1 = like, -1 = dislike
    required: true
  }
}, { timestamps: true });

// Asegura que un usuario solo pueda reaccionar una vez por reseña
ReviewReactionSchema.index({ reviewId: 1, userId: 1 }, { unique: true });

const ReviewReaction = mongoose.model('ReviewReaction', ReviewReactionSchema);

export default ReviewReaction;
