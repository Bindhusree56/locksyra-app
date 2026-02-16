const express = require('express');
const router = express.Router();
const { authenticateToken, logSecurityEvent } = require('../middleware/auth');
const { breachCheckLimiter } = require('../middleware/rateLimiter');
const { validateBreachCheck, validatePasswordCheck } = require('../middleware/validation');
const { asyncHandler } = require('../middleware/errorHandler');
const { checkEmailBreaches, checkPasswordBreach, analyzePasswordStrength } = require('../services/breachService');
const BreachCheck = require('../models/BreachCheck');

// Check email for breaches
router.post('/check-email',
  authenticateToken,  // JWT authentication required
  breachCheckLimiter,
  validateBreachCheck,
  asyncHandler(async (req, res) => {
    const { email } = req.body;
    
    try {
      const breaches = await checkEmailBreaches(email);
      
      // Log the check to database
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

      // Log security event
      await logSecurityEvent(req.userId, 'breach_check', {
        action: 'Email breach check performed',
        severity: breaches.length > 0 ? 'warning' : 'info',
        success: true,
        breachCount: breaches.length
      }, req);
      
      res.json({
        success: true,
        data: {
          email,
          breachCount: breaches.length,
          breached: breaches.length > 0,
          breaches
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to check email breaches'
      });
    }
  })
);

// Get breach check history
router.get('/history',
  authenticateToken,  // JWT authentication required
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [checks, total] = await Promise.all([
      BreachCheck.find({ userId: req.userId })
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(skip)
        .lean(),
      BreachCheck.countDocuments({ userId: req.userId })
    ]);
    
    res.json({
      success: true,
      data: {
        checks,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          limit: parseInt(limit)
        }
      }
    });
  })
);

// Check password strength and breaches
router.post('/check-password',
  authenticateToken,  // JWT authentication required
  breachCheckLimiter,
  validatePasswordCheck,
  asyncHandler(async (req, res) => {
    const { password } = req.body;
    
    try {
      const [strength, breachStatus] = await Promise.all([
        analyzePasswordStrength(password),
        checkPasswordBreach(password)
      ]);

      // Log security event (but don't store the password!)
      await logSecurityEvent(req.userId, 'breach_check', {
        action: 'Password strength check performed',
        severity: breachStatus.breached ? 'warning' : 'info',
        success: true,
        passwordBreached: breachStatus.breached
      }, req);
      
      res.json({
        success: true,
        data: {
          strength,
          breach: breachStatus
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to check password'
      });
    }
  })
);

// Get breach statistics for current user
router.get('/stats',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const stats = await BreachCheck.aggregate([
      { $match: { userId: req.user._id } },
      {
        $group: {
          _id: null,
          totalChecks: { $sum: 1 },
          totalBreaches: { $sum: '$breachCount' },
          emailsChecked: { $addToSet: '$email' },
          lastCheck: { $max: '$createdAt' }
        }
      }
    ]);

    const result = stats.length > 0 ? {
      totalChecks: stats[0].totalChecks,
      totalBreaches: stats[0].totalBreaches,
      uniqueEmailsChecked: stats[0].emailsChecked.length,
      lastCheck: stats[0].lastCheck
    } : {
      totalChecks: 0,
      totalBreaches: 0,
      uniqueEmailsChecked: 0,
      lastCheck: null
    };

    res.json({
      success: true,
      data: result
    });
  })
);

module.exports = router;