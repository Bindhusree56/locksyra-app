const express2 = require('express');
const router2 = express2.Router();
const { authenticateToken: auth2 } = require('../middleware/auth');
const { externalApiLimiter } = require('../middleware/rateLimiter');
const { validateUrl } = require('../middleware/validation');
const { asyncHandler: async2 } = require('../middleware/errorHandler');
const { checkPhishingURL } = require('../services/breachService');

// Check URL for phishing
router2.post('/check-url',
  auth2,
  externalApiLimiter,
  validateUrl,
  async2(async (req, res) => {
    const { url } = req.body;
    
    const result = await checkPhishingURL(url);
    
    res.json({
      success: true,
      data: result
    });
  })
);

module.exports = router2;