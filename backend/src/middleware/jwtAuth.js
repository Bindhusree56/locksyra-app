const { verifyAccessToken } = require('../utils/jwtHelper');
const User = require('../models/User');

/**
 * 🔒 PROTECT ROUTES WITH JWT
 * Add this middleware to any route that requires authentication
 */
const protect = async (req, res, next) => {
  let token;

  // 1️⃣ Check if token exists in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  // Also check cookies (optional)
  else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  // 2️⃣ No token? Deny access
  if (!token) {
    return res.status(401).json({
      success: false,
      message: '🚫 Access denied. No token provided.',
      code: 'NO_TOKEN'
    });
  }

  try {
    // 3️⃣ Verify token
    const result = verifyAccessToken(token);

    if (!result.valid) {
      return res.status(401).json({
        success: false,
        message: `🚫 Invalid token: ${result.error}`,
        code: 'INVALID_TOKEN'
      });
    }

    // 4️⃣ Get user from database
    const user = await User.findById(result.decoded.userId).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: '🚫 User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    // 5️⃣ Check if account is locked
    if (user.isLocked && user.isLocked()) {
      return res.status(403).json({
        success: false,
        message: '🔒 Account is locked',
        code: 'ACCOUNT_LOCKED'
      });
    }

    // 6️⃣ Attach user to request
    req.user = user;
    req.userId = user._id;
    req.tokenPayload = result.decoded;

    next();
  } catch (error) {
    console.error('❌ JWT Middleware Error:', error);
    return res.status(500).json({
      success: false,
      message: '⚠️ Token verification failed',
      code: 'TOKEN_ERROR'
    });
  }
};

/**
 * 👑 OPTIONAL: Check user role
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: '🚫 Not authenticated'
      });
    }

    if (!roles.includes(req.user.role || 'user')) {
      return res.status(403).json({
        success: false,
        message: '🚫 Insufficient permissions',
        required: roles,
        current: req.user.role || 'user'
      });
    }

    next();
  };
};

module.exports = { protect, authorize };