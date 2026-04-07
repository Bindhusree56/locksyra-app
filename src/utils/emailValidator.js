/**
 * Strict email validation
 * Catches: trailing dots, invalid chars, fake-looking TLDs, double dots, etc.
 */



export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return { valid: false, message: 'Email address is required' };
  }

  const trimmed = email.trim().toLowerCase();

  // Must contain exactly one @
  const parts = trimmed.split('@');
  if (parts.length !== 2) {
    return { valid: false, message: 'Please enter a valid email address' };
  }

  const [local, domain] = parts;

  // Local part checks
  if (!local || local.length === 0) {
    return { valid: false, message: 'Email address is missing the part before @' };
  }
  if (local.length > 64) {
    return { valid: false, message: 'Email address is too long before the @' };
  }
  if (local.startsWith('.') || local.endsWith('.')) {
    return { valid: false, message: 'Email cannot start or end with a dot before @' };
  }
  if (/\.{2,}/.test(local)) {
    return { valid: false, message: 'Email cannot contain consecutive dots' };
  }
  // Only allow valid chars in local part
  if (!/^[a-zA-Z0-9._%+-]+$/.test(local)) {
    return { valid: false, message: 'Email contains invalid characters' };
  }

  // Domain checks
  if (!domain || domain.length === 0) {
    return { valid: false, message: 'Email address is missing the domain part' };
  }
  if (domain.length > 253) {
    return { valid: false, message: 'Domain name is too long' };
  }
  if (domain.startsWith('.') || domain.endsWith('.')) {
    return { valid: false, message: 'Invalid domain in email address' };
  }
  if (/\.{2,}/.test(domain)) {
    return { valid: false, message: 'Domain cannot contain consecutive dots' };
  }

  // Domain must have at least one dot
  const domainParts = domain.split('.');
  if (domainParts.length < 2) {
    return { valid: false, message: 'Email domain must include a valid extension (e.g. .com)' };
  }

  // Each domain label check
  for (const label of domainParts) {
    if (!label || label.length === 0) {
      return { valid: false, message: 'Invalid domain format in email' };
    }
    if (label.length > 63) {
      return { valid: false, message: 'Domain label is too long' };
    }
    if (label.startsWith('-') || label.endsWith('-')) {
      return { valid: false, message: 'Domain labels cannot start or end with a hyphen' };
    }
    if (!/^[a-zA-Z0-9-]+$/.test(label)) {
      return { valid: false, message: 'Domain contains invalid characters' };
    }
  }

  // TLD checks
  const tld = domainParts[domainParts.length - 1].toLowerCase();
  if (tld.length < 2) {
    return { valid: false, message: 'Email must have a valid domain extension (e.g. .com, .edu)' };
  }
  if (tld.length > 10) {
    return { valid: false, message: 'Domain extension appears invalid' };
  }
  if (/^\d+$/.test(tld)) {
    return { valid: false, message: 'Domain extension cannot be all numbers' };
  }

  // Check domain name (second-to-last part) is meaningful
  const domainName = domainParts[domainParts.length - 2];
  if (domainName.length < 2) {
    return { valid: false, message: 'Domain name is too short to be valid' };
  }

  // Random-looking domain heuristic (long string of consonants/random chars)
  const consonants = (domainName.match(/[bcdfghjklmnpqrstvwxyz]/gi) || []).length;
  if (domainName.length >= 8 && consonants / domainName.length > 0.85) {
    return { valid: false, message: 'This email domain does not appear to be valid' };
  }

  return { valid: true, message: '' };
};

/**
 * Quick client-side email format check (lighter version for real-time feedback)
 */
export const quickEmailCheck = (email) => {
  if (!email) return false;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) return false;
  const local = email.split('@')[0];
  if (local.startsWith('.') || local.endsWith('.')) return false;
  return true;
};