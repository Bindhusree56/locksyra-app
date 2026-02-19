/**
 * Breach utilities
 * 
 * NOTE: Email breach checks now go through the backend API (which uses HIBP).
 * This ensures consistent, reliable, non-random results.
 * 
 * The password strength check uses the HIBP Pwned Passwords API (k-anonymity, always free).
 */

/**
 * Check if a PASSWORD has been in breaches (k-anonymity, always free and reliable)
 * Only the first 5 chars of the SHA-1 hash are sent to HIBP — never the actual password.
 */
export const checkPasswordBreach = async (password) => {
  if (!password) return { breached: false, count: 0, message: 'No password provided' };

  try {
    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest('SHA-1', encoder.encode(password));
    const hashHex = Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase();

    const prefix = hashHex.substring(0, 5);
    const suffix = hashHex.substring(5);

    const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      headers: { 'Add-Padding': 'true' }
    });

    if (!response.ok) throw new Error(`HIBP returned ${response.status}`);

    const text = await response.text();

    for (const line of text.split('\n')) {
      const [hashSuffix, count] = line.split(':');
      if (hashSuffix?.trim() === suffix) {
        const breachCount = parseInt(count.trim());
        return {
          breached: true,
          count: breachCount,
          message: `⚠️ This password appeared in ${breachCount.toLocaleString()} data breaches!`
        };
      }
    }

    return {
      breached: false,
      count: 0,
      message: '✅ This password has not been found in any known data breaches.'
    };
  } catch (error) {
    console.error('Password breach check failed:', error);
    return {
      breached: false,
      count: 0,
      message: '⚠️ Could not check breach database. Please try again later.'
    };
  }
};

/**
 * Password strength analysis (fully offline, no API needed)
 */
export const analyzePasswordStrength = (password) => {
  if (!password) return { score: 0, level: 'none', feedback: [] };

  let score = 0;
  const feedback = [];

  if (password.length >= 16) score += 30;
  else if (password.length >= 12) score += 25;
  else if (password.length >= 8) score += 15;
  else feedback.push('Use at least 12 characters for better security');

  if (/[a-z]/.test(password)) score += 10;
  else feedback.push('Add lowercase letters (a–z)');

  if (/[A-Z]/.test(password)) score += 10;
  else feedback.push('Add uppercase letters (A–Z)');

  if (/[0-9]/.test(password)) score += 10;
  else feedback.push('Add numbers (0–9)');

  if (/[^a-zA-Z0-9]/.test(password)) score += 15;
  else feedback.push('Add special characters (!@#$%^&*)');

  // Uniqueness bonus
  const uniqueChars = new Set(password).size;
  if (uniqueChars > password.length * 0.7) score += 10;

  // Penalties
  const commonPatterns = ['123', 'abc', 'password', 'qwerty', '111', '000', 'admin', 'letmein', 'welcome'];
  if (commonPatterns.some(p => password.toLowerCase().includes(p))) {
    score -= 25;
    feedback.push('Avoid common patterns like "123" or "password"');
  }

  if (/(.)\1{2,}/.test(password)) {
    score -= 10;
    feedback.push('Avoid repeated characters (e.g. "aaa" or "111")');
  }

  if (/abc|bcd|cde|def|123|234|345|456/i.test(password)) {
    score -= 10;
    feedback.push('Avoid sequential characters');
  }

  score = Math.max(0, Math.min(100, score));

  let level = 'weak';
  if (score >= 85) level = 'excellent';
  else if (score >= 70) level = 'strong';
  else if (score >= 50) level = 'medium';

  return { score, level, feedback };
};

/**
 * Legacy alias — email breach checks should go through the backend API.
 * This function is kept for component compatibility but now returns an error
 * so components know to use the API instead.
 */
export const checkBreaches = async (email) => {
  console.warn('checkBreaches: Please use api.checkEmailBreach() for consistent results via the backend.');
  return [];
};

export const GOOGLE_CONFIG = {
  CLIENT_ID: '',
  API_KEY: '',
  DISCOVERY_DOCS: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
  SCOPES: 'https://www.googleapis.com/auth/spreadsheets'
};

export const SHEET_ID = '';
export const SHEET_NAME = 'BreachLogs';
