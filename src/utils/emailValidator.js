/**
 * Strict email validation
 * Catches: trailing dots, invalid chars, fake-looking TLDs, double dots, etc.
 */

// Known legitimate TLDs (partial list of common ones)
const VALID_TLDS = new Set([
  'com','net','org','edu','gov','mil','int','io','co','ai','app','dev','tech',
  'info','biz','me','tv','us','uk','ca','au','de','fr','jp','in','br','ru',
  'cn','it','es','nl','se','no','dk','fi','pl','pt','mx','ar','cl','nz','sg',
  'ae','sa','za','ng','ke','eg','tr','il','pk','bd','lk','vn','th','ph',
  'id','my','hk','tw','kr','ua','cz','ro','hu','bg','rs','hr','sk','si',
  'lt','lv','ee','by','kz','ge','am','az','uz','tm','kg','tj','mn',
  'ac','ad','af','ag','al','an','ao','aq','as','at','aw','ax','ba','bb',
  'be','bf','bh','bi','bj','bm','bn','bo','bs','bt','bv','bw','by','bz',
  'cc','cd','cf','cg','ch','ci','ck','cm','cr','cu','cv','cx','cy',
  'dj','dk','dm','do','dz','ec','er','et','eu','fc','fj','fk','fm','fo',
  'ga','gd','gf','gg','gh','gi','gl','gm','gn','gp','gq','gr','gs','gt',
  'gu','gw','gy','hn','ht','im','iq','ir','is','je','jm','jo','ki','km',
  'kn','kp','kw','ky','la','lb','lc','li','lr','ls','lu','ly','ma','mc',
  'md','mg','mh','mk','ml','mm','mo','mp','mq','mr','ms','mt','mu','mv',
  'mw','mz','na','nc','ne','nf','ni','np','nr','nu','om','pa','pe','pf',
  'pg','pm','pn','pr','ps','pw','py','qa','re','rw','sb','sc','sd',
  'sh','sj','sl','sm','sn','so','sr','st','sv','sy','sz','tc','td','tf',
  'tg','tj','tk','tl','to','tp','tt','tv','tz','ug','um','uy','va','vc',
  've','vg','vi','vu','wf','ws','ye','yt','yu','yweb','shop','site',
  'online','store','design','agency','studio','cloud','digital','media',
  'network','services','solutions','systems','global','world','center',
  'group','health','news','today','blog','link','click','email','mobi',
  'name','pro','tel','travel','jobs','cat','post','xxx','asia','museum',
  'aero','coop','edu'
]);

// Suspicious/throwaway TLDs that are almost never legitimate
const SUSPICIOUS_TLDS = new Set([
  'xyz','top','work','click','loan','win','bid','science','review','party',
  'racing','cricket','accountant','date','faith','men','trade','webcam',
  'ninja','tools','wtf','gg'
]);

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
  if (!/^[a-zA-Z0-9._%+\-]+$/.test(local)) {
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
    if (!/^[a-zA-Z0-9\-]+$/.test(label)) {
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
  const emailRegex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) return false;
  const local = email.split('@')[0];
  if (local.startsWith('.') || local.endsWith('.')) return false;
  return true;
};