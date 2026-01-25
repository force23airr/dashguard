import mongoose from 'mongoose';

const policeActivitySchema = new mongoose.Schema({
  officer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PoliceStation',
    required: true
  },
  violationReport: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ViolationReport'
  },
  action: {
    type: String,
    enum: [
      'login',
      'viewed_case',
      'played_video',
      'updated_status',
      'issued_citation',
      'dismissed_case',
      'requested_more_info',
      'added_notes',
      'exported_evidence'
    ],
    required: true
  },
  details: {
    previousStatus: String,
    newStatus: String,
    caseNumber: String,
    citationNumber: String,
    notes: String,
    videoTimestamp: Number,  // For tracking which part of video was watched
    ipAddress: String,
    casesLoaded: Number  // For login action
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for querying officer activity
policeActivitySchema.index({ officer: 1, timestamp: -1 });
policeActivitySchema.index({ department: 1, timestamp: -1 });
policeActivitySchema.index({ violationReport: 1 });

export default mongoose.model('PoliceActivity', policeActivitySchema);
