const mongoose = require('mongoose');
const { encrypt, decrypt } = require('../services/encryption');

const savedPasswordSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  website: {
    type: String,
    required: [true, 'Website is required'],
    trim: true
  },
  username: {
    type: String,
    required: [true, 'Username is required'],
    trim: true
  },
  // Stored encrypted
  encryptedPassword: {
    type: String,
    required: true
  },
  strength: {
    score: { type: Number, default: 0 },
    level: { type: String, default: 'weak' }
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 500
  }
}, {
  timestamps: true
});

// Indexes
savedPasswordSchema.index({ userId: 1, createdAt: -1 });
savedPasswordSchema.index({ userId: 1, website: 1 });

// Virtual: decrypt password when accessed
savedPasswordSchema.methods.getDecryptedPassword = function() {
  try {
    return decrypt(this.encryptedPassword);
  } catch (error) {
    console.error('Decryption failed for entry:', this._id);
    return null;
  }
};

// Static: create with encryption
savedPasswordSchema.statics.createEncrypted = async function(data) {
  const { encrypt } = require('../services/encryption');
  const encryptedPassword = encrypt(data.password);
  
  return this.create({
    userId: data.userId,
    website: data.website,
    username: data.username,
    encryptedPassword,
    strength: data.strength || { score: 0, level: 'weak' },
    notes: data.notes || ''
  });
};

const SavedPassword = mongoose.model('SavedPassword', savedPasswordSchema);

module.exports = SavedPassword;