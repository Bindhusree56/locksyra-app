const jwt = require('jsonwebtoken');

/**
 * 🎫 CREATE JWT ACCESS TOKEN
 * Short-lived token (15 minutes) for API requests
 */
const createAccessToken = (userId, additionalPayload = {}) => {
  const payload = {
    userId: userId.toString(),
    type: 'access',
    ...additionalPayload
  };

  const options = {
    expiresIn: process.env.JWT_EXPIRE || '15m',
    issuer: 'locksyra-api',
    audience: 'locksyra-client'
  };

  return jwt.sign(payload, process.env.JWT_SECRET, options);
};

/**
 * 🔄 CREATE JWT REFRESH TOKEN
 * Long-lived token (7 days) to get new access tokens
 */
const createRefreshToken = (userId) => {
  const payload = {
    userId: userId.toString(),
    type: 'refresh'
  };

  const options = {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d',
    issuer: 'locksyra-api',
    audience: 'locksyra-client'
  };

  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, options);
};

/**
 * ✅ VERIFY ACCESS TOKEN
 */
const verifyAccessToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      issuer: 'locksyra-api',
      audience: 'locksyra-client'
    });

    if (decoded.type !== 'access') {
      throw new Error('Invalid token type');
    }

    return { valid: true, decoded };
  } catch (error) {
    return { valid: false, error: error.message };
  }
};

/**
 * ✅ VERIFY REFRESH TOKEN
 */
const verifyRefreshToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET, {
      issuer: 'locksyra-api',
      audience: 'locksyra-client'
    });

    if (decoded.type !== 'refresh') {
      throw new Error('Invalid token type');
    }

    return { valid: true, decoded };
  } catch (error) {
    return { valid: false, error: error.message };
  }
};

/**
 * 🔍 DECODE TOKEN (without verification)
 * Useful for debugging
 */
const decodeToken = (token) => {
  return jwt.decode(token, { complete: true });
};

/**
 * ⏰ GET TOKEN EXPIRATION TIME
 */
const getTokenExpiration = (token) => {
  const decoded = jwt.decode(token);
  if (!decoded || !decoded.exp) return null;
  
  return new Date(decoded.exp * 1000);
};

/**
 * ✅ CHECK IF TOKEN IS EXPIRED
 */
const isTokenExpired = (token) => {
  const expiration = getTokenExpiration(token);
  if (!expiration) return true;
  
  return expiration < new Date();
};

module.exports = {
  createAccessToken,
  createRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  decodeToken,
  getTokenExpiration,
  isTokenExpired
};