const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User');
const { createAccessToken, createRefreshToken, verifyRefreshToken } = require('../utils/jwtHelper');
const { protect } = require('../middleware/jwtAuth');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../services/emailService');
const crypto = require('crypto');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const { asyncHandler } = require('../middleware/errorHandler');

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
    
    // Generate and send verification email
    const verificationToken = user.generateVerificationToken();
    await user.save();
    
    await sendVerificationEmail(user.email, verificationToken);

    console.log('✅ User registered:', email);

    res.status(201).json({
      success: true,
      message: 'Account created successfully! Please check your email to verify.',
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

    // If 2FA is enabled, don't issue tokens yet
    if (user.twoFactorEnabled) {
      // Create a short-lived temp token for 2FA verification
      const tempToken = jwt.sign(
        { userId: user._id, type: '2fa_pending' },
        process.env.JWT_SECRET,
        { expiresIn: '5m' }
      );

      return res.json({
        success: true,
        message: 'Please provide your 2FA token to continue.',
        data: {
          require2FA: true,
          tempToken
        }
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

/**
 * DELETE /api/auth/me
 */
router.delete('/me', protect, asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Import related models for cleanup
  const SavedPassword = require('../models/SavedPassword');
  const BreachCheck = require('../models/BreachCheck');
  
  // Perform cleanup in parallel
  await Promise.all([
    SavedPassword.deleteMany({ userId }),
    BreachCheck.deleteMany({ userId }),
    User.findByIdAndDelete(userId)
  ]);

  logger.info(`🗑️ User account deleted: ${req.user.email}`);
  
  res.json({
    success: true,
    message: 'Your account and all associated data have been permanently deleted.'
  });
}));

/**
 * POST /api/auth/2fa/generate
 * (Protected - requires user to be logged in)
 */
router.post('/2fa/generate', protect, asyncHandler(async (req, res) => {
  const user = req.user;

  if (user.twoFactorEnabled) {
    return res.status(400).json({ success: false, message: '2FA is already enabled' });
  }

  const secret = speakeasy.generateSecret({
    name: `LockSyra (${user.email})`
  });

  // Store secret temporarily but don't enable yet
  user.twoFactorSecret = secret.base32;
  await user.save();

  const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);

  res.json({
    success: true,
    data: {
      qrCode: qrCodeUrl,
      secret: secret.base32
    }
  });
}));

/**
 * POST /api/auth/2fa/verify
 * (Protected - verify and enable 2FA)
 */
router.post('/2fa/verify', protect, asyncHandler(async (req, res) => {
  const { token } = req.body;
  const user = await User.findById(req.user._id).select('+twoFactorSecret');

  if (!token) {
    return res.status(400).json({ success: false, message: '2FA token is required' });
  }

  const verified = speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: 'base32',
    token: token
  });

  if (!verified) {
    return res.status(400).json({ success: false, message: 'Invalid 2FA token' });
  }

  user.twoFactorEnabled = true;
  await user.save();

  res.json({ success: true, message: '2FA enabled successfully!' });
}));

/**
 * POST /api/auth/2fa/disable
 * (Protected)
 */
router.post('/2fa/disable', protect, asyncHandler(async (req, res) => {
  const { token } = req.body;
  const user = await User.findById(req.user._id).select('+twoFactorSecret');

  if (!token) {
    return res.status(400).json({ success: false, message: '2FA token is required to disable' });
  }

  const verified = speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: 'base32',
    token: token
  });

  if (!verified) {
    return res.status(400).json({ success: false, message: 'Invalid 2FA token' });
  }

  user.twoFactorEnabled = false;
  user.twoFactorSecret = undefined;
  await user.save();

  res.json({ success: true, message: '2FA disabled successfully' });
}));

/**
 * POST /api/auth/login/verify-2fa
 */
router.post('/login/verify-2fa', asyncHandler(async (req, res) => {
  const { tempToken, token } = req.body;

  if (!tempToken || !token) {
    return res.status(400).json({ success: false, message: 'Temp token and 2FA token are required' });
  }

  const jwt = require('jsonwebtoken');
  let decoded;
  try {
    decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired session' });
  }

  if (decoded.type !== '2fa_pending') {
    return res.status(401).json({ success: false, message: 'Invalid token type' });
  }

  const user = await User.findById(decoded.userId).select('+twoFactorSecret');
  if (!user) {
    return res.status(401).json({ success: false, message: 'User not found' });
  }

  const verified = speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: 'base32',
    token: token
  });

  if (!verified) {
    return res.status(400).json({ success: false, message: 'Invalid 2FA token' });
  }

  // Success — reset attempts
  if (user.resetLoginAttempts) await user.resetLoginAttempts();

  // Generate tokens
  const accessToken = createAccessToken(user._id);
  const refreshToken = createRefreshToken(user._id);

  user.refreshToken = refreshToken;
  user.lastLogin = new Date();
  await user.save();

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
}));

/**
 * POST /api/auth/verify-email
 */
router.post('/verify-email', asyncHandler(async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ success: false, message: 'Verification token is required' });
  }

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    emailVerificationToken: hashedToken
  });

  if (!user) {
    return res.status(400).json({ success: false, message: 'Invalid or expired verification token' });
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  await user.save();

  res.json({ success: true, message: 'Email verified successfully!' });
}));

/**
 * POST /api/auth/forgot-password
 */
router.post('/forgot-password', asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required' });
  }

  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user) {
    // Return success even if user not found to avoid account harvesting
    return res.json({ success: true, message: 'If an account exists, a reset link has been sent.' });
  }

  const resetToken = user.generatePasswordResetToken();
  await user.save();

  await sendPasswordResetEmail(user.email, resetToken);

  res.json({ success: true, message: 'Password reset link sent successfully.' });
}));

/**
 * POST /api/auth/reset-password
 */
router.post('/reset-password', asyncHandler(async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({ success: false, message: 'Token and new password are required' });
  }

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  }).select('+password');

  if (!user) {
    return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
  }

  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  res.json({ success: true, message: 'Password reset successful! You can now log in.' });
}));

module.exports = router;