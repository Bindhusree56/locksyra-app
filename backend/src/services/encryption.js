const crypto = require('crypto');

const ALGORITHM = process.env.ENCRYPTION_ALGORITHM || 'aes-256-gcm';
const KEY = Buffer.from(process.env.ENCRYPTION_KEY || '', 'hex');

if (KEY.length !== 32) {
  throw new Error('Encryption key must be 32 bytes (64 hex characters)');
}

/**
 * Encrypt data using AES-256-GCM
 * @param {string} text - Text to encrypt
 * @returns {string} - Encrypted text with IV and auth tag
 */
const encrypt = (text) => {
  try {
    // Generate random IV (Initialization Vector)
    const iv = crypto.randomBytes(16);
    
    // Create cipher
    const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
    
    // Encrypt the data
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Get auth tag for GCM mode
    const authTag = cipher.getAuthTag();
    
    // Return IV + authTag + encrypted data (all hex encoded)
    return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
  } catch (error) {
    throw new Error(`Encryption failed: ${error.message}`);
  }
};

/**
 * Decrypt data using AES-256-GCM
 * @param {string} encryptedData - Encrypted text with IV and auth tag
 * @returns {string} - Decrypted text
 */
const decrypt = (encryptedData) => {
  try {
    // Split the encrypted data
    const parts = encryptedData.split(':');
    
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted data format');
    }
    
    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];
    
    // Create decipher
    const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
    decipher.setAuthTag(authTag);
    
    // Decrypt the data
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    throw new Error(`Decryption failed: ${error.message}`);
  }
};

/**
 * Hash data using SHA-256
 * @param {string} data - Data to hash
 * @returns {string} - Hashed data (hex)
 */
const hash = (data) => {
  return crypto.createHash('sha256').update(data).digest('hex');
};

/**
 * Generate random token
 * @param {number} length - Token length in bytes (default: 32)
 * @returns {string} - Random token (hex)
 */
const generateToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

/**
 * Compare hash with plain text
 * @param {string} plainText - Plain text to compare
 * @param {string} hashedText - Hashed text
 * @returns {boolean} - True if match
 */
const compareHash = (plainText, hashedText) => {
  const hashedPlain = hash(plainText);
  return crypto.timingSafeEqual(
    Buffer.from(hashedPlain),
    Buffer.from(hashedText)
  );
};

/**
 * Encrypt sensitive data for storage
 * Useful for storing API keys, tokens, etc.
 */
const encryptSensitiveData = (data) => {
  if (!data) return null;
  
  if (typeof data === 'object') {
    return encrypt(JSON.stringify(data));
  }
  
  return encrypt(String(data));
};

/**
 * Decrypt sensitive data from storage
 */
const decryptSensitiveData = (encryptedData) => {
  if (!encryptedData) return null;
  
  try {
    const decrypted = decrypt(encryptedData);
    
    // Try to parse as JSON
    try {
      return JSON.parse(decrypted);
    } catch {
      return decrypted;
    }
  } catch (error) {
    throw new Error(`Failed to decrypt data: ${error.message}`);
  }
};

module.exports = {
  encrypt,
  decrypt,
  hash,
  generateToken,
  compareHash,
  encryptSensitiveData,
  decryptSensitiveData
};