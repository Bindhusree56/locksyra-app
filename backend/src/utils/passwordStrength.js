

'use strict';

const COMMON_PATTERNS = [
  'password', '123456', 'qwerty', '111111', 'abc123',
  'letmein', 'welcome', 'admin', 'login', 'passw0rd',
  '123', 'abc', '000', 'iloveyou',
];

/**
 * @param {string} password
 * @returns {{ score: number, level: string, feedback: string[] }}
 */
const analyzePasswordStrength = (password) => {
  if (!password) return { score: 0, level: 'none', feedback: [] };

  let score = 0;
  const feedback = [];

  if (password.length >= 16) score += 30;
  else if (password.length >= 12) score += 25;
  else if (password.length >= 8) score += 15;
  else feedback.push('Use at least 12 characters for better security');

  if (/[a-z]/.test(password)) score += 10;
  else feedback.push('Add lowercase letters');

  if (/[A-Z]/.test(password)) score += 10;
  else feedback.push('Add uppercase letters');

  if (/[0-9]/.test(password)) score += 10;
  else feedback.push('Add numbers');

  if (/[^a-zA-Z0-9]/.test(password)) score += 15;
  else feedback.push('Add special characters (!@#$%^&*)');

  const uniqueChars = new Set(password).size;
  if (uniqueChars > password.length * 0.7) score += 10;

  if (COMMON_PATTERNS.some((p) => password.toLowerCase().includes(p))) {
    score -= 25;
    feedback.push('Avoid common patterns like "password" or "123"');
  }

  if (/(.)\1{2,}/.test(password)) {
    score -= 10;
    feedback.push('Avoid repeated characters');
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

module.exports = { analyzePasswordStrength };