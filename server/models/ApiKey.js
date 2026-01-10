import mongoose from 'mongoose';
import crypto from 'crypto';

const apiKeySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'API key name is required'],
    trim: true
  },
  description: {
    type: String,
    maxlength: 500
  },
  key: {
    type: String,
    required: true,
    unique: true
  },
  secretHash: {
    type: String,
    required: true,
    select: false
  },
  permissions: {
    readClaims: {
      type: Boolean,
      default: true
    },
    writeClaims: {
      type: Boolean,
      default: false
    },
    readMedia: {
      type: Boolean,
      default: true
    },
    bulkExport: {
      type: Boolean,
      default: false
    },
    readAnalytics: {
      type: Boolean,
      default: false
    },
    readDatasets: {
      type: Boolean,
      default: false
    }
  },
  rateLimit: {
    requestsPerMinute: {
      type: Number,
      default: 60
    },
    requestsPerDay: {
      type: Number,
      default: 10000
    }
  },
  allowedIPs: [{
    type: String
  }],
  webhookUrl: {
    type: String,
    match: [/^https?:\/\/.+/, 'Please enter a valid URL']
  },
  webhookSecret: {
    type: String,
    select: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  expiresAt: {
    type: Date
  },
  lastUsedAt: {
    type: Date
  },
  usageStats: {
    totalRequests: {
      type: Number,
      default: 0
    },
    lastMonthRequests: {
      type: Number,
      default: 0
    },
    lastResetAt: {
      type: Date,
      default: Date.now
    }
  },
  organization: {
    name: String,
    contactEmail: String,
    contactPhone: String,
    type: {
      type: String,
      enum: ['insurance', 'research', 'government', 'other'],
      default: 'other'
    }
  }
}, {
  timestamps: true
});

// Indexes
apiKeySchema.index({ key: 1 });
apiKeySchema.index({ isActive: 1, expiresAt: 1 });
apiKeySchema.index({ 'organization.type': 1 });

// Static method to generate new API key pair
apiKeySchema.statics.generateKeyPair = function() {
  const key = 'dg_' + crypto.randomBytes(16).toString('hex');
  const secret = crypto.randomBytes(32).toString('hex');
  const secretHash = crypto.createHash('sha256').update(secret).digest('hex');

  return { key, secret, secretHash };
};

// Method to verify secret
apiKeySchema.methods.verifySecret = function(secret) {
  const hash = crypto.createHash('sha256').update(secret).digest('hex');
  return hash === this.secretHash;
};

// Method to increment usage
apiKeySchema.methods.incrementUsage = async function() {
  this.usageStats.totalRequests += 1;
  this.usageStats.lastMonthRequests += 1;
  this.lastUsedAt = new Date();
  await this.save();
};

// Check if key is valid (active and not expired)
apiKeySchema.methods.isValid = function() {
  if (!this.isActive) return false;
  if (this.expiresAt && this.expiresAt < new Date()) return false;
  return true;
};

export default mongoose.model('ApiKey', apiKeySchema);
