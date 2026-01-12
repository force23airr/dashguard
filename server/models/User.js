import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false
  },
  avatar: {
    type: String,
    default: ''
  },
  role: {
    type: String,
    enum: ['user', 'moderator', 'admin'],
    default: 'user'
  },

  // Rewards tracking
  rewards: {
    referralCode: {
      type: String,
      unique: true,
      sparse: true  // Allow null/missing values
    },
    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    totalReferrals: {
      type: Number,
      default: 0
    },
    qualifiedReferrals: {
      type: Number,
      default: 0
    },
    // Quick access to key metrics
    currentTier: {
      type: String,
      enum: ['bronze', 'silver', 'gold', 'platinum', 'diamond'],
      default: 'bronze'
    },
    creditsBalance: {
      type: Number,
      default: 0
    },
    lifetimeCredits: {
      type: Number,
      default: 0
    },
    // Leaderboard
    leaderboardRank: Number,
    leaderboardScore: {
      type: Number,
      default: 0
    },
    lastRankUpdate: Date,
    // Profile display settings
    showOnLeaderboard: {
      type: Boolean,
      default: true
    },
    publicStats: {
      type: Boolean,
      default: true
    }
  },

  // Profile for gig drivers
  profile: {
    isGigDriver: {
      type: Boolean,
      default: false
    },
    gigPlatforms: [{
      type: String,
      enum: ['uber', 'lyft', 'doordash', 'grubhub', 'instacart', 'amazon_flex', 'shipt', 'spark', 'other']
    }],
    averageHoursPerWeek: {
      type: Number,
      min: 0,
      max: 168
    },
    primaryCity: String,
    primaryState: String,
    dashCamModel: String,
    vehicleType: {
      type: String,
      enum: ['car', 'suv', 'truck', 'van', 'motorcycle', 'bicycle', 'other']
    }
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', userSchema);
