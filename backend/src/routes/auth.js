const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User');
const { createAccessToken, createRefreshToken, verifyRefreshToken } = require('../utils/jwtHelper');
const { protect } = require('../middleware/jwtAuth');

/**
 * 📝 REGISTER USER
 * POST /api/auth/register
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // 1️⃣ Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: '❌ Email already registered'
      });
    }

    // 2️⃣ Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3️⃣ Create user
    const user = await User.create({
      email,
      password: hashedPassword,
      firstName,
      lastName
    });

    // 4️⃣ Generate tokens
    const accessToken = createAccessToken(user._id);
    const refreshToken = createRefreshToken(user._id);

    // 5️⃣ Save refresh token to database
    user.refreshToken = refreshToken;
    await user.save();

    console.log('✅ User registered:', email);

    // 6️⃣ Send response
    res.status(201).json({
      success: true,
      message: '✅ Registration successful',
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName
        },
        accessToken,
        refreshToken
      }
    });

  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({
      success: false,
      message: '⚠️ Registration failed',
      error: error.message
    });
  }
});

/**
 * 🔐 LOGIN USER
 * POST /api/auth/login
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1️⃣ Find user (include password field)
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '❌ Invalid email or password'
      });
    }

    // 2️⃣ Check if account is locked
    if (user.isLocked && user.isLocked()) {
      return res.status(403).json({
        success: false,
        message: '🔒 Account locked. Try again later.'
      });
    }

    // 3️⃣ Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      // Increment failed login attempts
      if (user.incrementLoginAttempts) {
        await user.incrementLoginAttempts();
      }

      return res.status(401).json({
        success: false,
        message: '❌ Invalid email or password'
      });
    }

    // 4️⃣ Reset login attempts
    if (user.resetLoginAttempts) {
      await user.resetLoginAttempts();
    }

    // 5️⃣ Generate tokens
    const accessToken = createAccessToken(user._id, {
      email: user.email,
      role: user.role || 'user'
    });
    const refreshToken = createRefreshToken(user._id);

    // 6️⃣ Save refresh token
    user.refreshToken = refreshToken;
    user.lastLogin = new Date();
    await user.save();

    console.log('✅ User logged in:', email);

    // 7️⃣ Send response
    res.json({
      success: true,
      message: '✅ Login successful',
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
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      message: '⚠️ Login failed',
      error: error.message
    });
  }
});

/**
 * 🔄 REFRESH TOKEN
 * POST /api/auth/refresh
 */
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: '❌ Refresh token required'
      });
    }

    // 1️⃣ Verify refresh token
    const result = verifyRefreshToken(refreshToken);

    if (!result.valid) {
      return res.status(401).json({
        success: false,
        message: '❌ Invalid refresh token'
      });
    }

    // 2️⃣ Find user and check if token matches
    const user = await User.findById(result.decoded.userId).select('+refreshToken');

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({
        success: false,
        message: '❌ Invalid refresh token'
      });
    }

    // 3️⃣ Generate new tokens
    const newAccessToken = createAccessToken(user._id);
    const newRefreshToken = createRefreshToken(user._id);

    // 4️⃣ Update refresh token in database
    user.refreshToken = newRefreshToken;
    await user.save();

    console.log('✅ Tokens refreshed for:', user.email);

    res.json({
      success: true,
      message: '✅ Tokens refreshed',
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      }
    });

  } catch (error) {
    console.error('❌ Token refresh error:', error);
    res.status(500).json({
      success: false,
      message: '⚠️ Token refresh failed',
      error: error.message
    });
  }
});

/**
 * 🔓 LOGOUT
 * POST /api/auth/logout
 */
router.post('/logout', protect, async (req, res) => {
  try {
    // Clear refresh token from database
    req.user.refreshToken = null;
    await req.user.save();

    console.log('✅ User logged out:', req.user.email);

    res.json({
      success: true,
      message: '✅ Logout successful'
    });

  } catch (error) {
    console.error('❌ Logout error:', error);
    res.status(500).json({
      success: false,
      message: '⚠️ Logout failed',
      error: error.message
    });
  }
});

/**
 * 👤 GET CURRENT USER
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
        lastLogin: req.user.lastLogin
      }
    }
  });
});

module.exports = router;