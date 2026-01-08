const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { 
  authenticateToken, 
  generateAccessToken, 
  generateRefreshToken,
  verifyRefreshToken,
  logSecurityEvent
} = require('../middleware/auth');
const { authLimiter, passwordResetLimiter } = require('../middleware/rateLimiter');
const { validateRegistration, validateLogin, validateEmail } = require('../middleware/validation');
const { asyncHandler } = require('../middleware/errorHandler');
const { generateToken } = require('../services/encryption');

// Register new user
router.post('/register', 
  authLimiter,
  validateRegistration,
  asyncHandler(async (req, res) => {
    const { email, password, firstName, lastName } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      await logSecurityEvent(null, 'register', {
        action: 'Registration attempt with existing email',
        severity: 'warning',
        success: false
      }, req);

      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Create new user
    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      emailVerificationToken: generateToken()
    });

    // Generate tokens
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    // Save refresh token
    await user.update({ refreshToken });

    // Log security event
    await logSecurityEvent(user.id, 'register', {
      action: 'New user registered',
      severity: 'info',
      success: true
    }, req);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        user: user.toJSON(),
        accessToken,
        refreshToken
      }
    });
  })
);

// Login
router.post('/login',
  authLimiter,
  validateLogin,
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      await logSecurityEvent(null, 'failed_login', {
        action: 'Login attempt with non-existent email',
        severity: 'warning',
        success: false,
        email
      }, req);

      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if account is locked
    if (user.isLocked()) {
      await logSecurityEvent(user.id, 'failed_login', {
        action: 'Login attempt on locked account',
        severity: 'warning',
        success: false
      }, req);

      return res.status(403).json({
        success: false,
        message: 'Account temporarily locked due to multiple failed attempts'
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      await user.incrementLoginAttempts();
      
      await logSecurityEvent(user.id, 'failed_login', {
        action: 'Failed login attempt - incorrect password',
        severity: 'warning',
        success: false,
        attempts: user.loginAttempts + 1
      }, req);

      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
        attemptsRemaining: Math.max(0, 5 - (user.loginAttempts + 1))
      });
    }

    // Reset login attempts on successful login
    await user.resetLoginAttempts();

    // Generate tokens
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    // Save refresh token
    await user.update({ refreshToken });

    // Log successful login
    await logSecurityEvent(user.id, 'login', {
      action: 'Successful login',
      severity: 'info',
      success: true
    }, req);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: user.toJSON(),
        accessToken,
        refreshToken
      }
    });
  })
);

// Refresh token
router.post('/refresh',
  asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token required'
      });
    }

    const user = await verifyRefreshToken(refreshToken);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    // Generate new tokens
    const newAccessToken = generateAccessToken(user.id);
    const newRefreshToken = generateRefreshToken(user.id);

    // Update refresh token
    await user.update({ refreshToken: newRefreshToken });

    res.json({
      success: true,
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      }
    });
  })
);

// Logout
router.post('/logout',
  authenticateToken,
  asyncHandler(async (req, res) => {
    // Clear refresh token
    await req.user.update({ refreshToken: null });

    await logSecurityEvent(req.userId, 'logout', {
      action: 'User logged out',
      severity: 'info',
      success: true
    }, req);

    res.json({
      success: true,
      message: 'Logout successful'
    });
  })
);

// Get current user
router.get('/me',
  authenticateToken,
  asyncHandler(async (req, res) => {
    res.json({
      success: true,
      data: {
        user: req.user.toJSON()
      }
    });
  })
);

// Request password reset
router.post('/forgot-password',
  passwordResetLimiter,
  validateEmail,
  asyncHandler(async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });

    // Always return success to prevent email enumeration
    if (!user) {
      return res.json({
        success: true,
        message: 'If that email exists, a password reset link has been sent'
      });
    }

    // Generate reset token
    const resetToken = generateToken();
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour

    await user.update({
      passwordResetToken: resetToken,
      passwordResetExpires: resetExpires
    });

    await logSecurityEvent(user.id, 'password_reset', {
      action: 'Password reset requested',
      severity: 'info',
      success: true
    }, req);

    // TODO: Send email with reset link
    // For now, just log it (in production, use email service)
    console.log(`Password reset token for ${email}: ${resetToken}`);

    res.json({
      success: true,
      message: 'If that email exists, a password reset link has been sent'
    });
  })
);

// Reset password
router.post('/reset-password',
  asyncHandler(async (req, res) => {
    const { token, newPassword } = req.body;

    const user = await User.findOne({
      where: {
        passwordResetToken: token,
        passwordResetExpires: {
          [require('sequelize').Op.gt]: new Date()
        }
      }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Update password
    await user.update({
      password: newPassword,
      passwordResetToken: null,
      passwordResetExpires: null
    });

    await logSecurityEvent(user.id, 'password_change', {
      action: 'Password reset completed',
      severity: 'info',
      success: true
    }, req);

    res.json({
      success: true,
      message: 'Password reset successful'
    });
  })
);

module.exports = router;