import mongoose from 'mongoose';

const policeStationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Station name is required'],
    trim: true
  },
  jurisdiction: {
    type: String,
    required: [true, 'Jurisdiction is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    trim: true
  },
  address: {
    street: String,
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    zip: String,
    country: {
      type: String,
      default: 'USA'
    }
  },
  location: {
    lat: Number,
    lng: Number
  },
  serviceArea: {
    type: {
      type: String,
      enum: ['Polygon', 'Circle'],
      default: 'Circle'
    },
    coordinates: mongoose.Schema.Types.Mixed,
    radiusKm: {
      type: Number,
      default: 50
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  preferences: {
    reportFormat: {
      type: String,
      enum: ['pdf', 'json', 'both'],
      default: 'pdf'
    },
    includedFields: [String],
    autoNotify: {
      type: Boolean,
      default: false
    },
    notifyOnSeverity: [{
      type: String,
      enum: ['low', 'medium', 'high', 'critical']
    }]
  },
  contactPerson: {
    name: String,
    title: String,
    directEmail: String,
    directPhone: String
  }
}, {
  timestamps: true
});

// Indexes
policeStationSchema.index({ 'address.city': 1, 'address.state': 1 });
policeStationSchema.index({ isActive: 1 });
policeStationSchema.index({ 'location.lat': 1, 'location.lng': 1 });

// Virtual for full address
policeStationSchema.virtual('fullAddress').get(function() {
  const addr = this.address;
  return `${addr.street || ''}, ${addr.city}, ${addr.state} ${addr.zip || ''}, ${addr.country}`.trim();
});

export default mongoose.model('PoliceStation', policeStationSchema);
