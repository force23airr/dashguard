import mongoose from 'mongoose';

const insurancePartnerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  logo: {
    type: String,
    default: null
  },
  type: {
    type: String,
    enum: ['insurance', 'mutual', 'captive'],
    default: 'insurance'
  },

  // Contact/Integration
  contact: {
    claimsEmail: String,
    claimsPhone: String,
    claimsApiUrl: String,
    claimsPortalUrl: String,
    generalWebsite: String
  },

  // API Integration (if partner has API access)
  apiKeyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ApiKey',
    default: null
  },

  // Supported Features
  features: {
    acceptsVideoClaims: { type: Boolean, default: true },
    acceptsWitnessReports: { type: Boolean, default: false },
    hasApiIntegration: { type: Boolean, default: false },
    supportsDirectSubmission: { type: Boolean, default: true },
    acceptsPhotoEvidence: { type: Boolean, default: true },
    has24HourSupport: { type: Boolean, default: false }
  },

  // Supported states/regions
  coverage: {
    nationwide: { type: Boolean, default: true },
    states: [String] // If not nationwide, list specific states
  },

  // Stats (updated periodically)
  stats: {
    claimsReceived: { type: Number, default: 0 },
    claimsProcessed: { type: Number, default: 0 },
    averageProcessingDays: { type: Number, default: 14 },
    userRating: { type: Number, default: 0, min: 0, max: 5 },
    totalRatings: { type: Number, default: 0 }
  },

  // Display settings
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  displayOrder: { type: Number, default: 100 }
}, {
  timestamps: true
});

// Index for searching
insurancePartnerSchema.index({ name: 'text' });
insurancePartnerSchema.index({ isActive: 1, displayOrder: 1 });

// Static method to seed default insurance partners
insurancePartnerSchema.statics.seedDefaults = async function() {
  const defaults = [
    {
      name: 'State Farm',
      code: 'state_farm',
      type: 'mutual',
      contact: {
        claimsEmail: 'claims@statefarm.com',
        claimsPhone: '1-800-732-5246',
        claimsPortalUrl: 'https://www.statefarm.com/claims',
        generalWebsite: 'https://www.statefarm.com'
      },
      features: { acceptsVideoClaims: true, acceptsPhotoEvidence: true, has24HourSupport: true },
      isFeatured: true,
      displayOrder: 1
    },
    {
      name: 'Geico',
      code: 'geico',
      type: 'insurance',
      contact: {
        claimsEmail: 'claims@geico.com',
        claimsPhone: '1-800-841-3000',
        claimsPortalUrl: 'https://www.geico.com/claims',
        generalWebsite: 'https://www.geico.com'
      },
      features: { acceptsVideoClaims: true, acceptsPhotoEvidence: true, has24HourSupport: true },
      isFeatured: true,
      displayOrder: 2
    },
    {
      name: 'Progressive',
      code: 'progressive',
      type: 'insurance',
      contact: {
        claimsEmail: 'claims@progressive.com',
        claimsPhone: '1-800-776-4737',
        claimsPortalUrl: 'https://www.progressive.com/claims',
        generalWebsite: 'https://www.progressive.com'
      },
      features: { acceptsVideoClaims: true, acceptsPhotoEvidence: true, has24HourSupport: true },
      isFeatured: true,
      displayOrder: 3
    },
    {
      name: 'Allstate',
      code: 'allstate',
      type: 'insurance',
      contact: {
        claimsEmail: 'claims@allstate.com',
        claimsPhone: '1-800-255-7828',
        claimsPortalUrl: 'https://www.allstate.com/claims',
        generalWebsite: 'https://www.allstate.com'
      },
      features: { acceptsVideoClaims: true, acceptsPhotoEvidence: true },
      displayOrder: 4
    },
    {
      name: 'USAA',
      code: 'usaa',
      type: 'insurance',
      contact: {
        claimsEmail: 'claims@usaa.com',
        claimsPhone: '1-800-531-8722',
        claimsPortalUrl: 'https://www.usaa.com/claims',
        generalWebsite: 'https://www.usaa.com'
      },
      features: { acceptsVideoClaims: true, acceptsPhotoEvidence: true, has24HourSupport: true },
      displayOrder: 5
    },
    {
      name: 'Liberty Mutual',
      code: 'liberty_mutual',
      type: 'mutual',
      contact: {
        claimsEmail: 'claims@libertymutual.com',
        claimsPhone: '1-800-225-2467',
        claimsPortalUrl: 'https://www.libertymutual.com/claims',
        generalWebsite: 'https://www.libertymutual.com'
      },
      features: { acceptsVideoClaims: true, acceptsPhotoEvidence: true },
      displayOrder: 6
    },
    {
      name: 'Farmers Insurance',
      code: 'farmers',
      type: 'insurance',
      contact: {
        claimsEmail: 'claims@farmers.com',
        claimsPhone: '1-800-435-7764',
        claimsPortalUrl: 'https://www.farmers.com/claims',
        generalWebsite: 'https://www.farmers.com'
      },
      features: { acceptsVideoClaims: true, acceptsPhotoEvidence: true },
      displayOrder: 7
    },
    {
      name: 'Nationwide',
      code: 'nationwide',
      type: 'mutual',
      contact: {
        claimsEmail: 'claims@nationwide.com',
        claimsPhone: '1-800-421-3535',
        claimsPortalUrl: 'https://www.nationwide.com/claims',
        generalWebsite: 'https://www.nationwide.com'
      },
      features: { acceptsVideoClaims: true, acceptsPhotoEvidence: true },
      displayOrder: 8
    },
    {
      name: 'Travelers',
      code: 'travelers',
      type: 'insurance',
      contact: {
        claimsEmail: 'claims@travelers.com',
        claimsPhone: '1-800-252-4633',
        claimsPortalUrl: 'https://www.travelers.com/claims',
        generalWebsite: 'https://www.travelers.com'
      },
      features: { acceptsVideoClaims: true, acceptsPhotoEvidence: true },
      displayOrder: 9
    },
    {
      name: 'American Family',
      code: 'american_family',
      type: 'mutual',
      contact: {
        claimsEmail: 'claims@amfam.com',
        claimsPhone: '1-800-692-6326',
        claimsPortalUrl: 'https://www.amfam.com/claims',
        generalWebsite: 'https://www.amfam.com'
      },
      features: { acceptsVideoClaims: true, acceptsPhotoEvidence: true },
      displayOrder: 10
    },
    {
      name: 'Other',
      code: 'other',
      type: 'insurance',
      contact: {},
      features: { acceptsVideoClaims: true, acceptsPhotoEvidence: true },
      displayOrder: 999
    }
  ];

  for (const partner of defaults) {
    await this.findOneAndUpdate(
      { code: partner.code },
      partner,
      { upsert: true, new: true }
    );
  }

  console.log('[InsurancePartner] Seeded default insurance partners');
};

const InsurancePartner = mongoose.model('InsurancePartner', insurancePartnerSchema);

export default InsurancePartner;
