import mongoose from 'mongoose';
import crypto from 'crypto';

const referralSchema = new mongoose.Schema({
  // Referrer (existing user who shared the code)
  referrer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // Referred user (new user who signed up)
  referred: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,  // Each user can only be referred once
    index: true
  },

  // Referral code used
  code: {
    type: String,
    required: true,
    index: true
  },

  // Status of referral
  status: {
    type: String,
    enum: [
      'pending',     // User signed up, not yet qualified
      'qualified',   // User met minimum requirements
      'rewarded',    // Bonus paid to both parties
      'cancelled'    // Referral invalidated
    ],
    default: 'pending'
  },

  // Qualification tracking
  qualification: {
    requiredIncidents: {
      type: Number,
      default: 3   // Referred user must report 3 incidents
    },
    currentIncidents: {
      type: Number,
      default: 0
    },
    requiredDaysActive: {
      type: Number,
      default: 7   // Must be active for 7 days
    },
    qualifiedAt: Date
  },

  // Rewards tracking
  rewards: {
    referrerBonus: {
      type: Number,
      default: 500   // 500 credits ($5) for referrer
    },
    referredBonus: {
      type: Number,
      default: 250   // 250 credits ($2.50) welcome bonus
    },
    referrerPaid: {
      type: Boolean,
      default: false
    },
    referredPaid: {
      type: Boolean,
      default: false
    },
    referrerRewardId: mongoose.Schema.Types.ObjectId,
    referredRewardId: mongoose.Schema.Types.ObjectId
  },

  // Campaign tracking (for promotions)
  campaign: {
    name: String,
    bonusMultiplier: {
      type: Number,
      default: 1.0
    }
  },

  // Metadata
  signupIp: String,
  signupUserAgent: String,
  cancellationReason: String
}, {
  timestamps: true
});

// Indexes for efficient queries
referralSchema.index({ referrer: 1, status: 1 });
referralSchema.index({ referrer: 1, createdAt: -1 });
referralSchema.index({ code: 1 });

// Static method to generate referral code for user
referralSchema.statics.generateCode = function(username) {
  const prefix = username.substring(0, 4).toUpperCase().replace(/[^A-Z0-9]/g, 'X');
  const random = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `${prefix}-${random}`;
};

// Static method to get referrer by code
referralSchema.statics.findReferrerByCode = async function(code) {
  const User = mongoose.model('User');
  return User.findOne({ 'rewards.referralCode': code });
};

// Static method to get referral stats for user
referralSchema.statics.getReferralStats = async function(userId) {
  const stats = await this.aggregate([
    { $match: { referrer: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  const result = {
    total: 0,
    pending: 0,
    qualified: 0,
    rewarded: 0,
    cancelled: 0
  };

  stats.forEach(s => {
    result[s._id] = s.count;
    if (s._id !== 'cancelled') {
      result.total += s.count;
    }
  });

  return result;
};

// Instance method to check if referral qualifies
referralSchema.methods.checkQualification = async function() {
  const User = mongoose.model('User');
  const Incident = mongoose.model('Incident');

  const referredUser = await User.findById(this.referred);
  if (!referredUser) return false;

  // Count incidents
  const incidentCount = await Incident.countDocuments({ user: this.referred });
  this.qualification.currentIncidents = incidentCount;

  // Check days active
  const daysActive = Math.floor((Date.now() - referredUser.createdAt) / (1000 * 60 * 60 * 24));

  // Check if qualified
  if (incidentCount >= this.qualification.requiredIncidents &&
      daysActive >= this.qualification.requiredDaysActive) {
    this.status = 'qualified';
    this.qualification.qualifiedAt = new Date();
    await this.save();
    return true;
  }

  await this.save();
  return false;
};

// Milestone bonuses configuration
referralSchema.statics.MILESTONES = {
  5: 1000,    // $10 at 5 referrals
  10: 2500,   // $25 at 10 referrals
  25: 7500,   // $75 at 25 referrals
  50: 20000,  // $200 at 50 referrals
  100: 50000  // $500 at 100 referrals
};

// Static method to check milestone bonus
referralSchema.statics.checkMilestoneBonus = function(qualifiedCount) {
  return this.MILESTONES[qualifiedCount] || null;
};

export default mongoose.model('Referral', referralSchema);
