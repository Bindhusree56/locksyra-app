

const COMMON_PATTERNS = [
  'password', '123456', 'qwerty', '111111', 'abc123',
  'letmein', 'welcome', 'admin', 'login', 'passw0rd',
  '123', 'abc', '000', 'iloveyou',
];

/**
 * Analyse a password and return a score, level, and improvement feedback.
 * @param {string} password
 * @returns {{ score: number, level: 'none'|'weak'|'medium'|'strong'|'excellent', feedback: string[] }}
 */
export const analyzePasswordStrength = (password) => {
  if (!password) return { score: 0, level: 'none', feedback: [] };

  let score = 0;
  const feedback = [];

  // ── Length ────────────────────────────────────────────────────────────────
  if (password.length >= 16) score += 30;
  else if (password.length >= 12) score += 25;
  else if (password.length >= 8) score += 15;
  else feedback.push('Use at least 12 characters for better security');

  // ── Character variety ─────────────────────────────────────────────────────
  if (/[a-z]/.test(password)) score += 10;
  else feedback.push('Add lowercase letters (a–z)');

  if (/[A-Z]/.test(password)) score += 10;
  else feedback.push('Add uppercase letters (A–Z)');

  if (/[0-9]/.test(password)) score += 10;
  else feedback.push('Add numbers (0–9)');

  if (/[^a-zA-Z0-9]/.test(password)) score += 15;
  else feedback.push('Add special characters (!@#$%^&*)');

  // ── Uniqueness bonus ──────────────────────────────────────────────────────
  const uniqueChars = new Set(password).size;
  if (uniqueChars > password.length * 0.7) score += 10;

  // ── Penalties ─────────────────────────────────────────────────────────────
  if (COMMON_PATTERNS.some((p) => password.toLowerCase().includes(p))) {
    score -= 25;
    feedback.push('Avoid common patterns like "password" or "123"');
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
 * Convenience: return Tailwind colour classes for a given level.
 */
export const strengthColors = {
  excellent: { bar: 'bg-green-500', badge: 'bg-green-100 text-green-700 border-green-300' },
  strong:    { bar: 'bg-blue-400',  badge: 'bg-blue-100 text-blue-700 border-blue-300' },
  medium:    { bar: 'bg-yellow-400', badge: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
  weak:      { bar: 'bg-red-400',   badge: 'bg-red-100 text-red-700 border-red-300' },
  none:      { bar: 'bg-gray-300',  badge: 'bg-gray-100 text-gray-500 border-gray-300' },
};

/**
 * Human-readable label + emoji for each level.
 */
export const strengthLabels = {
  excellent: '🎉 Excellent! Fort Knox level',
  strong:    '💪 Strong password',
  medium:    '⚠️ Could be stronger',
  weak:      '🚨 Too weak',
  none:      'Enter a password to analyse',
};

/**
 * Generate a cryptographically random 18-character password.
 */
export const generatePassword = () => {
  const charset =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  const array = new Uint8Array(18);
  window.crypto.getRandomValues(array);
  return Array.from(array, (byte) => charset[byte % charset.length]).join('');
};