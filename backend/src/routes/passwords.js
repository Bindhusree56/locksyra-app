'use strict';

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/jwtAuth');
const { asyncHandler } = require('../middleware/errorHandler');
const SavedPassword = require('../models/SavedPassword');
const { analyzePasswordStrength } = require('../utils/passwordStrength');

/**
 * GET /api/passwords
 */
router.get('/', protect, asyncHandler(async (req, res) => {
  const passwords = await SavedPassword.find({ userId: req.userId })
    .sort({ createdAt: -1 })
    .lean();

  const decrypted = passwords.map((p) => {
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
      updatedAt: p.updatedAt,
    };
  });

  res.json({ success: true, data: { passwords: decrypted } });
}));

/**
 * POST /api/passwords
 */
router.post('/', protect, asyncHandler(async (req, res) => {
  const { website, username, password, notes } = req.body;

  if (!website || !username || !password) {
    return res.status(400).json({
      success: false,
      message: 'Website, username, and password are required',
    });
  }

  const strength = analyzePasswordStrength(password);

  const entry = await SavedPassword.createEncrypted({
    userId: req.userId,
    website,
    username,
    password,
    strength: { score: strength.score, level: strength.level },
    notes,
  });

  res.status(201).json({
    success: true,
    message: 'Password saved successfully',
    data: {
      id: entry._id,
      website: entry.website,
      username: entry.username,
      password,
      strength: entry.strength,
      notes: entry.notes,
      createdAt: entry.createdAt,
    },
  });
}));

/**
 * PUT /api/passwords/:id
 */
router.put('/:id', protect, asyncHandler(async (req, res) => {
  const { website, username, password, notes } = req.body;

  const entry = await SavedPassword.findOne({ _id: req.params.id, userId: req.userId });
  if (!entry) {
    return res.status(404).json({ success: false, message: 'Password entry not found' });
  }

  if (website)               entry.website  = website;
  if (username)              entry.username = username;
  if (notes !== undefined)   entry.notes    = notes;

  if (password) {
    const { encrypt } = require('../services/encryption');
    entry.encryptedPassword = encrypt(password);
    const str = analyzePasswordStrength(password);
    entry.strength = { score: str.score, level: str.level };
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
      updatedAt: entry.updatedAt,
    },
  });
}));

/**
 * DELETE /api/passwords/:id
 */
router.delete('/:id', protect, asyncHandler(async (req, res) => {
  const entry = await SavedPassword.findOneAndDelete({ _id: req.params.id, userId: req.userId });
  if (!entry) {
    return res.status(404).json({ success: false, message: 'Password entry not found' });
  }
  res.json({ success: true, message: 'Password deleted successfully' });
}));

module.exports = router;