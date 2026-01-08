const express3 = require('express');
const router3 = express3.Router();
const { authenticateToken: auth3 } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');
const { asyncHandler: async3 } = require('../middleware/errorHandler');
const SecurityLog = require('../models/SecurityLog');
const fetch = require('node-fetch');

// Get security news (RSS feeds via rss2json)
router3.get('/news',
  auth3,
  apiLimiter,
  async3(async (req, res) => {
    const feeds = [
      'https://feeds.feedburner.com/TheHackersNews',
      'https://krebsonsecurity.com/feed/',
    ];
    
    const allNews = [];
    
    for (const feed of feeds) {
      try {
        const response = await fetch(
          `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed)}`
        );
        const data = await response.json();
        
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
        console.error('Feed fetch error:', err);
      }
    }
    
    res.json({
      success: true,
      data: allNews
    });
  })
);

// AI analysis endpoint (calls Claude API)
router3.post('/ai-analysis',
  auth3,
  apiLimiter,
  async3(async (req, res) => {
    const { context } = req.body;
    
    // This would call Claude API in production
    // For now, return mock insights
    const insights = {
      tip: "Enable two-factor authentication on all your accounts for an extra layer of security.",
      action: "Review your password strength and update weak passwords",
      risk: "medium"
    };
    
    res.json({
      success: true,
      data: insights
    });
  })
);

// Get user's security logs
router3.get('/logs',
  auth3,
  apiLimiter,
  async3(async (req, res) => {
    const { page = 1, limit = 20 } = req.query;
    
    const logs = await SecurityLog.findAndCountAll({
      where: { userId: req.userId },
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    });
    
    res.json({
      success: true,
      data: {
        logs: logs.rows,
        pagination: {
          total: logs.count,
          page: parseInt(page),
          pages: Math.ceil(logs.count / parseInt(limit))
        }
      }
    });
  })
);

module.exports = router3;