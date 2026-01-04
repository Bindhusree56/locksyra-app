// ============================================================================
// PASSWORD STRENGTH ANALYZER
// ============================================================================
export const analyzePasswordStrength = (password) => {
  if (!password) return { score: 0, level: 'none', feedback: [] };
  
  let score = 0;
  const feedback = [];
  
  // Length check
  if (password.length >= 12) score += 25;
  else if (password.length >= 8) score += 15;
  else feedback.push('Use at least 12 characters');
  
  // Complexity checks
  if (/[a-z]/.test(password)) score += 15;
  else feedback.push('Add lowercase letters');
  
  if (/[A-Z]/.test(password)) score += 15;
  else feedback.push('Add uppercase letters');
  
  if (/[0-9]/.test(password)) score += 15;
  else feedback.push('Add numbers');
  
  if (/[^a-zA-Z0-9]/.test(password)) score += 20;
  else feedback.push('Add special characters (!@#$%)');
  
  // Common patterns penalty
  const commonPatterns = ['123', 'abc', 'password', 'qwerty', '111'];
  if (commonPatterns.some(p => password.toLowerCase().includes(p))) {
    score -= 20;
    feedback.push('Avoid common patterns');
  }
  
  // Sequential characters penalty
  if (/(.)\1{2,}/.test(password)) {
    score -= 10;
    feedback.push('Avoid repeated characters');
  }
  
  score = Math.max(0, Math.min(100, score));
  
  let level = 'weak';
  if (score >= 80) level = 'excellent';
  else if (score >= 60) level = 'strong';
  else if (score >= 40) level = 'medium';
  
  return { score, level, feedback };
};

// ============================================================================
// MOCK HAVEIBEENPWNED API (Replace with real API in production)
// ============================================================================
export const checkBreaches = async (email) => {
  // In production, use: https://haveibeenpwned.com/API/v3
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const mockBreaches = [
    {
      Name: "LinkedIn",
      Title: "LinkedIn",
      Domain: "linkedin.com",
      BreachDate: "2021-06-22",
      AddedDate: "2021-06-30",
      PwnCount: 700000000,
      Description: "In June 2021, data scraped from 700M LinkedIn users was made available for sale.",
      DataClasses: ["Email addresses", "Full names", "Geographic locations"],
      IsVerified: true,
      IsSensitive: false,
      severity: 'high'
    },
    {
      Name: "Facebook",
      Title: "Facebook",
      Domain: "facebook.com",
      BreachDate: "2019-04-03",
      AddedDate: "2019-04-14",
      PwnCount: 533000000,
      Description: "In April 2019, a massive data set of 533M Facebook users was made public.",
      DataClasses: ["Email addresses", "Phone numbers", "Names"],
      IsVerified: true,
      IsSensitive: false,
      severity: 'critical'
    }
  ];
  
  // Simulate breach detection (50% chance for demo)
  if (Math.random() > 0.3) {
    return mockBreaches;
  }
  return [];
};

// ============================================================================
// GOOGLE SHEETS CONFIGURATION
// ============================================================================
export const GOOGLE_CONFIG = {
  CLIENT_ID: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
  API_KEY: 'YOUR_API_KEY',
  DISCOVERY_DOCS: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
  SCOPES: 'https://www.googleapis.com/auth/spreadsheets'
};

export const SHEET_ID = 'YOUR_SHEET_ID';
export const SHEET_NAME = 'BreachLogs';