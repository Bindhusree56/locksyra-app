const crypto = require('crypto');

/**
 * Generate cryptographically secure random token
 * @param {number} length - Token length in bytes
 * @returns {string} - Hex string token
 */
const generateSecureToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

/**
 * Generate numeric OTP (One-Time Password)
 * @param {number} digits - Number of digits (default: 6)
 * @returns {string} - Numeric OTP
 */
const generateOTP = (digits = 6) => {
  const max = Math.pow(10, digits) - 1;
  const min = Math.pow(10, digits - 1);
  return Math.floor(Math.random() * (max - min + 1) + min).toString();
};

/**
 * Hash data using SHA-256
 * @param {string} data - Data to hash
 * @returns {string} - Hashed data (hex)
 */
const hashData = (data) => {
  return crypto.createHash('sha256').update(data).digest('hex');
};

/**
 * Create HMAC signature
 * @param {string} data - Data to sign
 * @param {string} secret - Secret key
 * @returns {string} - HMAC signature
 */
const createSignature = (data, secret) => {
  return crypto.createHmac('sha256', secret).update(data).digest('hex');
};

/**
 * Verify HMAC signature
 * @param {string} data - Original data
 * @param {string} signature - Signature to verify
 * @param {string} secret - Secret key
 * @returns {boolean} - True if valid
 */
const verifySignature = (data, signature, secret) => {
  const expectedSignature = createSignature(data, secret);
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
};

/**
 * Generate API key
 * @returns {string} - API key
 */
const generateAPIKey = () => {
  return `lks_${crypto.randomBytes(32).toString('base64url')}`;
};

module.exports = {
  generateSecureToken,
  generateOTP,
  hashData,
  createSignature,
  verifySignature,
  generateAPIKey
};