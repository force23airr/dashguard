import mongoose from 'mongoose';

const alertSchema = new mongoose.Schema({
  incident: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Incident',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: [true, 'Alert message is required'],
    maxlength: 500
  },
  radius: {
    type: Number,
    default: 10 // kilometers
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for active alerts
alertSchema.index({ isActive: 1, expiresAt: 1 });

export default mongoose.model('Alert', alertSchema);
