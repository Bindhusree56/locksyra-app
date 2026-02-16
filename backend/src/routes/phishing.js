const express = require('express');
const router = express.Router();
const { authenticateToken, logSecurityEvent } = require('../middleware/auth');
const { externalApiLimiter } = require('../middleware/rateLimiter');
const { validateUrl } = require('../middleware/validation');
const { asyncHandler } = require('../middleware/errorHandler');
const { checkPhishingURL } = require('../services/breachService');

// Check URL for phishing
router.post('/check-url',
  authenticateToken,  // JWT authentication required
  externalApiLimiter,
  validateUrl,
  asyncHandler(async (req, res) => {
    const { url } = req.body;
    
    try {
      const result = await checkPhishingURL(url);

      // Log security event
      await logSecurityEvent(req.userId, 'phishing_check', {
        action: 'URL phishing check performed',
        severity: result.safe ? 'info' : 'warning',
        success: true,
        url: url,
        riskScore: result.score
      }, req);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to check URL'
      });
    }
  })
);

module.exports = router;