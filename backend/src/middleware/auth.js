const jwt = require('jsonwebtoken');
const { asyncHandler } = require('./errorHandler');
const User = require('../models/User');
const SecurityLog = require('../models/SecurityLog');

/**
 * Generate JWT Access Token
 * @param {string} userId - User's MongoDB ObjectId
 * @returns {string} - JWT token
 */
const generateAccessToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  return jwt.sign(
    { 
      userId: userId.toString(),
      type: 'access'
    },
    process.env.JWT_SECRET,
    { 
      expiresIn: process.env.JWT_EXPIRE || '1h',
      issuer: 'locksyra-backend',
      audience: 'locksyra-app'
    }
  );
};

/**
 * Generate JWT Refresh Token
 * @param {string} userId - User's MongoDB ObjectId
 * @returns {string} - JWT refresh token
 */
const generateRefreshToken = (userId) => {
  if (!process.env.JWT_REFRESH_SECRET) {
    throw new Error('JWT_REFRESH_SECRET is not defined in environment variables');
  }

  return jwt.sign(
    { 
      userId: userId.toString(),
      type: 'refresh'
    },
    process.env.JWT_REFRESH_SECRET,
    { 
      expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d',
      issuer: 'locksyra-backend',
      audience: 'locksyra-app'
    }
  );
};

/**
 * Authenticate JWT Token Middleware
 * Validates access token and attaches user to request
 */
const authenticateToken = asyncHandler(async (req, res, next) => {
  // Get token from header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required',
      code: 'NO_TOKEN'
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      issuer: 'locksyra-backend',
      audience: 'locksyra-app'
    });

    // Check token type
    if (decoded.type !== 'access') {
      return res.status(403).json({
        success: false,
        message: 'Invalid token type',
        code: 'INVALID_TOKEN_TYPE'
      });
    }

    // Find user by ID
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    // Check if account is locked
    if (user.isLocked()) {
      return res.status(403).json({
        success: false,
        message: 'Account is locked',
        code: 'ACCOUNT_LOCKED'
      });
    }

    // Attach user to request
    req.userId = decoded.userId;
    req.user = user;
    
    next();
  } catch (error) {
    // Handle specific JWT errors
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired',
        code: 'TOKEN_EXPIRED',
        expiredAt: error.expiredAt
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({
        success: false,
        message: 'Invalid token',
        code: 'INVALID_TOKEN',
        error: error.message
      });
    }

    if (error.name === 'NotBeforeError') {
      return res.status(403).json({
        success: false,
        message: 'Token not active',
        code: 'TOKEN_NOT_ACTIVE'
      });
    }

    // Generic error
    return res.status(403).json({
      success: false,
      message: 'Token verification failed',
      code: 'TOKEN_VERIFICATION_FAILED'
    });
  }
});

/**
 * Verify Refresh Token
 * @param {string} token - Refresh token to verify
 * @returns {Promise<User|null>} - User object if valid, null otherwise
 */
const verifyRefreshToken = async (token) => {
  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET, {
      issuer: 'locksyra-backend',
      audience: 'locksyra-app'
    });

    // Check token type
    if (decoded.type !== 'refresh') {
      return null;
    }

    // Find user and check if refresh token matches
    const user = await User.findById(decoded.userId).select('+refreshToken');

    if (!user || user.refreshToken !== token) {
      return null;
    }

    return user;
  } catch (error) {
    console.error('Refresh token verification failed:', error.message);
    return null;
  }
};

/**
 * Decode JWT without verification (for debugging)
 * @param {string} token - JWT token
 * @returns {object} - Decoded token payload
 */
const decodeToken = (token) => {
  try {
    return jwt.decode(token, { complete: true });
  } catch (error) {
    return null;
  }
};

/**
 * Log security events
 * @param {string} userId - User's MongoDB ObjectId (can be null)
 * @param {string} actionType - Type of action (login, logout, etc.)
 * @param {object} details - Additional details
 * @param {object} req - Express request object
 */
const logSecurityEvent = async (userId, actionType, details, req) => {
  try {
    await SecurityLog.create({
      userId: userId || null,
      actionType,
      action: details.action || actionType,
      severity: details.severity || 'info',
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent'),
      details,
      success: details.success !== undefined ? details.success : true
    });
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
};

/**
 * Optional: Middleware to check if user has specific role
 * (For future role-based access control)
 */
const requireRole = (roles) => {
  return asyncHandler(async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Add role field to User model if you want RBAC
    const userRole = req.user.role || 'user';
    
    if (!roles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    next();
  });
};

/**
 * Optional: Middleware to verify user owns the resource
 */
const verifyOwnership = (resourceUserIdField = 'userId') => {
  return asyncHandler(async (req, res, next) => {
    const resourceUserId = req.params[resourceUserIdField] || req.body[resourceUserIdField];
    
    if (!resourceUserId) {
      return res.status(400).json({
        success: false,
        message: 'Resource user ID not provided'
      });
    }

    if (resourceUserId.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You do not own this resource'
      });
    }

    next();
  });
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  authenticateToken,
  verifyRefreshToken,
  decodeToken,
  logSecurityEvent,
  requireRole,
  verifyOwnership
};