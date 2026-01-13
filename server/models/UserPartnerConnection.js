import mongoose from 'mongoose';

const userPartnerConnectionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  partner: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'partnerModel',
    required: true
  },
  partnerModel: {
    type: String,
    enum: ['DataPartner', 'InsurancePartner'],
    required: true
  },
  partnerType: {
    type: String,
    enum: ['data', 'insurance'],
    required: true
  },

  status: {
    type: String,
    enum: ['pending', 'active', 'paused', 'disconnected'],
    default: 'active'
  },
  connectedAt: {
    type: Date,
    default: Date.now
  },
  disconnectedAt: Date,

  // For insurance partners
  insurance: {
    policyNumber: String,
    isVerified: { type: Boolean, default: false },
    verifiedAt: Date
  },

  // For data partners - what data types the user shares with this partner
  dataSharing: {
    enabledTypes: [{
      type: String,
      enum: [
        'real_time_video',
        'incident_reports',
        'road_conditions',
        'traffic_data',
        'weather_hazards',
        'infrastructure_issues',
        'lane_data',
        'sign_detection',
        'pedestrian_data',
        'parking_data',
        'construction_zones',
        'visibility_data'
      ]
    }],
    allowRealTimeStreaming: { type: Boolean, default: false },
    lastDataSharedAt: Date
  },

  // Streaming stats (for data partners)
  streaming: {
    isCurrentlyStreaming: { type: Boolean, default: false },
    lastStreamStartedAt: Date,
    lastStreamEndedAt: Date,
    totalMinutesStreamed: { type: Number, default: 0 },
    totalSessionsCount: { type: Number, default: 0 }
  },

  // Earnings from this specific partner
  earnings: {
    total: { type: Number, default: 0 }, // Total credits earned
    totalUSD: { type: Number, default: 0 },
    pending: { type: Number, default: 0 },
    lastEarningAt: Date,
    // Breakdown by data type
    byType: [{
      dataType: String,
      credits: Number,
      count: Number // Number of reports/minutes
    }]
  },

  // Contribution stats
  contributions: {
    totalReports: { type: Number, default: 0 },
    totalFilesShared: { type: Number, default: 0 },
    totalDataSizeMB: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

// Compound index for unique user-partner pairs
userPartnerConnectionSchema.index({ user: 1, partner: 1 }, { unique: true });
userPartnerConnectionSchema.index({ user: 1, partnerType: 1, status: 1 });
userPartnerConnectionSchema.index({ partner: 1, status: 1 });

// Method to add earnings
userPartnerConnectionSchema.methods.addEarnings = async function(credits, dataType, count = 1) {
  this.earnings.total += credits;
  this.earnings.totalUSD = this.earnings.total / 100; // 100 credits = $1
  this.earnings.lastEarningAt = new Date();

  // Update breakdown by type
  const typeEntry = this.earnings.byType.find(t => t.dataType === dataType);
  if (typeEntry) {
    typeEntry.credits += credits;
    typeEntry.count += count;
  } else {
    this.earnings.byType.push({ dataType, credits, count });
  }

  this.contributions.totalReports += count;

  return this.save();
};

// Method to pause connection
userPartnerConnectionSchema.methods.pause = async function() {
  this.status = 'paused';
  this.streaming.isCurrentlyStreaming = false;
  return this.save();
};

// Method to resume connection
userPartnerConnectionSchema.methods.resume = async function() {
  this.status = 'active';
  return this.save();
};

// Method to disconnect
userPartnerConnectionSchema.methods.disconnect = async function() {
  this.status = 'disconnected';
  this.disconnectedAt = new Date();
  this.streaming.isCurrentlyStreaming = false;
  return this.save();
};

// Static method to get user's total partner earnings
userPartnerConnectionSchema.statics.getUserTotalEarnings = async function(userId) {
  const result = await this.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(userId), status: { $ne: 'disconnected' } } },
    {
      $group: {
        _id: null,
        totalCredits: { $sum: '$earnings.total' },
        totalPartners: { $sum: 1 },
        totalReports: { $sum: '$contributions.totalReports' }
      }
    }
  ]);

  return result[0] || { totalCredits: 0, totalPartners: 0, totalReports: 0 };
};

// Static method to get active connections for a partner
userPartnerConnectionSchema.statics.getPartnerActiveCount = async function(partnerId) {
  return this.countDocuments({ partner: partnerId, status: 'active' });
};

const UserPartnerConnection = mongoose.model('UserPartnerConnection', userPartnerConnectionSchema);

export default UserPartnerConnection;
