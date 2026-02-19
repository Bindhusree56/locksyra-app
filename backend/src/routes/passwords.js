const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/jwtAuth');
const { asyncHandler } = require('../middleware/errorHandler');
const SavedPassword = require('../models/SavedPassword');

// Analyze password strength (helper)
const analyzeStrength = (password) => {
  let score = 0;
  if (password.length >= 16) score += 30;
  else if (password.length >= 12) score += 25;
  else if (password.length >= 8) score += 15;
  if (/[a-z]/.test(password)) score += 10;
  if (/[A-Z]/.test(password)) score += 10;
  if (/[0-9]/.test(password)) score += 10;
  if (/[^a-zA-Z0-9]/.test(password)) score += 15;
  const common = ['123', 'abc', 'password', 'qwerty', '111'];
  if (common.some(p => password.toLowerCase().includes(p))) score -= 25;
  score = Math.max(0, Math.min(100, score));
  let level = 'weak';
  if (score >= 80) level = 'strong';
  else if (score >= 50) level = 'medium';
  return { score, level };
};

/**
 * GET /api/passwords
 * Get all saved passwords for the logged-in user
 */
router.get('/', protect, asyncHandler(async (req, res) => {
  const passwords = await SavedPassword.find({ userId: req.userId })
    .sort({ createdAt: -1 })
    .lean();

  // Decrypt passwords before sending
  const decrypted = passwords.map(p => {
    const entry = new SavedPassword(p);
    entry._id = p._id;
    return {
      id: p._id,
      website: p.website,
      username: p.username,
      password: entry.getDecryptedPassword(),
      strength: p.strength,
      notes: p.notes,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt
    };
  });

  res.json({ success: true, data: { passwords: decrypted } });
}));

/**
 * POST /api/passwords
 * Save a new password entry
 */
router.post('/', protect, asyncHandler(async (req, res) => {
  const { website, username, password, notes } = req.body;

  if (!website || !username || !password) {
    return res.status(400).json({
      success: false,
      message: 'Website, username, and password are required'
    });
  }

  const strength = analyzeStrength(password);

  const entry = await SavedPassword.createEncrypted({
    userId: req.userId,
    website,
    username,
    password,
    strength,
    notes
  });

  res.status(201).json({
    success: true,
    message: 'Password saved successfully',
    data: {
      id: entry._id,
      website: entry.website,
      username: entry.username,
      password, // Return plaintext once so UI can display it
      strength: entry.strength,
      notes: entry.notes,
      createdAt: entry.createdAt
    }
  });
}));

/**
 * PUT /api/passwords/:id
 * Update a saved password entry
 */
router.put('/:id', protect, asyncHandler(async (req, res) => {
  const { website, username, password, notes } = req.body;

  const entry = await SavedPassword.findOne({ _id: req.params.id, userId: req.userId });

  if (!entry) {
    return res.status(404).json({ success: false, message: 'Password entry not found' });
  }

  if (website) entry.website = website;
  if (username) entry.username = username;
  if (notes !== undefined) entry.notes = notes;

  if (password) {
    const { encrypt } = require('../services/encryption');
    entry.encryptedPassword = encrypt(password);
    entry.strength = analyzeStrength(password);
  }

  await entry.save();

  const decryptedPw = password || entry.getDecryptedPassword();

  res.json({
    success: true,
    message: 'Password updated successfully',
    data: {
      id: entry._id,
      website: entry.website,
      username: entry.username,
      password: decryptedPw,
      strength: entry.strength,
      notes: entry.notes,
      updatedAt: entry.updatedAt
    }
  });
}));

/**
 * DELETE /api/passwords/:id
 * Delete a saved password entry
 */
router.delete('/:id', protect, asyncHandler(async (req, res) => {
  const entry = await SavedPassword.findOneAndDelete({ _id: req.params.id, userId: req.userId });

  if (!entry) {
    return res.status(404).json({ success: false, message: 'Password entry not found' });
  }

  res.json({ success: true, message: 'Password deleted successfully' });
}));

module.exports = router;