import mongoose from 'mongoose';
import crypto from 'crypto';

const violationReportSchema = new mongoose.Schema({
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reportNumber: {
    type: String,
    unique: true,
    sparse: true
  },

  // Violation Classification
  violationType: {
    type: String,
    enum: [
      'running_red_light', 'running_stop_sign', 'speeding',
      'illegal_lane_change', 'unsafe_lane_change', 'failure_to_signal',
      'tailgating', 'following_too_close', 'reckless_driving',
      'aggressive_driving', 'road_rage', 'hit_and_run',
      'dui_suspected', 'distracted_driving', 'texting_while_driving',
      'illegal_turn', 'illegal_u_turn', 'failure_to_yield',
      'wrong_way_driving', 'street_racing', 'exhibition_of_speed',
      'failure_to_stop_for_school_bus', 'passing_on_right',
      'crossing_double_yellow', 'other'
    ],
    required: true
  },
  severity: {
    type: String,
    enum: ['minor', 'moderate', 'severe', 'critical'],
    required: true
  },

  // Offending Vehicle
  offendingVehicle: {
    licensePlate: {
      type: String,
      uppercase: true,
      trim: true,
      required: true
    },
    plateState: {
      type: String,
      required: true
    },
    plateCountry: {
      type: String,
      default: 'US'
    },
    make: String,
    model: String,
    color: String,
    vehicleType: {
      type: String,
      enum: ['sedan', 'suv', 'truck', 'van', 'motorcycle', 'commercial', 'bus', 'other']
    },
    plateConfidence: Number
  },

  // Location & Time
  location: {
    address: {
      type: String,
      required: true
    },
    city: String,
    state: String,
    zipCode: String,
    lat: {
      type: Number,
      required: true
    },
    lng: {
      type: Number,
      required: true
    },
    roadType: {
      type: String,
      enum: ['highway', 'arterial', 'residential', 'school_zone', 'construction_zone', 'parking_lot']
    },
    speedLimit: Number
  },
  incidentDateTime: {
    type: Date,
    required: true
  },

  // Evidence with Integrity
  evidence: [{
    filename: {
      type: String,
      required: true
    },
    originalFilename: String,
    path: {
      type: String,
      required: true
    },
    mimetype: String,
    size: Number,
    sha256Hash: {
      type: String,
      required: true
    },
    metadata: {
      duration: Number,
      resolution: String,
      frameRate: Number,
      codec: String,
      captureDevice: String,
      gpsData: {
        lat: Number,
        lng: Number,
        altitude: Number,
        speed: Number
      },
      originalTimestamp: Date
    },
    keyFrames: [{
      timestamp: Number,
      path: String,
      description: String
    }],
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Reporter's Account
  description: {
    type: String,
    required: true,
    maxlength: 5000
  },
  reporterVehicle: {
    wasInvolved: Boolean,
    damageDescription: String,
    estimatedDamage: Number
  },

  // Chain of Custody (Court-admissible trail)
  chainOfCustody: [{
    action: {
      type: String,
      enum: [
        'created', 'evidence_added', 'evidence_verified', 'exported',
        'submitted_to_police', 'submitted_to_insurance', 'reviewed',
        'status_changed', 'accessed'
      ]
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    ipAddress: String,
    userAgent: String,
    details: String,
    previousHash: String,
    entryHash: String
  }],

  // Verification
  verification: {
    status: {
      type: String,
      enum: ['pending', 'verified', 'disputed', 'rejected'],
      default: 'pending'
    },
    communityVotes: {
      // LEGACY: Keep for backward compatibility
      confirms: { type: Number, default: 0 },
      disputes: { type: Number, default: 0 },

      // NEW: Enhanced voting types (multi-select)
      voteTypes: {
        confirmViolation: { type: Number, default: 0 },
        notViolation: { type: Number, default: 0 },
        veryDangerous: { type: Number, default: 0 },
        sendToPolice: { type: Number, default: 0 },
        needContext: { type: Number, default: 0 }
      },

      voters: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        vote: { type: String, enum: ['confirm', 'dispute'] },  // LEGACY
        voteTypes: [String],  // NEW: array of selected vote types
        timestamp: Date
      }]
    },
    moderatorReview: {
      reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      reviewedAt: Date,
      decision: String,
      notes: String
    },
    evidenceIntegrityVerified: {
      type: Boolean,
      default: false
    }
  },

  // Recklessness Rating (1-10 scale)
  recklessnessRating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 10
    },
    count: {
      type: Number,
      default: 0
    },
    ratings: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      rating: {
        type: Number,
        min: 1,
        max: 10,
        required: true
      },
      timestamp: {
        type: Date,
        default: Date.now
      }
    }]
  },

  // Law Enforcement Submissions
  lawEnforcementSubmissions: [{
    submissionId: String,
    policeStation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PoliceStation'
    },
    trafficDivision: String,
    municipalCourt: String,
    submittedAt: Date,
    method: {
      type: String,
      enum: ['email', 'portal', 'api', 'in_person']
    },
    status: {
      type: String,
      enum: ['pending', 'received', 'under_review', 'citation_issued', 'dismissed', 'insufficient_evidence'],
      default: 'pending'
    },
    caseNumber: String,
    citationNumber: String,
    officerAssigned: String,
    lastUpdated: Date,
    notes: String
  }],

  // Insurance Submissions
  insuranceSubmissions: [{
    submissionId: String,
    targetDatabase: {
      type: String,
      enum: ['CLUE', 'ISO_ClaimSearch', 'direct_insurer']
    },
    insurerName: String,
    submittedAt: Date,
    status: {
      type: String,
      enum: ['pending', 'received', 'processed', 'rejected'],
      default: 'pending'
    },
    referenceNumber: String,
    lastUpdated: Date
  }],

  // Traffic Code Mapping
  applicableStatutes: [{
    state: String,
    code: String,
    description: String,
    fineRange: {
      min: Number,
      max: Number
    },
    points: Number,
    isMisdemeanor: Boolean
  }],

  // Consent & Legal
  consent: {
    tosAccepted: {
      type: Boolean,
      required: true
    },
    tosAcceptedAt: Date,
    certifyTruthful: {
      type: Boolean,
      required: true
    },
    authorizePoliceContact: Boolean,
    authorizeInsuranceReport: Boolean,
    willingToTestify: Boolean
  },

  status: {
    type: String,
    enum: ['draft', 'submitted', 'under_review', 'verified', 'submitted_to_authorities', 'closed'],
    default: 'draft'
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
violationReportSchema.index({ reporter: 1 });
violationReportSchema.index({ 'offendingVehicle.licensePlate': 1 });
violationReportSchema.index({ 'offendingVehicle.plateState': 1 });
violationReportSchema.index({ status: 1 });
violationReportSchema.index({ violationType: 1 });
violationReportSchema.index({ incidentDateTime: -1 });
violationReportSchema.index({ 'location.lat': 1, 'location.lng': 1 });
violationReportSchema.index({ 'verification.status': 1 });
violationReportSchema.index({ 'recklessnessRating.average': -1 });
violationReportSchema.index({ createdAt: -1 });

// Pre-save hook to generate report number
violationReportSchema.pre('save', async function(next) {
  if (!this.reportNumber) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('ViolationReport').countDocuments();
    const sequence = String(count + 1).padStart(5, '0');
    this.reportNumber = `VIO-${year}-${sequence}`;
  }

  // Auto-set tosAcceptedAt when consent given
  if (this.consent.tosAccepted && !this.consent.tosAcceptedAt) {
    this.consent.tosAcceptedAt = new Date();
  }

  next();
});

// Method to add chain of custody entry
violationReportSchema.methods.addCustodyEntry = function(action, performedBy, details, ipAddress, userAgent) {
  const previousEntry = this.chainOfCustody[this.chainOfCustody.length - 1];
  const previousHash = previousEntry?.entryHash || '';

  const entryData = {
    action,
    timestamp: new Date(),
    performedBy,
    details,
    ipAddress,
    userAgent,
    previousHash
  };

  // Calculate hash for tamper detection
  const hashContent = JSON.stringify({
    action: entryData.action,
    timestamp: entryData.timestamp.toISOString(),
    performedBy: entryData.performedBy?.toString(),
    details: entryData.details,
    previousHash
  });
  entryData.entryHash = crypto.createHash('sha256').update(hashContent).digest('hex');

  this.chainOfCustody.push(entryData);
  return entryData;
};

// Method to verify chain of custody integrity
violationReportSchema.methods.verifyCustodyChain = function() {
  let previousHash = '';

  for (const entry of this.chainOfCustody) {
    if (entry.previousHash !== previousHash) {
      return { valid: false, brokenAt: entry.timestamp, expectedHash: previousHash };
    }

    const hashContent = JSON.stringify({
      action: entry.action,
      timestamp: entry.timestamp.toISOString(),
      performedBy: entry.performedBy?.toString(),
      details: entry.details,
      previousHash: entry.previousHash
    });
    const calculatedHash = crypto.createHash('sha256').update(hashContent).digest('hex');

    if (calculatedHash !== entry.entryHash) {
      return { valid: false, brokenAt: entry.timestamp, reason: 'Entry hash mismatch' };
    }

    previousHash = entry.entryHash;
  }

  return { valid: true };
};

// Virtual for violation type display
violationReportSchema.virtual('violationTypeDisplay').get(function() {
  const displayMap = {
    running_red_light: 'Running Red Light',
    running_stop_sign: 'Running Stop Sign',
    speeding: 'Speeding',
    illegal_lane_change: 'Illegal Lane Change',
    unsafe_lane_change: 'Unsafe Lane Change',
    failure_to_signal: 'Failure to Signal',
    tailgating: 'Tailgating',
    following_too_close: 'Following Too Close',
    reckless_driving: 'Reckless Driving',
    aggressive_driving: 'Aggressive Driving',
    road_rage: 'Road Rage',
    hit_and_run: 'Hit and Run',
    dui_suspected: 'Suspected DUI',
    distracted_driving: 'Distracted Driving',
    texting_while_driving: 'Texting While Driving',
    illegal_turn: 'Illegal Turn',
    illegal_u_turn: 'Illegal U-Turn',
    failure_to_yield: 'Failure to Yield',
    wrong_way_driving: 'Wrong Way Driving',
    street_racing: 'Street Racing',
    exhibition_of_speed: 'Exhibition of Speed',
    failure_to_stop_for_school_bus: 'Failure to Stop for School Bus',
    passing_on_right: 'Passing on Right',
    crossing_double_yellow: 'Crossing Double Yellow',
    other: 'Other Violation'
  };
  return displayMap[this.violationType] || this.violationType;
});

// Virtual for severity badge
violationReportSchema.virtual('severityBadge').get(function() {
  const badges = {
    minor: { color: 'yellow', label: 'Minor' },
    moderate: { color: 'orange', label: 'Moderate' },
    severe: { color: 'red', label: 'Severe' },
    critical: { color: 'darkred', label: 'Critical' }
  };
  return badges[this.severity];
});

// Ensure virtuals are serialized
violationReportSchema.set('toJSON', { virtuals: true });
violationReportSchema.set('toObject', { virtuals: true });

export default mongoose.model('ViolationReport', violationReportSchema);
