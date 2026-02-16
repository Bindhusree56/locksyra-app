const mongoose = require('mongoose');

const breachCheckSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  breachCount: {
    type: Number,
    default: 0
  },
  breached: {
    type: Boolean,
    default: false
  },
  breachDetails: {
    type: mongoose.Schema.Types.Mixed,
    default: []
  },
  checkType: {
    type: String,
    enum: ['email', 'password', 'url'],
    default: 'email'
  },
  ipAddress: {
    type: String,
    maxlength: 50
  },
  userAgent: {
    type: String
  }
}, {
  timestamps: true
});

// Indexes for better query performance
breachCheckSchema.index({ userId: 1, createdAt: -1 });
breachCheckSchema.index({ email: 1 });

const BreachCheck = mongoose.model('BreachCheck', breachCheckSchema);

module.exports = BreachCheck;