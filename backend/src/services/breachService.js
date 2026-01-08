const crypto = require('crypto');
const fetch = require('node-fetch');
const logger = require('../utils/logger');

/**
 * Check if email has been in data breaches using HIBP API
 * @param {string} email - Email to check
 * @returns {Promise<Array>} - Array of breach data
 */
const checkEmailBreaches = async (email) => {
  try {
    const apiKey = process.env.HIBP_API_KEY;
    
    // Use HIBP API if key is available
    if (apiKey) {
      const response = await fetch(
        `https://haveibeenpwned.com/api/v3/breachedaccount/${encodeURIComponent(email)}`,
        {
          headers: {
            'hibp-api-key': apiKey,
            'user-agent': 'SecureU-App'
          }
        }
      );

      if (response.status === 404) {
        return []; // No breaches found
      }

      if (!response.ok) {
        throw new Error(`HIBP API returned ${response.status}`);
      }

      const breaches = await response.json();
      
      return breaches.map(breach => ({
        Name: breach.Name,
        Title: breach.Title,
        Domain: breach.Domain,
        BreachDate: breach.BreachDate,
        PwnCount: breach.PwnCount,
        Description: breach.Description,
        DataClasses: breach.DataClasses,
        IsVerified: breach.IsVerified,
        IsSensitive: breach.IsSensitive,
        severity: breach.PwnCount > 500000000 ? 'critical' : 
                  breach.PwnCount > 100000000 ? 'high' : 'medium'
      }));
    }

    // Fallback: Try Firefox Monitor (free, no key needed)
    try {
      const response = await fetch(
        `https://monitor.firefox.com/api/v1/breach?email=${encodeURIComponent(email)}`
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.breaches && data.breaches.length > 0) {
          return data.breaches.map(breach => ({
            Name: breach.Name,
            Title: breach.Title,
            Domain: breach.Domain,
            BreachDate: breach.BreachDate,
            PwnCount: breach.PwnCount || 0,
            Description: breach.Description,
            DataClasses: breach.DataClasses || [],
            severity: 'medium'
          }));
        }
      }
    } catch (firefoxError) {
      logger.warn('Firefox Monitor check failed:', firefoxError.message);
    }

    return [];
  } catch (error) {
    logger.error('Email breach check failed:', error);
    throw error;
  }
};

/**
 * Check if password has been pwned using HIBP Pwned Passwords API (k-anonymity)
 * @param {string} password - Password to check
 * @returns {Promise<Object>} - Breach status and count
 */
const checkPasswordBreach = async (password) => {
  try {
    // Hash the password with SHA-1
    const sha1Hash = crypto.createHash('sha1')
      .update(password)
      .digest('hex')
      .toUpperCase();
    
    // Use k-anonymity: send only first 5 characters
    const prefix = sha1Hash.substring(0, 5);
    const suffix = sha1Hash.substring(5);
    
    // Query HIBP Pwned Passwords API
    const response = await fetch(
      `https://api.pwnedpasswords.com/range/${prefix}`,
      {
        headers: {
          'user-agent': 'SecureU-App'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Pwned Passwords API returned ${response.status}`);
    }

    const text = await response.text();
    
    // Parse response and find our hash suffix
    const hashes = text.split('\n');
    for (const line of hashes) {
      const [hashSuffix, count] = line.split(':');
      if (hashSuffix === suffix) {
        return {
          breached: true,
          count: parseInt(count.trim()),
          message: `⚠️ This password appeared in ${parseInt(count).toLocaleString()} data breaches!`
        };
      }
    }
    
    return {
      breached: false,
      count: 0,
      message: '✅ This password has not been found in any known breaches!'
    };
  } catch (error) {
    logger.error('Password breach check failed:', error);
    throw error;
  }
};

/**
 * Analyze password strength
 * @param {string} password - Password to analyze
 * @returns {Object} - Strength analysis
 */
const analyzePasswordStrength = (password) => {
  let score = 0;
  const feedback = [];
  
  // Length check
  if (password.length >= 12) {
    score += 25;
  } else if (password.length >= 8) {
    score += 15;
  } else {
    feedback.push('Use at least 12 characters for better security');
  }
  
  // Lowercase check
  if (/[a-z]/.test(password)) {
    score += 15;
  } else {
    feedback.push('Add lowercase letters');
  }
  
  // Uppercase check
  if (/[A-Z]/.test(password)) {
    score += 15;
  } else {
    feedback.push('Add uppercase letters');
  }
  
  // Number check
  if (/[0-9]/.test(password)) {
    score += 15;
  } else {
    feedback.push('Add numbers');
  }
  
  // Special character check
  if (/[^a-zA-Z0-9]/.test(password)) {
    score += 20;
  } else {
    feedback.push('Add special characters (!@#$%^&*)');
  }
  
  // Common patterns penalty
  const commonPatterns = ['123', 'abc', 'password', 'qwerty', '111', '000'];
  if (commonPatterns.some(p => password.toLowerCase().includes(p))) {
    score -= 20;
    feedback.push('Avoid common patterns like "123" or "abc"');
  }
  
  // Repeated characters penalty
  if (/(.)\1{2,}/.test(password)) {
    score -= 10;
    feedback.push('Avoid repeated characters (e.g., "aaa" or "111")');
  }
  
  // Normalize score
  score = Math.max(0, Math.min(100, score));
  
  // Determine level
  let level = 'weak';
  if (score >= 80) level = 'excellent';
  else if (score >= 60) level = 'strong';
  else if (score >= 40) level = 'medium';
  
  return {
    score,
    level,
    feedback,
    strength: level
  };
};

/**
 * Check URL for phishing using IPQualityScore API
 * @param {string} url - URL to check
 * @returns {Promise<Object>} - Safety analysis
 */
const checkPhishingURL = async (url) => {
  try {
    const apiKey = process.env.IPQS_API_KEY;
    
    if (!apiKey) {
      // Fallback to basic client-side checks
      return performBasicURLCheck(url);
    }
    
    const response = await fetch(
      `https://www.ipqualityscore.com/api/json/url/${apiKey}/${encodeURIComponent(url)}`,
      { method: 'GET' }
    );
    
    if (!response.ok) {
      throw new Error(`IPQS API returned ${response.status}`);
    }
    
    const data = await response.json();
    
    const riskScore = data.risk_score || 0;
    const isSafe = riskScore < 75;
    
    return {
      url,
      safe: isSafe,
      risk: riskScore >= 85 ? 'high' : riskScore >= 50 ? 'medium' : 'low',
      score: riskScore,
      details: {
        malware: data.malware || false,
        phishing: data.phishing || false,
        suspicious: data.suspicious || false,
        parking: data.parking || false,
        spamming: data.spamming || false,
        adult: data.adult || false
      },
      domain: data.domain || new URL(url).hostname,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    logger.error('URL check failed:', error);
    return performBasicURLCheck(url);
  }
};

/**
 * Basic URL safety check (fallback)
 */
const performBasicURLCheck = (urlString) => {
  const suspiciousPatterns = [
    /paypal.*verify/i,
    /secure.*account/i,
    /suspended.*account/i,
    /update.*billing/i,
    /confirm.*identity/i,
    /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/, // IP address
    /bit\.ly|tinyurl|goo\.gl/, // URL shorteners
  ];
  
  let riskScore = 0;
  const flags = [];
  
  suspiciousPatterns.forEach(pattern => {
    if (pattern.test(urlString)) {
      riskScore += 20;
      flags.push('Suspicious pattern detected');
    }
  });
  
  // Check for HTTPS
  if (!urlString.startsWith('https://')) {
    riskScore += 30;
    flags.push('Not using secure HTTPS');
  }
  
  // Check for unusual TLDs
  const unusualTLDs = /\.(tk|ml|ga|cf|gq|xyz|top|work)$/i;
  if (unusualTLDs.test(urlString)) {
    riskScore += 15;
    flags.push('Unusual domain extension');
  }
  
  return {
    url: urlString,
    safe: riskScore < 50,
    risk: riskScore >= 70 ? 'high' : riskScore >= 40 ? 'medium' : 'low',
    score: Math.min(100, riskScore),
    details: { flags },
    domain: new URL(urlString).hostname,
    timestamp: new Date().toISOString(),
    offline: true
  };
};

module.exports = {
  checkEmailBreaches,
  checkPasswordBreach,
  analyzePasswordStrength,
  checkPhishingURL
};