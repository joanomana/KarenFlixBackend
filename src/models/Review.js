import mongoose from 'mongoose';

const ReviewSchema = new mongoose.Schema({
  mediaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Media', required: true, index: true },
  userId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title:   { type: String, required: true, minlength: 3, maxlength: 120, trim: true },
  comment: { type: String, required: true, minlength: 10, maxlength: 2000, trim: true },
  rating:  { type: Number, required: true, min: 1, max: 10 },
  likesCount:    { type: Number, default: 0 },
  dislikesCount: { type: Number, default: 0 }
}, { timestamps: true });

ReviewSchema.index({ mediaId: 1, userId: 1 }, { unique: true });

const Review = mongoose.model('Review', ReviewSchema);
export default Review;
