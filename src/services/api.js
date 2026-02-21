/**
 * api.js — Centralised API client for Locksyra
 *
 * Error handling philosophy:
 *   • HTTP status codes are mapped to human-friendly messages once, here.
 *   • Components receive a plain `Error` with `.message` already suitable for display.
 *   • Components never need to inspect status codes or raw responses.
 */

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// ── Error mapping ─────────────────────────────────────────────────────────────

const STATUS_MESSAGES = {
  400: 'The request was invalid. Please check your input and try again.',
  401: 'Your session has expired. Please sign in again.',
  403: 'You do not have permission to perform this action.',
  404: 'The requested resource was not found.',
  409: 'A conflict occurred — this resource may already exist.',
  422: 'The data you submitted could not be processed.',
  429: 'Too many requests. Please wait a moment and try again.',
  500: 'An internal server error occurred. Please try again later.',
  502: 'The server is temporarily unavailable. Please try again shortly.',
  503: 'The service is currently offline. Please try again later.',
};

// Code strings returned in JSON body → friendlier messages
const CODE_MESSAGES = {
  EMAIL_ALREADY_EXISTS: 'This email is already registered. Please sign in instead.',
  USER_NOT_FOUND:       'No account found with this email. Please register first.',
  WRONG_PASSWORD:       'Incorrect password. Please try again.',
  ACCOUNT_LOCKED:       'This account is temporarily locked due to too many failed attempts. Please try again later.',
  TOKEN_EXPIRED:        'Your session has expired. Please sign in again.',
  INVALID_TOKEN:        'Authentication failed. Please sign in again.',
  NO_TOKEN:             'You must be signed in to do that.',
};

/**
 * Maps a failed response to a human-friendly Error.
 * @param {Response} response  — fetch Response object
 * @param {object}  body       — already-parsed JSON body (may be null)
 */
const buildError = (response, body) => {
  // Prefer the code-based message, then the body message, then the status default
  const codeMsg   = body?.code && CODE_MESSAGES[body.code];
  const bodyMsg   = body?.message;
  const statusMsg = STATUS_MESSAGES[response.status];
  const message   = codeMsg || bodyMsg || statusMsg || `Request failed (HTTP ${response.status})`;

  const err = new Error(message);
  err.status = response.status;
  err.code   = body?.code || null;
  return err;
};

// ── ApiClient ─────────────────────────────────────────────────────────────────

class ApiClient {
  constructor() {
    this.API_URL          = API_URL;
    this.accessToken      = localStorage.getItem('accessToken');
    this.refreshTokenValue = localStorage.getItem('refreshToken');
  }

  setTokens(accessToken, refreshToken) {
    this.accessToken       = accessToken;
    this.refreshTokenValue = refreshToken;
    localStorage.setItem('accessToken',  accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }

  clearTokens() {
    this.accessToken       = null;
    this.refreshTokenValue = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  async request(endpoint, options = {}) {
    const url     = `${this.API_URL}${endpoint}`;
    const headers = { 'Content-Type': 'application/json', ...options.headers };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    const execute = () => fetch(url, { ...options, headers });

    let response;
    try {
      response = await execute();
    } catch (networkErr) {
      // fetch() itself threw — server is unreachable
      throw new Error(
        'Cannot connect to the Locksyra server. Make sure the backend is running on port 5001.'
      );
    }

    // ── Token refresh ────────────────────────────────────────────────────────
    if (response.status === 401 && this.refreshTokenValue) {
      const refreshed = await this.refreshAccessToken();
      if (refreshed) {
        headers['Authorization'] = `Bearer ${this.accessToken}`;
        try { response = await execute(); }
        catch { throw new Error('Reconnection failed. Please sign in again.'); }
      } else {
        this.clearTokens();
        window.dispatchEvent(new CustomEvent('auth:logout'));
        throw new Error('Your session has expired. Please sign in again.');
      }
    }

    // ── Parse body ───────────────────────────────────────────────────────────
    let body = null;
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      try { body = await response.json(); }
      catch { /* malformed JSON — body stays null */ }
    }

    if (!response.ok) {
      throw buildError(response, body);
    }

    return body;
  }

  async refreshAccessToken() {
    if (!this.refreshTokenValue) return false;
    try {
      const response = await fetch(`${this.API_URL}/auth/refresh`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ refreshToken: this.refreshTokenValue }),
      });
      if (!response.ok) return false;
      const data = await response.json();
      this.setTokens(data.data.accessToken, data.data.refreshToken);
      return true;
    } catch { return false; }
  }

  // ── Auth endpoints ─────────────────────────────────────────────────────────

  async register(email, password, firstName, lastName) {
    const data = await this.request('/auth/register', {
      method: 'POST',
      body:   JSON.stringify({ email, password, firstName, lastName }),
    });
    if (data?.data?.accessToken) this.setTokens(data.data.accessToken, data.data.refreshToken);
    return data;
  }

  async login(email, password) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body:   JSON.stringify({ email, password }),
    });
    if (data?.data?.accessToken) this.setTokens(data.data.accessToken, data.data.refreshToken);
    return data;
  }

  async logout() {
    try { await this.request('/auth/logout', { method: 'POST' }); } catch { /* swallow */ }
    this.clearTokens();
  }

  async getCurrentUser() { return this.request('/auth/me'); }

  // ── Password vault ─────────────────────────────────────────────────────────

  async getSavedPasswords()           { return this.request('/passwords'); }
  async savePassword(website, username, password, notes = '') {
    return this.request('/passwords', { method: 'POST', body: JSON.stringify({ website, username, password, notes }) });
  }
  async updatePassword(id, updates)  { return this.request(`/passwords/${id}`, { method: 'PUT', body: JSON.stringify(updates) }); }
  async deletePassword(id)           { return this.request(`/passwords/${id}`, { method: 'DELETE' }); }

  // ── Breach ─────────────────────────────────────────────────────────────────

  async checkEmailBreach(email) {
    return this.request('/breach/check-email', { method: 'POST', body: JSON.stringify({ email }) });
  }
  async checkPasswordStrength(password) {
    return this.request('/breach/check-password', { method: 'POST', body: JSON.stringify({ password }) });
  }
  async getBreachHistory(page = 1, limit = 10) {
    return this.request(`/breach/history?page=${page}&limit=${limit}`);
  }

  // ── Phishing ───────────────────────────────────────────────────────────────

  async checkPhishingURL(url) {
    return this.request('/phishing/check-url', { method: 'POST', body: JSON.stringify({ url }) });
  }

  // ── Security ───────────────────────────────────────────────────────────────

  async getSecurityNews()               { return this.request('/security/news'); }
  async getSecurityLogs(page = 1, limit = 20) { return this.request(`/security/logs?page=${page}&limit=${limit}`); }
  async getAIAnalysis(context)          { return this.request('/security/ai-analysis', { method: 'POST', body: JSON.stringify({ context }) }); }

  // ── Health ─────────────────────────────────────────────────────────────────

  async healthCheck() {
    try {
      const response = await fetch(`${this.API_URL.replace('/api', '')}/health`);
      return await response.json();
    } catch { return { success: false, message: 'Backend unreachable' }; }
  }
}

const api = new ApiClient();
export default api;