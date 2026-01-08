import mongoose from 'mongoose';

const incidentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: 1000
  },
  type: {
    type: String,
    enum: ['dangerous_driving', 'crime', 'security', 'other'],
    required: [true, 'Incident type is required']
  },
  location: {
    address: {
      type: String,
      required: [true, 'Location address is required']
    },
    lat: {
      type: Number
    },
    lng: {
      type: Number
    }
  },
  mediaFiles: [{
    filename: String,
    path: String,
    mimetype: String
  }],
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'verified', 'resolved'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Index for filtering
incidentSchema.index({ type: 1, severity: 1, status: 1 });
incidentSchema.index({ createdAt: -1 });

export default mongoose.model('Incident', incidentSchema);
