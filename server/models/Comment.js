import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  violationReport: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ViolationReport',
    required: true,
    index: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: true,
    maxlength: 500,
    trim: true
  },

  // Likes
  likes: {
    count: {
      type: Number,
      default: 0
    },
    users: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  },

  // Soft deletion
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: Date,
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  // Moderation flags
  flags: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: {
      type: String,
      enum: ['spam', 'harassment', 'misinformation', 'inappropriate', 'other']
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Indexes for efficient querying
commentSchema.index({ violationReport: 1, createdAt: -1 });
commentSchema.index({ violationReport: 1, 'likes.count': -1 });
commentSchema.index({ author: 1 });
commentSchema.index({ isDeleted: 1 });

// Method to check if user has liked the comment
commentSchema.methods.hasUserLiked = function(userId) {
  return this.likes.users.some(id => id.toString() === userId.toString());
};

// Method to toggle like
commentSchema.methods.toggleLike = function(userId) {
  const userIdStr = userId.toString();
  const index = this.likes.users.findIndex(id => id.toString() === userIdStr);

  if (index > -1) {
    // Unlike
    this.likes.users.splice(index, 1);
    this.likes.count = Math.max(0, this.likes.count - 1);
    return false;
  } else {
    // Like
    this.likes.users.push(userId);
    this.likes.count += 1;
    return true;
  }
};

// Method to soft delete
commentSchema.methods.softDelete = function(deletedBy) {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.deletedBy = deletedBy;
};

// Query helper to exclude deleted comments
commentSchema.query.notDeleted = function() {
  return this.where({ isDeleted: false });
};

export default mongoose.model('Comment', commentSchema);
