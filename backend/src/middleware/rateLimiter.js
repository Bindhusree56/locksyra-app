'use strict';

/**
 * rateLimiter.js
 *
 * Problem solved: express-rate-limit defaults to IP-based tracking.
 * On shared networks (university WiFi, campus hotspots) multiple students
 * share one IP, so one user can exhaust another's quota.
 *
 * Solution:
 *   - Unauthenticated routes (login, register) → still IP-based (no userId yet)
 *   - Authenticated routes               → userId-based (set via `keyGenerator`)
 *
 * The `userAwareKeyGenerator` function checks whether `req.userId` has been
 * populated by the auth middleware (jwtAuth.protect or auth.authenticateToken).
 * If it has, we rate-limit by userId; otherwise we fall back to IP.
 */

const rateLimit = require('express-rate-limit');

// ── Key generator: user > IP ──────────────────────────────────────────────────

const userAwareKey = (req) => {
  // req.userId is set by jwtAuth.protect / auth.authenticateToken
  if (req.userId) return `user:${req.userId}`;
  if (req.user?._id) return `user:${req.user._id}`;
  return req.ip;
};

// ── Standard response format ──────────────────────────────────────────────────

const tooManyRequests = (message) => ({
  success: false,
  message,
  code: 'RATE_LIMITED',
});

// ── Limiters ──────────────────────────────────────────────────────────────────

/**
 * General API limiter — authenticated routes.
 * 100 requests per user per 15 minutes.
 */
const apiLimiter = rateLimit({
  windowMs:        15 * 60 * 1000,
  max:             100,
  keyGenerator:    userAwareKey,
  message:         tooManyRequests('Too many requests. Please try again in 15 minutes.'),
  standardHeaders: true,
  legacyHeaders:   false,
  skip: (req) => process.env.NODE_ENV === 'test',
});

/**
 * Auth limiter — IP-based (user not authenticated yet).
 * 10 attempts per IP per 15 minutes.
 * Failed requests are not skipped — they count toward the limit.
 */
const authLimiter = rateLimit({
  windowMs:        15 * 60 * 1000,
  max:             10,
  keyGenerator:    (req) => req.ip,
  message:         tooManyRequests('Too many login attempts from this network. Please try again in 15 minutes.'),
  standardHeaders: true,
  legacyHeaders:   false,
  skip: (req) => process.env.NODE_ENV === 'test',
});

/**
 * Breach check limiter — user-aware.
 * 20 checks per user per minute (generous for university use).
 */
const breachCheckLimiter = rateLimit({
  windowMs:        60 * 1000,
  max:             20,
  keyGenerator:    userAwareKey,
  message:         tooManyRequests('Too many breach checks. Please wait a moment.'),
  standardHeaders: true,
  legacyHeaders:   false,
  skip: (req) => process.env.NODE_ENV === 'test',
});

/**
 * External API limiter — user-aware.
 * 10 calls per user per minute (respects third-party quotas).
 */
const externalApiLimiter = rateLimit({
  windowMs:        60 * 1000,
  max:             10,
  keyGenerator:    userAwareKey,
  message:         tooManyRequests('Too many external API requests. Please wait a moment.'),
  standardHeaders: true,
  legacyHeaders:   false,
  skip: (req) => process.env.NODE_ENV === 'test',
});

/**
 * Password reset limiter — IP-based (security boundary).
 * 3 resets per IP per hour.
 */
const passwordResetLimiter = rateLimit({
  windowMs:        60 * 60 * 1000,
  max:             3,
  keyGenerator:    (req) => req.ip,
  message:         tooManyRequests('Too many password reset requests. Please try again in 1 hour.'),
  standardHeaders: true,
  legacyHeaders:   false,
  skip: (req) => process.env.NODE_ENV === 'test',
});

/**
 * AI analysis limiter — user-aware.
 * 15 AI calls per user per hour (manages Anthropic API costs).
 */
const aiAnalysisLimiter = rateLimit({
  windowMs:        60 * 60 * 1000,
  max:             15,
  keyGenerator:    userAwareKey,
  message:         tooManyRequests('AI analysis limit reached for this hour. Please try again later.'),
  standardHeaders: true,
  legacyHeaders:   false,
  skip: (req) => process.env.NODE_ENV === 'test',
});

module.exports = {
  apiLimiter,
  authLimiter,
  breachCheckLimiter,
  externalApiLimiter,
  passwordResetLimiter,
  aiAnalysisLimiter,
};