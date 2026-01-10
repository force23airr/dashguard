import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const datasetSchema = new mongoose.Schema({
  datasetId: {
    type: String,
    unique: true,
    required: true,
    default: () => uuidv4()
  },

  // Metadata
  metadata: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      maxlength: 2000
    },
    version: {
      type: String,
      default: '1.0.0'
    },
    purpose: {
      type: String,
      enum: ['ai_training', 'research', 'analytics', 'safety_study', 'other'],
      required: true
    },
    tags: [{
      type: String,
      lowercase: true,
      trim: true
    }],
    category: {
      type: String,
      enum: ['driving', 'traffic', 'weather', 'incidents', 'mixed'],
      default: 'incidents'
    }
  },

  // Contents summary
  contents: {
    totalFiles: {
      type: Number,
      default: 0
    },
    totalSizeBytes: {
      type: Number,
      default: 0
    },
    fileTypes: {
      videos: {
        type: Number,
        default: 0
      },
      images: {
        type: Number,
        default: 0
      }
    },
    incidentTypes: {
      type: Map,
      of: Number,
      default: new Map()
    },
    severityDistribution: {
      type: Map,
      of: Number,
      default: new Map()
    },
    dateRange: {
      start: Date,
      end: Date
    },
    locationCoverage: [{
      city: String,
      state: String,
      country: String,
      count: Number
    }]
  },

  // Contributors
  contributors: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    filesCount: {
      type: Number,
      default: 0
    },
    dataSizeMB: {
      type: Number,
      default: 0
    },
    creditAwarded: {
      type: Number,
      default: 0
    },
    contributedAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Incidents included
  includedIncidents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Incident'
  }],

  // Anonymization settings applied
  anonymization: {
    facesBlurred: {
      type: Boolean,
      default: true
    },
    platesBlurred: {
      type: Boolean,
      default: true
    },
    audioRemoved: {
      type: Boolean,
      default: true
    },
    metadataStripped: {
      type: Boolean,
      default: true
    },
    locationObfuscated: {
      type: Boolean,
      default: true
    },
    locationPrecisionKm: {
      type: Number,
      default: 10
    }
  },

  // Licensing
  licensing: {
    type: {
      type: String,
      enum: ['commercial', 'research', 'open', 'restricted'],
      default: 'research'
    },
    price: {
      type: Number,
      default: 0
    },
    currency: {
      type: String,
      default: 'USD'
    },
    restrictions: [String],
    termsUrl: String,
    attribution: {
      required: {
        type: Boolean,
        default: true
      },
      text: String
    }
  },

  // Generated files
  files: {
    manifestUrl: String,
    downloadUrl: String,
    sampleUrl: String,
    expiresAt: Date,
    checksumSha256: String,
    format: {
      type: String,
      enum: ['zip', 'tar.gz', 'directory'],
      default: 'zip'
    }
  },

  // Generation status
  status: {
    type: String,
    enum: ['queued', 'generating', 'processing', 'ready', 'archived', 'deleted', 'failed'],
    default: 'queued'
  },
  generationProgress: {
    current: {
      type: Number,
      default: 0
    },
    total: {
      type: Number,
      default: 0
    },
    stage: {
      type: String,
      enum: ['queued', 'collecting', 'anonymizing', 'packaging', 'uploading', 'complete'],
      default: 'queued'
    }
  },
  generationError: String,
  generatedAt: Date,

  // Access tracking
  access: [{
    entity: String,
    apiKeyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ApiKey'
    },
    accessedAt: {
      type: Date,
      default: Date.now
    },
    purpose: String,
    ipAddress: String
  }],

  // Statistics
  stats: {
    downloads: {
      type: Number,
      default: 0
    },
    views: {
      type: Number,
      default: 0
    },
    revenue: {
      type: Number,
      default: 0
    }
  },

  // Created by
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes
datasetSchema.index({ datasetId: 1 });
datasetSchema.index({ status: 1 });
datasetSchema.index({ 'metadata.purpose': 1 });
datasetSchema.index({ 'licensing.type': 1 });
datasetSchema.index({ createdAt: -1 });
datasetSchema.index({ 'metadata.tags': 1 });

// Virtual for total size in MB
datasetSchema.virtual('contents.totalSizeMB').get(function() {
  return Math.round(this.contents.totalSizeBytes / (1024 * 1024) * 100) / 100;
});

// Method to log access
datasetSchema.methods.logAccess = async function(entity, apiKeyId, purpose, ipAddress) {
  this.access.push({
    entity,
    apiKeyId,
    accessedAt: new Date(),
    purpose,
    ipAddress
  });
  this.stats.views += 1;
  await this.save();
};

// Method to increment downloads
datasetSchema.methods.incrementDownloads = async function() {
  this.stats.downloads += 1;
  await this.save();
};

// Method to update generation progress
datasetSchema.methods.updateProgress = async function(current, total, stage) {
  this.generationProgress = { current, total, stage };
  await this.save();
};

export default mongoose.model('Dataset', datasetSchema);
