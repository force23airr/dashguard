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
    },
    city: {
      type: String
    },
    state: {
      type: String
    },
    country: {
      type: String
    },
    zipCode: {
      type: String
    }
  },
  timeBreakdown: {
    hour: Number,
    dayOfWeek: Number,
    month: Number,
    year: Number,
    isWeekend: Boolean,
    isRushHour: Boolean
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
  },
  policeReports: [{
    policeStation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PoliceStation'
    },
    reportId: String,
    sentAt: Date,
    method: {
      type: String,
      enum: ['email', 'api', 'download']
    },
    status: {
      type: String,
      enum: ['pending', 'sent', 'delivered', 'failed'],
      default: 'pending'
    },
    pdfPath: String,
    acknowledgedAt: Date,
    caseNumber: String
  }]
}, {
  timestamps: true
});

// Index for filtering
incidentSchema.index({ type: 1, severity: 1, status: 1 });
incidentSchema.index({ createdAt: -1 });
incidentSchema.index({ 'location.lat': 1, 'location.lng': 1 });
incidentSchema.index({ 'location.city': 1, 'location.state': 1 });
incidentSchema.index({ 'timeBreakdown.hour': 1, 'timeBreakdown.dayOfWeek': 1 });

// Pre-save hook to compute timeBreakdown
incidentSchema.pre('save', function(next) {
  if (this.isNew || this.isModified('createdAt')) {
    const date = this.createdAt || new Date();
    const hour = date.getHours();
    const dayOfWeek = date.getDay();

    this.timeBreakdown = {
      hour: hour,
      dayOfWeek: dayOfWeek,
      month: date.getMonth() + 1,
      year: date.getFullYear(),
      isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
      isRushHour: (hour >= 7 && hour <= 9) || (hour >= 16 && hour <= 19)
    };
  }
  next();
});

export default mongoose.model('Incident', incidentSchema);
