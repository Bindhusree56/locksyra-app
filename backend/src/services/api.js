const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

class ApiClient {
  constructor() {
    this.API_URL = API_URL;
    this.accessToken = localStorage.getItem('accessToken');
    this.refreshTokenValue = localStorage.getItem('refreshToken');
  }

  setTokens(accessToken, refreshToken) {
    this.accessToken = accessToken;
    this.refreshTokenValue = refreshToken;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }

  clearTokens() {
    this.accessToken = null;
    this.refreshTokenValue = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  async request(endpoint, options = {}) {
    const url = `${this.API_URL}${endpoint}`;
    const headers = { 'Content-Type': 'application/json', ...options.headers };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    try {
      let response = await fetch(url, { ...options, headers });

      if (response.status === 401 && this.refreshTokenValue) {
        const refreshed = await this.refreshAccessToken();
        if (refreshed) {
          headers['Authorization'] = `Bearer ${this.accessToken}`;
          response = await fetch(url, { ...options, headers });
        } else {
          this.clearTokens();
          window.dispatchEvent(new CustomEvent('auth:logout'));
          throw new Error('Session expired. Please login again.');
        }
      }

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || `Request failed: ${response.status}`);
      }
      return data;
    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Cannot connect to server. Make sure the backend is running on port 5001.');
      }
      throw error;
    }
  }

  async refreshAccessToken() {
    if (!this.refreshTokenValue) return false;
    try {
      const response = await fetch(`${this.API_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: this.refreshTokenValue })
      });
      if (!response.ok) return false;
      const data = await response.json();
      this.setTokens(data.data.accessToken, data.data.refreshToken);
      return true;
    } catch { return false; }
  }

  // Auth
  async register(email, password, firstName, lastName) {
    const data = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, firstName, lastName })
    });
    if (data.data?.accessToken) this.setTokens(data.data.accessToken, data.data.refreshToken);
    return data;
  }

  async login(email, password) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    if (data.data?.accessToken) this.setTokens(data.data.accessToken, data.data.refreshToken);
    return data;
  }

  async logout() {
    try { await this.request('/auth/logout', { method: 'POST' }); } catch {}
    this.clearTokens();
  }

  async getCurrentUser() { return this.request('/auth/me'); }

  // Passwords (server-side, no localStorage)
  async getSavedPasswords() { return this.request('/passwords'); }

  async savePassword(website, username, password, notes = '') {
    return this.request('/passwords', {
      method: 'POST',
      body: JSON.stringify({ website, username, password, notes })
    });
  }

  async updatePassword(id, updates) {
    return this.request(`/passwords/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  async deletePassword(id) {
    return this.request(`/passwords/${id}`, { method: 'DELETE' });
  }

  // Breach
  async checkEmailBreach(email) {
    return this.request('/breach/check-email', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  }

  async checkPasswordStrength(password) {
    return this.request('/breach/check-password', {
      method: 'POST',
      body: JSON.stringify({ password })
    });
  }

  async getBreachHistory(page = 1, limit = 10) {
    return this.request(`/breach/history?page=${page}&limit=${limit}`);
  }

  // Phishing
  async checkPhishingURL(url) {
    return this.request('/phishing/check-url', {
      method: 'POST',
      body: JSON.stringify({ url })
    });
  }

  // Security
  async getSecurityNews() { return this.request('/security/news'); }
  async getSecurityLogs(page = 1, limit = 20) { return this.request(`/security/logs?page=${page}&limit=${limit}`); }
  async getAIAnalysis(context) {
    return this.request('/security/ai-analysis', {
      method: 'POST',
      body: JSON.stringify({ context })
    });
  }

  async healthCheck() {
    try {
      const response = await fetch(`${this.API_URL.replace('/api', '')}/health`);
      return await response.json();
    } catch { return { success: false, message: 'Backend unreachable' }; }
  }
}

const api = new ApiClient();
export default api;