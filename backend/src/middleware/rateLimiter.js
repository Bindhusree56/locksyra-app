const rateLimit = require('express-rate-limit');

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: {
    success: false,
    message: 'Too many requests, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict limiter for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: {
    success: false,
    message: 'Too many login attempts, please try again later.'
  },
  skipSuccessfulRequests: true
});

// Password reset limiter
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 attempts per hour
  message: {
    success: false,
    message: 'Too many password reset requests, please try again later.'
  }
});

// Breach check limiter
const breachCheckLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 checks per minute
  message: {
    success: false,
    message: 'Too many breach checks, please slow down.'
  }
});

// External API limiter (for services that have their own rate limits)
const externalApiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 requests per minute
  message: {
    success: false,
    message: 'Too many API requests, please wait a moment.'
  }
});

module.exports = {
  apiLimiter,
  authLimiter,
  passwordResetLimiter,
  breachCheckLimiter,
  externalApiLimiter
};