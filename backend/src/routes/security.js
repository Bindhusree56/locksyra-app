const express = require('express');
const router = express.Router();
const { authenticateToken, logSecurityEvent } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');
const { asyncHandler } = require('../middleware/errorHandler');
const SecurityLog = require('../models/SecurityLog');
const axios = require('axios');

// Get security news (RSS feeds via rss2json)
router.get('/news',
  authenticateToken,  // JWT authentication required
  apiLimiter,
  asyncHandler(async (req, res) => {
    const feeds = [
      'https://feeds.feedburner.com/TheHackersNews',
      'https://krebsonsecurity.com/feed/',
    ];
    
    const allNews = [];
    
    for (const feed of feeds) {
      try {
        const response = await axios.get(
          `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed)}`,
          { timeout: 10000 }
        );
        
        const data = response.data;
        
        if (data.items) {
          const items = data.items.slice(0, 5).map(item => ({
            title: item.title,
            description: item.description || item.content,
            link: item.link,
            pubDate: item.pubDate,
            source: data.feed.title
          }));
          allNews.push(...items);
        }
      } catch (err) {
        console.error('Feed fetch error:', err.message);
      }
    }
    
    res.json({
      success: true,
      data: allNews
    });
  })
);

// AI analysis endpoint
router.post('/ai-analysis',
  authenticateToken,  // JWT authentication required
  apiLimiter,
  asyncHandler(async (req, res) => {
    const { context } = req.body;
    
    // This would call Claude API in production
    // For now, return mock insights
    const insights = {
      tip: "Enable two-factor authentication on all your accounts for an extra layer of security.",
      action: "Review your password strength and update weak passwords",
      risk: "medium"
    };

    await logSecurityEvent(req.userId, 'ai_analysis', {
      action: 'AI security analysis performed',
      severity: 'info',
      success: true
    }, req);
    
    res.json({
      success: true,
      data: insights
    });
  })
);

// Get user's security logs
router.get('/logs',
  authenticateToken,  // JWT authentication required
  apiLimiter,
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 20 } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [logs, total] = await Promise.all([
      SecurityLog.find({ userId: req.userId })
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(skip)
        .lean(),
      SecurityLog.countDocuments({ userId: req.userId })
    ]);
    
    res.json({
      success: true,
      data: {
        logs,
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

// Get security summary/dashboard
router.get('/dashboard',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const [recentLogs, loginStats] = await Promise.all([
      SecurityLog.find({ userId: req.userId })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
      SecurityLog.aggregate([
        { $match: { userId: req.user._id, actionType: { $in: ['login', 'failed_login'] } } },
        {
          $group: {
            _id: '$actionType',
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    const summary = {
      user: req.user.toJSON(),
      recentActivity: recentLogs,
      loginStats: {
        successful: loginStats.find(s => s._id === 'login')?.count || 0,
        failed: loginStats.find(s => s._id === 'failed_login')?.count || 0
      }
    };

    res.json({
      success: true,
      data: summary
    });
  })
);

module.exports = router;