/**
 * popup.js — Locksyra Browser Extension
 *
 * Screens: loading → auth (if not signed in) → main
 *
 * The popup talks to the Locksyra backend directly.
 * Tokens are stored in chrome.storage.local (not localStorage — not available here).
 */

const API = 'http://localhost:5001/api';

// ── Helpers ───────────────────────────────────────────────────────────────────

const $  = (id) => document.getElementById(id);
const show = (id) => $(id).classList.remove('hidden');
const hide = (id) => $(id).classList.add('hidden');

const setScreen = (name) => {
  ['loading-screen', 'auth-screen', 'main-screen'].forEach((s) => hide(s));
  show(name);
};

/**
 * Centralised fetch wrapper — attaches bearer token, maps status → message.
 */
const request = async (endpoint, options = {}) => {
  const { accessToken } = await chrome.storage.local.get('accessToken');
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;

  const res = await fetch(`${API}${endpoint}`, { ...options, headers });
  const body = await res.json().catch(() => null);

  if (!res.ok) {
    const msg = body?.message || `Error ${res.status}`;
    const err = new Error(msg);
    err.status = res.status;
    throw err;
  }
  return body;
};

// ── Auth ──────────────────────────────────────────────────────────────────────

const getStoredTokens = () => chrome.storage.local.get(['accessToken', 'refreshToken', 'userName']);
const setStoredTokens = (data) => chrome.storage.local.set(data);
const clearTokens     = ()     => chrome.storage.local.remove(['accessToken', 'refreshToken', 'userName']);

const login = async (email, password) => {
  const data = await fetch(`${API}/auth/login`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ email, password }),
  }).then((r) => r.json());

  if (!data.success) throw new Error(data.message || 'Login failed');

  await setStoredTokens({
    accessToken:  data.data.accessToken,
    refreshToken: data.data.refreshToken,
    userName:     data.data.user.firstName || email.split('@')[0],
  });

  return data.data;
};

// ── URL Safety Check ──────────────────────────────────────────────────────────

const checkCurrentTab = async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const url   = tab?.url || '';

  $('url-display').textContent = url.length > 55 ? url.substring(0, 55) + '…' : url;

  // Skip internal pages
  if (!url.startsWith('http')) {
    $('safety-badge').className    = 'badge badge-checking';
    $('safety-badge').textContent  = 'ℹ️ Internal page';
    return;
  }

  $('safety-badge').className   = 'badge badge-checking';
  $('safety-badge').textContent = '⏳ Checking…';

  try {
    const res = await request('/phishing/check-url', {
      method: 'POST',
      body:   JSON.stringify({ url }),
    });

    const result = res.data;

    if (result.safe) {
      $('safety-badge').className   = 'badge badge-safe';
      $('safety-badge').textContent = `✅ Safe  (risk score: ${result.score})`;
      hide('safety-detail');
    } else {
      $('safety-badge').className   = 'badge badge-danger';
      $('safety-badge').textContent = `⛔ Dangerous  (risk score: ${result.score})`;

      const flags = result.details?.flags?.join(', ') ||
        Object.entries(result.details || {})
          .filter(([, v]) => v === true)
          .map(([k]) => k)
          .join(', ') ||
        'Suspicious patterns detected';

      $('safety-detail').textContent = `⚠️ ${flags}`;
      show('safety-detail');
    }
  } catch (err) {
    // Fallback to basic client-side check if API is unavailable
    const isHttp    = !url.startsWith('https://');
    const shortener = /bit\.ly|tinyurl|goo\.gl/i.test(url);

    if (isHttp || shortener) {
      $('safety-badge').className   = 'badge badge-warning';
      $('safety-badge').textContent = '⚠️ Use caution';
      $('safety-detail').textContent = isHttp ? 'Page does not use HTTPS' : 'Shortened URL detected';
      show('safety-detail');
    } else {
      $('safety-badge').className   = 'badge badge-checking';
      $('safety-badge').textContent = '— Server offline';
    }
  }
};

// ── Password Vault ────────────────────────────────────────────────────────────

const loadVault = async () => {
  try {
    const res  = await request('/passwords');
    const list = res.data.passwords || [];

    hide('vault-loading');

    if (list.length === 0) {
      show('vault-empty');
      return;
    }

    const ul = $('vault-list');
    ul.innerHTML = '';

    list.slice(0, 5).forEach((entry) => {
      const li = document.createElement('li');
      li.className = 'vault-item';
      li.innerHTML = `
        <span class="vault-site" title="${entry.website}">${entry.website}</span>
        <span class="vault-user" title="${entry.username}">${entry.username}</span>
        <button class="btn-copy" data-pw="${encodeURIComponent(entry.password || '')}">Copy</button>
      `;
      ul.appendChild(li);
    });

    show('vault-list');

    // Copy buttons
    ul.querySelectorAll('.btn-copy').forEach((btn) => {
      btn.addEventListener('click', () => {
        navigator.clipboard.writeText(decodeURIComponent(btn.dataset.pw));
        btn.textContent = '✅';
        setTimeout(() => { btn.textContent = 'Copy'; }, 1500);
      });
    });

  } catch {
    hide('vault-loading');
    show('vault-empty');
  }
};

// ── Init ──────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', async () => {
  setScreen('loading-screen');

  const { accessToken, userName } = await getStoredTokens();

  if (accessToken) {
    initMainScreen(userName);
  } else {
    setScreen('auth-screen');
  }
});

function initMainScreen(userName) {
  $('header-name').textContent = `Hi, ${userName || 'there'} 👋`;
  setScreen('main-screen');
  checkCurrentTab();
  loadVault();
}

// ── Auth form ─────────────────────────────────────────────────────────────────

$('login-btn').addEventListener('click', async () => {
  const email    = $('email').value.trim();
  const password = $('password').value;

  if (!email || !password) {
    $('auth-error').textContent = 'Please enter your email and password.';
    show('auth-error');
    return;
  }

  $('login-btn').disabled    = true;
  $('login-btn').textContent = 'Signing in…';
  hide('auth-error');

  try {
    const data = await login(email, password);
    initMainScreen(data.user.firstName || email.split('@')[0]);
  } catch (err) {
    $('auth-error').textContent = err.message;
    show('auth-error');
  } finally {
    $('login-btn').disabled    = false;
    $('login-btn').textContent = 'Sign In';
  }
});

// ── Actions ───────────────────────────────────────────────────────────────────

$('logout-btn').addEventListener('click', async () => {
  await clearTokens();
  $('email').value    = '';
  $('password').value = '';
  setScreen('auth-screen');
});

$('check-btn').addEventListener('click', () => {
  $('safety-badge').className   = 'badge badge-checking';
  $('safety-badge').textContent = '⏳ Checking…';
  hide('safety-detail');
  checkCurrentTab();
});

$('open-app-btn').addEventListener('click', () => {
  chrome.tabs.create({ url: 'http://localhost:3000' });
  window.close();
});

// Enter key on password field triggers login
$('password').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') $('login-btn').click();
});