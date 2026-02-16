const crypto = require('crypto');
const axios = require('axios');
const logger = require('../utils/logger');

/**
 * Check if email has been in data breaches using HIBP API v3
 * @param {string} email - Email to check
 * @returns {Promise<Array>} - Array of breach data
 */
const checkEmailBreaches = async (email) => {
  try {
    const apiKey = process.env.HIBP_API_KEY;
    
    // Method 1: Use HIBP API if key is available (MOST ACCURATE)
    if (apiKey) {
      try {
        const response = await axios.get(
          `https://haveibeenpwned.com/api/v3/breachedaccount/${encodeURIComponent(email)}`,
          {
            headers: {
              'hibp-api-key': apiKey,
              'user-agent': 'LockSyra-Security-App',
              'Accept': 'application/json'
            },
            timeout: 10000
          }
        );

        if (response.data && Array.isArray(response.data)) {
          return response.data.map(breach => ({
            Name: breach.Name,
            Title: breach.Title,
            Domain: breach.Domain,
            BreachDate: breach.BreachDate,
            AddedDate: breach.AddedDate,
            ModifiedDate: breach.ModifiedDate,
            PwnCount: breach.PwnCount,
            Description: breach.Description,
            DataClasses: breach.DataClasses || [],
            IsVerified: breach.IsVerified,
            IsFabricated: breach.IsFabricated,
            IsSensitive: breach.IsSensitive,
            IsRetired: breach.IsRetired,
            IsSpamList: breach.IsSpamList,
            LogoPath: breach.LogoPath,
            severity: calculateSeverity(breach.PwnCount, breach.DataClasses)
          }));
        }
      } catch (error) {
        if (error.response && error.response.status === 404) {
          // 404 means no breaches found - this is good!
          logger.info(`No breaches found for ${email}`);
          return [];
        }
        logger.warn('HIBP API error, trying fallback:', error.message);
      }
    }

    // Method 2: Try DeHashed API (Alternative, requires API key)
    // You can sign up at https://www.dehashed.com/
    if (process.env.DEHASHED_API_KEY) {
      try {
        const auth = Buffer.from(`${process.env.DEHASHED_EMAIL}:${process.env.DEHASHED_API_KEY}`).toString('base64');
        const response = await axios.get(
          `https://api.dehashed.com/search?query=email:${encodeURIComponent(email)}`,
          {
            headers: {
              'Authorization': `Basic ${auth}`,
              'Accept': 'application/json'
            },
            timeout: 10000
          }
        );

        if (response.data && response.data.entries) {
          return formatDeHashedResults(response.data.entries);
        }
      } catch (error) {
        logger.warn('DeHashed API error:', error.message);
      }
    }

    // Method 3: Try BreachDirectory API (Free tier available)
    try {
      const response = await axios.get(
        `https://breachdirectory.p.rapidapi.com/?func=auto&term=${encodeURIComponent(email)}`,
        {
          headers: {
            'X-RapidAPI-Key': process.env.RAPIDAPI_KEY || '',
            'X-RapidAPI-Host': 'breachdirectory.p.rapidapi.com'
          },
          timeout: 10000
        }
      );

      if (response.data && response.data.found) {
        return formatBreachDirectoryResults(response.data);
      }
    } catch (error) {
      logger.warn('BreachDirectory API error:', error.message);
    }

    // If all APIs fail, return empty array (don't use mock data in production)
    logger.warn(`Could not check breaches for ${email} - all APIs unavailable`);
    return [];

  } catch (error) {
    logger.error('Email breach check failed:', error);
    throw new Error('Unable to check email breaches. Please try again later.');
  }
};

/**
 * Calculate breach severity based on count and data classes
 */
const calculateSeverity = (pwnCount, dataClasses = []) => {
  let severity = 'low';
  
  // High user count = more severe
  if (pwnCount > 500000000) {
    severity = 'critical';
  } else if (pwnCount > 100000000) {
    severity = 'high';
  } else if (pwnCount > 10000000) {
    severity = 'medium';
  }
  
  // Sensitive data classes increase severity
  const sensitiveClasses = ['Passwords', 'Credit cards', 'Bank account numbers', 'Social security numbers', 'Payment histories'];
  const hasSensitiveData = dataClasses.some(dc => sensitiveClasses.includes(dc));
  
  if (hasSensitiveData && severity === 'medium') {
    severity = 'high';
  } else if (hasSensitiveData && severity === 'low') {
    severity = 'medium';
  }
  
  return severity;
};

/**
 * Format DeHashed results to match our structure
 */
const formatDeHashedResults = (entries) => {
  const breachMap = new Map();
  
  entries.forEach(entry => {
    const breachName = entry.database_name || 'Unknown Breach';
    
    if (!breachMap.has(breachName)) {
      breachMap.set(breachName, {
        Name: breachName,
        Title: breachName,
        Domain: entry.obtained_from || 'Unknown',
        BreachDate: entry.breach_date || 'Unknown',
        PwnCount: 0,
        Description: `Data breach discovered in ${breachName}`,
        DataClasses: new Set(),
        severity: 'medium'
      });
    }
    
    const breach = breachMap.get(breachName);
    breach.PwnCount += 1;
    
    // Add data classes
    if (entry.password) breach.DataClasses.add('Passwords');
    if (entry.email) breach.DataClasses.add('Email addresses');
    if (entry.username) breach.DataClasses.add('Usernames');
    if (entry.name) breach.DataClasses.add('Names');
    if (entry.phone) breach.DataClasses.add('Phone numbers');
    if (entry.address) breach.DataClasses.add('Physical addresses');
  });
  
  return Array.from(breachMap.values()).map(breach => ({
    ...breach,
    DataClasses: Array.from(breach.DataClasses),
    severity: calculateSeverity(breach.PwnCount, Array.from(breach.DataClasses))
  }));
};

/**
 * Format BreachDirectory results
 */
const formatBreachDirectoryResults = (data) => {
  if (!data.result || !Array.isArray(data.result)) {
    return [];
  }
  
  const breaches = data.result.map(item => ({
    Name: item.source || 'Unknown Source',
    Title: item.source || 'Data Breach',
    Domain: item.source || 'Unknown',
    BreachDate: item.date || 'Unknown',
    PwnCount: data.found || 1,
    Description: `Breach found in ${item.source}`,
    DataClasses: extractDataClasses(item),
    severity: 'medium'
  }));
  
  return breaches;
};

/**
 * Extract data classes from breach item
 */
const extractDataClasses = (item) => {
  const classes = [];
  
  if (item.password || item.hash) classes.push('Passwords');
  if (item.email) classes.push('Email addresses');
  if (item.username) classes.push('Usernames');
  if (item.name) classes.push('Names');
  if (item.phone) classes.push('Phone numbers');
  if (item.address) classes.push('Addresses');
  
  return classes;
};

/**
 * Check if password has been pwned using HIBP Pwned Passwords API (k-anonymity)
 * This is ALWAYS free and accurate!
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
    
    // Query HIBP Pwned Passwords API (FREE, NO API KEY NEEDED)
    const response = await axios.get(
      `https://api.pwnedpasswords.com/range/${prefix}`,
      {
        headers: {
          'user-agent': 'LockSyra-Security-App'
        },
        timeout: 10000
      }
    );

    const text = response.data;
    
    // Parse response and find our hash suffix
    const hashes = text.split('\n');
    for (const line of hashes) {
      const [hashSuffix, count] = line.split(':');
      if (hashSuffix.trim() === suffix) {
        const breachCount = parseInt(count.trim());
        return {
          breached: true,
          count: breachCount,
          message: `⚠️ This password appeared in ${breachCount.toLocaleString()} data breaches!`,
          severity: breachCount > 10000 ? 'critical' : breachCount > 1000 ? 'high' : 'medium'
        };
      }
    }
    
    return {
      breached: false,
      count: 0,
      message: '✅ This password has not been found in any known breaches!',
      severity: 'none'
    };
  } catch (error) {
    logger.error('Password breach check failed:', error);
    throw new Error('Unable to check password. Please try again.');
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
  if (password.length >= 16) {
    score += 30;
  } else if (password.length >= 12) {
    score += 25;
  } else if (password.length >= 8) {
    score += 15;
  } else {
    feedback.push('Use at least 12 characters for better security');
  }
  
  // Character variety checks
  if (/[a-z]/.test(password)) {
    score += 10;
  } else {
    feedback.push('Add lowercase letters');
  }
  
  if (/[A-Z]/.test(password)) {
    score += 10;
  } else {
    feedback.push('Add uppercase letters');
  }
  
  if (/[0-9]/.test(password)) {
    score += 10;
  } else {
    feedback.push('Add numbers');
  }
  
  if (/[^a-zA-Z0-9]/.test(password)) {
    score += 15;
  } else {
    feedback.push('Add special characters (!@#$%^&*)');
  }
  
  // Complexity bonus
  const uniqueChars = new Set(password).size;
  if (uniqueChars > password.length * 0.7) {
    score += 10;
  }
  
  // Common patterns penalty
  const commonPatterns = ['123', 'abc', 'password', 'qwerty', '111', '000', 'admin', 'letmein'];
  if (commonPatterns.some(p => password.toLowerCase().includes(p))) {
    score -= 25;
    feedback.push('Avoid common patterns like "123" or "password"');
  }
  
  // Repeated characters penalty
  if (/(.)\1{2,}/.test(password)) {
    score -= 10;
    feedback.push('Avoid repeated characters (e.g., "aaa" or "111")');
  }
  
  // Sequential characters penalty
  if (/abc|bcd|cde|def|123|234|345|456/i.test(password)) {
    score -= 10;
    feedback.push('Avoid sequential characters');
  }
  
  // Normalize score
  score = Math.max(0, Math.min(100, score));
  
  // Determine level
  let level = 'weak';
  if (score >= 85) level = 'excellent';
  else if (score >= 70) level = 'strong';
  else if (score >= 50) level = 'medium';
  
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
      return performBasicURLCheck(url);
    }
    
    const response = await axios.get(
      `https://www.ipqualityscore.com/api/json/url/${apiKey}/${encodeURIComponent(url)}`,
      { timeout: 10000 }
    );
    
    const data = response.data;
    
    if (!data || !data.success) {
      return performBasicURLCheck(url);
    }
    
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
        adult: data.adult || false,
        category: data.category || 'unknown'
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
    /bit\.ly|tinyurl|goo\.gl|t\.co/, // URL shorteners
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
  const unusualTLDs = /\.(tk|ml|ga|cf|gq|xyz|top|work|click|link)$/i;
  if (unusualTLDs.test(urlString)) {
    riskScore += 15;
    flags.push('Unusual domain extension');
  }
  
  // Check domain age (would require DNS lookup in production)
  try {
    const domain = new URL(urlString).hostname;
    const wellKnownDomains = ['google.com', 'facebook.com', 'amazon.com', 'microsoft.com', 'apple.com'];
    if (!wellKnownDomains.some(wd => domain.includes(wd))) {
      riskScore += 5;
    }
  } catch (e) {
    riskScore += 20;
    flags.push('Invalid URL format');
  }
  
  return {
    url: urlString,
    safe: riskScore < 50,
    risk: riskScore >= 70 ? 'high' : riskScore >= 40 ? 'medium' : 'low',
    score: Math.min(100, riskScore),
    details: { flags },
    domain: (() => {
      try { return new URL(urlString).hostname; }
      catch (e) { return 'Invalid URL'; }
    })(),
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