const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { breachCheckLimiter } = require('../middleware/rateLimiter');
const { validateBreachCheck, validatePasswordCheck } = require('../middleware/validation');
const { asyncHandler } = require('../middleware/errorHandler');
const { checkEmailBreaches, checkPasswordBreach, analyzePasswordStrength } = require('../services/breachService');
const BreachCheck = require('../models/BreachCheck');

// Check email for breaches
router.post('/check-email',
  authenticateToken,
  breachCheckLimiter,
  validateBreachCheck,
  asyncHandler(async (req, res) => {
    const { email } = req.body;
    
    const breaches = await checkEmailBreaches(email);
    
    // Log the check
    await BreachCheck.create({
      userId: req.userId,
      email,
      breachCount: breaches.length,
      breached: breaches.length > 0,
      breachDetails: breaches,
      checkType: 'email',
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });
    
    res.json({
      success: true,
      data: {
        email,
        breachCount: breaches.length,
        breached: breaches.length > 0,
        breaches
      }
    });
  })
);

// Get breach check history
router.get('/history',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    
    const checks = await BreachCheck.findAndCountAll({
      where: { userId: req.userId },
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    });
    
    res.json({
      success: true,
      data: {
        checks: checks.rows,
        pagination: {
          total: checks.count,
          page: parseInt(page),
          pages: Math.ceil(checks.count / parseInt(limit))
        }
      }
    });
  })
);

// Check password strength and breaches
router.post('/check-password',
  authenticateToken,
  breachCheckLimiter,
  validatePasswordCheck,
  asyncHandler(async (req, res) => {
    const { password } = req.body;
    
    const [strength, breachStatus] = await Promise.all([
      analyzePasswordStrength(password),
      checkPasswordBreach(password)
    ]);
    
    res.json({
      success: true,
      data: {
        strength,
        breach: breachStatus
      }
    });
  })
);

module.exports = router;