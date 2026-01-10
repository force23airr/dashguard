import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const insuranceClaimSchema = new mongoose.Schema({
  claimId: {
    type: String,
    unique: true,
    required: true,
    default: () => uuidv4()
  },
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

  // ACORD-like claimant structure
  claimant: {
    name: {
      first: String,
      middle: String,
      last: String
    },
    policyNumber: String,
    insuranceCompany: String,
    contactEmail: {
      type: String,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
    },
    contactPhone: String,
    address: {
      street: String,
      city: String,
      state: String,
      zip: String,
      country: {
        type: String,
        default: 'USA'
      }
    },
    vehicleInfo: {
      make: String,
      model: String,
      year: Number,
      vin: {
        type: String,
        maxlength: 17
      },
      licensePlate: String,
      color: String,
      mileage: Number
    }
  },

  // Loss details
  lossDetails: {
    dateOfLoss: {
      type: Date,
      required: true
    },
    timeOfLoss: String,
    locationOfLoss: {
      address: String,
      city: String,
      state: String,
      zip: String,
      lat: Number,
      lng: Number
    },
    descriptionOfLoss: {
      type: String,
      maxlength: 5000
    },
    estimatedDamage: {
      type: Number,
      min: 0
    },
    damageParts: [{
      part: String,
      description: String,
      estimatedCost: Number
    }],
    injuries: {
      type: Boolean,
      default: false
    },
    injuryDescription: String,
    injuredParties: [{
      name: String,
      relationship: String,
      injuryType: String,
      treatmentReceived: Boolean
    }]
  },

  // Third party information
  thirdParty: {
    involved: {
      type: Boolean,
      default: false
    },
    parties: [{
      name: String,
      contactInfo: String,
      insuranceCompany: String,
      policyNumber: String,
      vehicleInfo: {
        make: String,
        model: String,
        year: Number,
        licensePlate: String
      },
      atFault: Boolean,
      description: String
    }]
  },

  // Evidence and documentation
  evidence: {
    mediaFiles: [{
      originalFile: String,
      secureUrl: String,
      expiresAt: Date,
      type: String,
      description: String
    }],
    policeReportNumber: String,
    policeReportDate: Date,
    witnesses: [{
      name: String,
      phone: String,
      email: String,
      statement: String,
      relationToIncident: String
    }],
    additionalDocuments: [{
      name: String,
      type: String,
      path: String,
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }]
  },

  // Claim status and workflow
  status: {
    type: String,
    enum: ['draft', 'submitted', 'pending_review', 'under_investigation', 'approved', 'rejected', 'closed'],
    default: 'draft'
  },
  statusHistory: [{
    status: String,
    changedAt: {
      type: Date,
      default: Date.now
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    notes: String
  }],

  // API access tracking
  apiAccess: [{
    apiKeyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ApiKey'
    },
    accessedAt: {
      type: Date,
      default: Date.now
    },
    action: String,
    ipAddress: String
  }],

  // Processing information
  submittedAt: Date,
  processedAt: Date,
  approvedAmount: Number,
  rejectionReason: String,
  notes: {
    type: String,
    maxlength: 2000
  },

  // Consent for sharing
  consentToShare: {
    type: Boolean,
    default: false
  },
  consentTimestamp: Date

}, {
  timestamps: true
});

// Indexes
insuranceClaimSchema.index({ claimId: 1 });
insuranceClaimSchema.index({ user: 1, status: 1 });
insuranceClaimSchema.index({ 'claimant.policyNumber': 1 });
insuranceClaimSchema.index({ 'lossDetails.dateOfLoss': -1 });
insuranceClaimSchema.index({ status: 1, createdAt: -1 });
insuranceClaimSchema.index({ incident: 1 });

// Virtual for claimant full name
insuranceClaimSchema.virtual('claimant.fullName').get(function() {
  const name = this.claimant?.name;
  if (!name) return '';
  return [name.first, name.middle, name.last].filter(Boolean).join(' ');
});

// Method to update status with history
insuranceClaimSchema.methods.updateStatus = async function(newStatus, userId, notes = '') {
  this.statusHistory.push({
    status: newStatus,
    changedAt: new Date(),
    changedBy: userId,
    notes: notes
  });
  this.status = newStatus;

  if (newStatus === 'submitted') {
    this.submittedAt = new Date();
  } else if (newStatus === 'approved' || newStatus === 'rejected') {
    this.processedAt = new Date();
  }

  await this.save();
};

// Method to log API access
insuranceClaimSchema.methods.logApiAccess = async function(apiKeyId, action, ipAddress) {
  this.apiAccess.push({
    apiKeyId,
    accessedAt: new Date(),
    action,
    ipAddress
  });
  await this.save();
};

export default mongoose.model('InsuranceClaim', insuranceClaimSchema);
