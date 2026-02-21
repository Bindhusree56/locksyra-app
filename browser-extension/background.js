/**
 * background.js — Locksyra Extension Service Worker
 *
 * Responsibilities:
 *   1. Listen for tab URL changes and perform a background phishing check.
 *   2. Update the extension badge colour to indicate safety (green / red / grey).
 *   3. Alert the user via a notification if a high-risk page is detected.
 *
 * Runs as a Manifest V3 service worker — no DOM access.
 */

const API = 'http://localhost:5001/api';

// ── Badge helpers ─────────────────────────────────────────────────────────────

const setBadge = (tabId, text, color) => {
  chrome.action.setBadgeText({ tabId, text });
  chrome.action.setBadgeBackgroundColor({ tabId, color });
};

const clearBadge = (tabId) => {
  chrome.action.setBadgeText({ tabId, text: '' });
};

// ── Token retrieval ───────────────────────────────────────────────────────────

const getToken = async () => {
  const { accessToken } = await chrome.storage.local.get('accessToken');
  return accessToken || null;
};

// ── URL check ─────────────────────────────────────────────────────────────────

const checkUrl = async (url, tabId) => {
  if (!url || !url.startsWith('http')) {
    clearBadge(tabId);
    return;
  }

  const token = await getToken();
  if (!token) {
    // Not logged in — show grey badge
    setBadge(tabId, '?', '#9ca3af');
    return;
  }

  setBadge(tabId, '…', '#9ca3af');

  try {
    const res = await fetch(`${API}/phishing/check-url`, {
      method:  'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization:  `Bearer ${token}`,
      },
      body: JSON.stringify({ url }),
    });

    if (!res.ok) { clearBadge(tabId); return; }

    const data = await res.json();
    const result = data.data;

    if (result.safe) {
      setBadge(tabId, '✓', '#22c55e');
    } else {
      setBadge(tabId, '!', '#ef4444');

      // Only notify for high-risk sites
      if (result.risk === 'high') {
        chrome.notifications.create(`phishing-${tabId}-${Date.now()}`, {
          type:    'basic',
          iconUrl: 'icons/icon48.png',
          title:   '⛔ Locksyra: Dangerous Page Detected',
          message: `Risk score ${result.score}/100 — This page may be a phishing site. Proceed with extreme caution.`,
          priority: 2,
        });
      }
    }
  } catch {
    // Backend unreachable — don't show a confusing badge
    clearBadge(tabId);
  }
};

// ── Listeners ─────────────────────────────────────────────────────────────────

// Check URL whenever the user navigates to a new page
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    checkUrl(tab.url, tabId);
  }
});

// Re-check when user switches tabs (so badge is always current)
chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  const tab = await chrome.tabs.get(tabId).catch(() => null);
  if (tab?.url) checkUrl(tab.url, tabId);
});

// Clear badge when a tab is removed
chrome.tabs.onRemoved.addListener((tabId) => clearBadge(tabId));