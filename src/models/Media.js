import mongoose from 'mongoose';

export const MEDIA_TYPES = ['movie', 'anime', 'series'];

const MetricsSchema = new mongoose.Schema({
  ratingCount: { type: Number, default: 0 },
  ratingAvg: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  dislikes: { type: Number, default: 0 },
  weightedScore: { type: Number, default: 0 }
}, { _id: false });

const MediaSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 200 },
  title_lc: { type: String, required: true, lowercase: true, trim: true },
  slug: { type: String, required: true, unique: true, index: true },
  type: { type: String, enum: MEDIA_TYPES, required: true, index: true },
  description: { type: String, required: true, minlength: 10 },
  category: {
    _id: { type: mongoose.Types.ObjectId, ref: 'Category' },
    name: { type: String, required: true, trim: true }
  },
  year: { type: Number, min: 1880, max: new Date().getFullYear() },
  imageUrl: { type: String },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending', index: true },
  createdBy: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
  approvedBy: { type: mongoose.Types.ObjectId, ref: 'User' },
  approvedAt: { type: Date },
  metrics: { type: MetricsSchema, default: () => ({}) }
}, { timestamps: true });

// Indices
MediaSchema.index({ title_lc: 1, year: 1, type: 1 }, { unique: true });
MediaSchema.index({ type: 1, 'metrics.weightedScore': -1 });

// Pre-save normalize
MediaSchema.pre('validate', function(next) {
  if (this.title && !this.title_lc) {
    this.title_lc = this.title.toLowerCase();
  }
  if (this.title && this.year && this.type && !this.slug) {
    const base = `${this.title}-${this.year}-${this.type}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    this.slug = base;
  }
  next();
});

const Media = mongoose.model('Media', MediaSchema);
export default Media;
