'use strict';

const crypto = require('crypto');
const axios = require('axios');
const logger = require('../utils/logger');
const { analyzePasswordStrength } = require('../utils/passwordStrength');

// Re-export so callers don't need to import from two places
module.exports.analyzePasswordStrength = analyzePasswordStrength;

// ─── Email breach check ───────────────────────────────────────────────────────

const checkEmailBreaches = async (email) => {
  try {
    const apiKey = process.env.HIBP_API_KEY;

    if (apiKey) {
      try {
        const response = await axios.get(
          `https://haveibeenpwned.com/api/v3/breachedaccount/${encodeURIComponent(email)}`,
          {
            headers: {
              'hibp-api-key': apiKey,
              'user-agent': 'LockSyra-Security-App',
              Accept: 'application/json',
            },
            timeout: 10000,
          }
        );

        if (response.data && Array.isArray(response.data)) {
          return response.data.map((breach) => ({
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
            severity: calculateSeverity(breach.PwnCount, breach.DataClasses),
          }));
        }
      } catch (error) {
        if (error.response && error.response.status === 404) {
          logger.info(`No breaches found for ${email}`);
          return [];
        }
        logger.warn('HIBP API error, trying fallback:', error.message);
      }
    }

    if (process.env.DEHASHED_API_KEY) {
      try {
        const auth = Buffer.from(
          `${process.env.DEHASHED_EMAIL}:${process.env.DEHASHED_API_KEY}`
        ).toString('base64');
        const response = await axios.get(
          `https://api.dehashed.com/search?query=email:${encodeURIComponent(email)}`,
          {
            headers: { Authorization: `Basic ${auth}`, Accept: 'application/json' },
            timeout: 10000,
          }
        );
        if (response.data && response.data.entries) {
          return formatDeHashedResults(response.data.entries);
        }
      } catch (error) {
        logger.warn('DeHashed API error:', error.message);
      }
    }

    logger.warn(`Could not check breaches for ${email} — all APIs unavailable`);
    return [];
  } catch (error) {
    logger.error('Email breach check failed:', error);
    throw new Error('Unable to check email breaches. Please try again later.');
  }
};

// ─── Password breach check (k-anonymity — always free) ────────────────────────

const checkPasswordBreach = async (password) => {
  try {
    const sha1Hash = crypto.createHash('sha1').update(password).digest('hex').toUpperCase();
    const prefix = sha1Hash.substring(0, 5);
    const suffix = sha1Hash.substring(5);

    const response = await axios.get(`https://api.pwnedpasswords.com/range/${prefix}`, {
      headers: { 'user-agent': 'LockSyra-Security-App' },
      timeout: 10000,
    });

    const hashes = response.data.split('\n');
    for (const line of hashes) {
      const [hashSuffix, count] = line.split(':');
      if (hashSuffix.trim() === suffix) {
        const breachCount = parseInt(count.trim());
        return {
          breached: true,
          count: breachCount,
          message: `⚠️ This password appeared in ${breachCount.toLocaleString()} data breaches!`,
          severity: breachCount > 10000 ? 'critical' : breachCount > 1000 ? 'high' : 'medium',
        };
      }
    }

    return {
      breached: false,
      count: 0,
      message: '✅ This password has not been found in any known breaches!',
      severity: 'none',
    };
  } catch (error) {
    logger.error('Password breach check failed:', error);
    throw new Error('Unable to check password. Please try again.');
  }
};

// ─── URL phishing check ───────────────────────────────────────────────────────

const checkPhishingURL = async (url) => {
  try {
    const apiKey = process.env.IPQS_API_KEY;

    if (!apiKey) return performBasicURLCheck(url);

    const response = await axios.get(
      `https://www.ipqualityscore.com/api/json/url/${apiKey}/${encodeURIComponent(url)}`,
      { timeout: 10000 }
    );

    const data = response.data;
    if (!data || !data.success) return performBasicURLCheck(url);

    const riskScore = data.risk_score || 0;

    return {
      url,
      safe: riskScore < 75,
      risk: riskScore >= 85 ? 'high' : riskScore >= 50 ? 'medium' : 'low',
      score: riskScore,
      details: {
        malware: data.malware || false,
        phishing: data.phishing || false,
        suspicious: data.suspicious || false,
        parking: data.parking || false,
        spamming: data.spamming || false,
        adult: data.adult || false,
        category: data.category || 'unknown',
      },
      domain: data.domain || new URL(url).hostname,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    logger.error('URL check failed:', error);
    return performBasicURLCheck(url);
  }
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const calculateSeverity = (pwnCount, dataClasses = []) => {
  let severity = 'low';
  if (pwnCount > 500_000_000) severity = 'critical';
  else if (pwnCount > 100_000_000) severity = 'high';
  else if (pwnCount > 10_000_000) severity = 'medium';

  const sensitiveClasses = [
    'Passwords', 'Credit cards', 'Bank account numbers',
    'Social security numbers', 'Payment histories',
  ];
  const hasSensitive = dataClasses.some((dc) => sensitiveClasses.includes(dc));
  if (hasSensitive && severity === 'medium') severity = 'high';
  else if (hasSensitive && severity === 'low') severity = 'medium';

  return severity;
};

const formatDeHashedResults = (entries) => {
  const breachMap = new Map();
  entries.forEach((entry) => {
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
        severity: 'medium',
      });
    }
    const breach = breachMap.get(breachName);
    breach.PwnCount += 1;
    if (entry.password) breach.DataClasses.add('Passwords');
    if (entry.email) breach.DataClasses.add('Email addresses');
    if (entry.username) breach.DataClasses.add('Usernames');
    if (entry.name) breach.DataClasses.add('Names');
    if (entry.phone) breach.DataClasses.add('Phone numbers');
    if (entry.address) breach.DataClasses.add('Physical addresses');
  });

  return Array.from(breachMap.values()).map((breach) => ({
    ...breach,
    DataClasses: Array.from(breach.DataClasses),
    severity: calculateSeverity(breach.PwnCount, Array.from(breach.DataClasses)),
  }));
};

const performBasicURLCheck = (urlString) => {
  const suspiciousPatterns = [
    /paypal.*verify/i,
    /secure.*account/i,
    /suspended.*account/i,
    /update.*billing/i,
    /confirm.*identity/i,
    /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/,
    /bit\.ly|tinyurl|goo\.gl|t\.co/,
  ];

  let riskScore = 0;
  const flags = [];

  suspiciousPatterns.forEach((pattern) => {
    if (pattern.test(urlString)) {
      riskScore += 20;
      flags.push('Suspicious pattern detected');
    }
  });

  if (!urlString.startsWith('https://')) {
    riskScore += 30;
    flags.push('Not using secure HTTPS');
  }

  if (/\.(tk|ml|ga|cf|gq|xyz|top|work|click|link)$/i.test(urlString)) {
    riskScore += 15;
    flags.push('Unusual domain extension');
  }

  try {
    const domain = new URL(urlString).hostname;
    const wellKnown = ['google.com', 'facebook.com', 'amazon.com', 'microsoft.com', 'apple.com'];
    if (!wellKnown.some((wd) => domain.includes(wd))) riskScore += 5;
  } catch {
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
      catch { return 'Invalid URL'; }
    })(),
    timestamp: new Date().toISOString(),
    offline: true,
  };
};

module.exports = {
  checkEmailBreaches,
  checkPasswordBreach,
  analyzePasswordStrength,
  checkPhishingURL,
};