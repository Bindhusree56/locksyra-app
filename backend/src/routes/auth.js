const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User');
const { createAccessToken, createRefreshToken, verifyRefreshToken } = require('../utils/jwtHelper');
const { protect } = require('../middleware/jwtAuth');

/**
 * POST /api/auth/register
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    // Check if user already exists — give a CLEAR message
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'This email is already registered. Please sign in instead.',
        code: 'EMAIL_ALREADY_EXISTS'
      });
    }

    // Hash password
    // const salt = await bcrypt.genSalt(12);
    // const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      email: email.toLowerCase(),
      password: password,
      firstName: firstName || '',
      lastName: lastName || ''
    });

    // Generate tokens
    const accessToken = createAccessToken(user._id);
    const refreshToken = createRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    console.log('✅ User registered:', email);

    res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          securityScore: user.securityScore
        },
        accessToken,
        refreshToken
      }
    });

  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({ success: false, message: 'Registration failed. Please try again.' });
  }
});

/**
 * POST /api/auth/login
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    // Find user — return SPECIFIC message if not found
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'No account found with this email. Please register first.',
        code: 'USER_NOT_FOUND'
      });
    }

    // Check if account is locked
    if (user.isLocked && user.isLocked()) {
      return res.status(403).json({
        success: false,
        message: 'Account temporarily locked due to too many failed attempts. Try again later.',
        code: 'ACCOUNT_LOCKED'
      });
    }

    // Verify password — return SPECIFIC message if wrong
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      if (user.incrementLoginAttempts) await user.incrementLoginAttempts();
      return res.status(401).json({
        success: false,
        message: 'Incorrect password. Please try again.',
        code: 'WRONG_PASSWORD'
      });
    }

    // Success — reset attempts
    if (user.resetLoginAttempts) await user.resetLoginAttempts();

    // Generate tokens
    const accessToken = createAccessToken(user._id, { email: user.email, role: user.role || 'user' });
    const refreshToken = createRefreshToken(user._id);

    user.refreshToken = refreshToken;
    user.lastLogin = new Date();
    await user.save();

    console.log('✅ User logged in:', email);

    res.json({
      success: true,
      message: 'Login successful!',
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          securityScore: user.securityScore,
          lastLogin: user.lastLogin
        },
        accessToken,
        refreshToken
      }
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ success: false, message: 'Login failed. Please try again.' });
  }
});

/**
 * POST /api/auth/refresh
 */
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ success: false, message: 'Refresh token required' });
    }

    const result = verifyRefreshToken(refreshToken);
    if (!result.valid) {
      return res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
    }

    const user = await User.findById(result.decoded.userId).select('+refreshToken');
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ success: false, message: 'Invalid refresh token' });
    }

    const newAccessToken = createAccessToken(user._id);
    const newRefreshToken = createRefreshToken(user._id);

    user.refreshToken = newRefreshToken;
    await user.save();

    res.json({
      success: true,
      data: { accessToken: newAccessToken, refreshToken: newRefreshToken }
    });

  } catch (error) {
    console.error('❌ Token refresh error:', error);
    res.status(500).json({ success: false, message: 'Token refresh failed' });
  }
});

/**
 * POST /api/auth/logout
 */
router.post('/logout', protect, async (req, res) => {
  try {
    req.user.refreshToken = null;
    await req.user.save();
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('❌ Logout error:', error);
    res.status(500).json({ success: false, message: 'Logout failed' });
  }
});

/**
 * GET /api/auth/me
 */
router.get('/me', protect, (req, res) => {
  res.json({
    success: true,
    data: {
      user: {
        id: req.user._id,
        email: req.user.email,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        securityScore: req.user.securityScore,
        lastLogin: req.user.lastLogin,
        isEmailVerified: req.user.isEmailVerified
      }
    }
  });
});

module.exports = router;