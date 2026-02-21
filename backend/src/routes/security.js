'use strict';

const express = require('express');
const router  = express.Router();
const axios   = require('axios');
const { authenticateToken, logSecurityEvent } = require('../middleware/auth');
const { apiLimiter, aiAnalysisLimiter } = require('../middleware/rateLimiter');
const { asyncHandler } = require('../middleware/errorHandler');
const SecurityLog  = require('../models/SecurityLog');
const BreachCheck  = require('../models/BreachCheck');
const SavedPassword = require('../models/SavedPassword');
const logger = require('../utils/logger');

// ─── Security News ────────────────────────────────────────────────────────────

router.get(
  '/news',
  authenticateToken,
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
          const items = data.items.slice(0, 5).map((item) => ({
            title:       item.title,
            description: item.description || item.content,
            link:        item.link,
            pubDate:     item.pubDate,
            source:      data.feed.title,
          }));
          allNews.push(...items);
        }
      } catch (err) {
        logger.error('Feed fetch error:', err.message);
      }
    }

    res.json({ success: true, data: allNews });
  })
);

// ─── AI Analysis — real Claude integration ────────────────────────────────────

router.post(
  '/ai-analysis',
  authenticateToken,
  aiAnalysisLimiter,
  asyncHandler(async (req, res) => {
    const userId = req.userId;
    const user   = req.user;

    // ── Gather real context ────────────────────────────────────────────────
    const [recentLogs, breachStats, savedPasswords] = await Promise.all([
      SecurityLog.find({ userId })
        .sort({ createdAt: -1 })
        .limit(20)
        .lean(),

      BreachCheck.aggregate([
        { $match: { userId: user._id } },
        {
          $group: {
            _id:           null,
            totalChecks:   { $sum: 1 },
            totalBreaches: { $sum: '$breachCount' },
            lastCheck:     { $max: '$createdAt' },
          },
        },
      ]),

      SavedPassword.find({ userId }).lean(),
    ]);

    // ── Summarise password health ─────────────────────────────────────────
    const passwordSummary = {
      total:    savedPasswords.length,
      weak:     savedPasswords.filter((p) => p.strength?.level === 'weak').length,
      medium:   savedPasswords.filter((p) => p.strength?.level === 'medium').length,
      strong:   savedPasswords.filter((p) =>
        p.strength?.level === 'strong' || p.strength?.level === 'excellent'
      ).length,
    };

    const loginActivity = {
      successful: recentLogs.filter((l) => l.actionType === 'login').length,
      failed:     recentLogs.filter((l) => l.actionType === 'failed_login').length,
    };

    const breach = breachStats[0] || { totalChecks: 0, totalBreaches: 0 };

    // ── Build Claude prompt ───────────────────────────────────────────────
    const systemPrompt = `You are Locksyra, an AI security assistant for students and young professionals.
Your job is to provide concise, actionable, and encouraging security advice.
Keep responses under 180 words. Use 1-2 relevant emojis. Be friendly, not alarming.
Structure your reply as:
1. A one-sentence overall assessment.
2. The single most important action the user should take right now.
3. One positive thing they are already doing well.
End with a short motivational note.`;

    const userMessage = `Security context for user ${user.email}:

Password vault:
- Total saved: ${passwordSummary.total}
- Weak passwords: ${passwordSummary.weak}
- Medium passwords: ${passwordSummary.medium}
- Strong passwords: ${passwordSummary.strong}

Login activity (last 20 events):
- Successful logins: ${loginActivity.successful}
- Failed attempts: ${loginActivity.failed}

Breach monitoring:
- Total breach checks run: ${breach.totalChecks}
- Total breaches found: ${breach.totalBreaches}
- Last check: ${breach.lastCheck ? new Date(breach.lastCheck).toLocaleDateString() : 'never'}

Account age: created ${user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'recently'}
Security score: ${user.securityScore ?? 50}/100

Based on this real data, give a personalised security assessment and one clear action item.`;

    // ── Call Claude API ───────────────────────────────────────────────────
    const anthropicKey = process.env.ANTHROPIC_API_KEY;

    if (!anthropicKey) {
      // Graceful fallback if key not configured
      logger.warn('ANTHROPIC_API_KEY not set — returning rule-based insight');
      const insight = buildRuleBasedInsight(passwordSummary, loginActivity, breach);
      return res.json({ success: true, data: insight });
    }

    let aiText;
    try {
      const response = await axios.post(
        'https://api.anthropic.com/v1/messages',
        {
          model:      'claude-haiku-4-5-20251001',
          max_tokens: 300,
          system:     systemPrompt,
          messages:   [{ role: 'user', content: userMessage }],
        },
        {
          headers: {
            'x-api-key':         anthropicKey,
            'anthropic-version': '2023-06-01',
            'content-type':      'application/json',
          },
          timeout: 15000,
        }
      );

      aiText = response.data?.content?.[0]?.text || '';
    } catch (err) {
      logger.error('Claude API error:', err.message);
      // Fallback — never surface the raw error to the user
      const insight = buildRuleBasedInsight(passwordSummary, loginActivity, breach);
      return res.json({ success: true, data: insight });
    }

    // ── Log the event ─────────────────────────────────────────────────────
    await logSecurityEvent(userId, 'ai_analysis', {
      action:   'AI security analysis performed',
      severity: 'info',
      success:  true,
    }, req);

    res.json({
      success: true,
      data: {
        insight:     aiText,
        generatedAt: new Date().toISOString(),
        context: {
          passwordSummary,
          loginActivity,
          breachStats: breach,
        },
      },
    });
  })
);

// ─── Security Logs ────────────────────────────────────────────────────────────

router.get(
  '/logs',
  authenticateToken,
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
      SecurityLog.countDocuments({ userId: req.userId }),
    ]);

    res.json({
      success: true,
      data: {
        logs,
        pagination: {
          total,
          page:  parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          limit: parseInt(limit),
        },
      },
    });
  })
);

// ─── Dashboard ────────────────────────────────────────────────────────────────

router.get(
  '/dashboard',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const [recentLogs, loginStats] = await Promise.all([
      SecurityLog.find({ userId: req.userId })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
      SecurityLog.aggregate([
        { $match: { userId: req.user._id, actionType: { $in: ['login', 'failed_login'] } } },
        { $group: { _id: '$actionType', count: { $sum: 1 } } },
      ]),
    ]);

    res.json({
      success: true,
      data: {
        user:           req.user.toJSON(),
        recentActivity: recentLogs,
        loginStats: {
          successful: loginStats.find((s) => s._id === 'login')?.count || 0,
          failed:     loginStats.find((s) => s._id === 'failed_login')?.count || 0,
        },
      },
    });
  })
);

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Rule-based fallback when Claude API is unavailable or not configured.
 */
function buildRuleBasedInsight(passwords, logins, breach) {
  let tip;
  let action;

  if (passwords.weak > 0) {
    tip    = `You have ${passwords.weak} weak password${passwords.weak > 1 ? 's' : ''} in your vault.`;
    action = 'Open the Password Vault and update each weak password to something 12+ characters long with symbols.';
  } else if (breach.totalBreaches > 0) {
    tip    = `We found ${breach.totalBreaches} breach${breach.totalBreaches > 1 ? 'es' : ''} in previous checks.`;
    action = 'Change the passwords for any breached accounts immediately and enable 2FA where possible.';
  } else if (logins.failed > 3) {
    tip    = `There were ${logins.failed} failed login attempts on your account.`;
    action = 'Make sure you are on the official Locksyra URL and consider enabling two-factor authentication.';
  } else {
    tip    = "Your account looks healthy — no obvious issues detected.";
    action = "Run a breach check on all your email addresses to stay proactive.";
  }

  return {
    insight: `🔐 ${tip}\n\n✅ Recommended action: ${action}\n\nKeep it up — regular check-ins are the #1 habit of security-conscious users! 🛡️`,
    generatedAt: new Date().toISOString(),
    context: { passwords, logins, breach },
    fallback: true,
  };
}

module.exports = router;