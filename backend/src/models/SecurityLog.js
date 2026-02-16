const mongoose = require('mongoose');

const securityLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  action: {
    type: String,
    required: true
  },
  actionType: {
    type: String,
    required: true,
    enum: ['login', 'logout', 'register', 'failed_login', 'password_reset', 'password_change', 'breach_check', 'other'],
    index: true
  },
  severity: {
    type: String,
    enum: ['info', 'warning', 'error', 'critical'],
    default: 'info',
    index: true
  },
  ipAddress: {
    type: String,
    maxlength: 50
  },
  userAgent: {
    type: String
  },
  details: {
    type: mongoose.Schema.Types.Mixed
  },
  success: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
securityLogSchema.index({ userId: 1, createdAt: -1 });
securityLogSchema.index({ actionType: 1, createdAt: -1 });
securityLogSchema.index({ severity: 1, createdAt: -1 });

const SecurityLog = mongoose.model('SecurityLog', securityLogSchema);

module.exports = SecurityLog;