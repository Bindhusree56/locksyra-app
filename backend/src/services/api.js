const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class ApiClient {
  constructor() {
    this.accessToken = localStorage.getItem('accessToken') || null;
    this.refreshToken = localStorage.getItem('refreshToken') || null;
  }

  setTokens(accessToken, refreshToken) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }

  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  async request(endpoint, options = {}) {
    const url = `${API_URL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      // Handle token expiration
      if (response.status === 401) {
        const data = await response.json();
        if (data.code === 'TOKEN_EXPIRED' && this.refreshToken) {
          // Try to refresh token
          const refreshed = await this.refreshAccessToken();
          if (refreshed) {
            // Retry original request with new token
            headers['Authorization'] = `Bearer ${this.accessToken}`;
            const retryResponse = await fetch(url, {
              ...options,
              headers,
            });
            return await this.handleResponse(retryResponse);
          }
        }
        // If refresh failed, clear tokens and throw error
        this.clearTokens();
        throw new Error('Authentication failed. Please login again.');
      }

      return await this.handleResponse(response);
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async handleResponse(response) {
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Request failed');
    }

    return data;
  }

  async refreshAccessToken() {
    try {
      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refreshToken: this.refreshToken,
        }),
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      this.setTokens(data.data.accessToken, data.data.refreshToken);
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  }

  // Auth endpoints
  async register(email, password, firstName, lastName) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, firstName, lastName }),
    });
  }

  async login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async logout() {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  // Breach endpoints
  async checkEmailBreach(email) {
    return this.request('/breach/check-email', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async getBreachHistory(page = 1, limit = 10) {
    return this.request(`/breach/history?page=${page}&limit=${limit}`);
  }

  async checkPasswordStrength(password) {
    return this.request('/breach/check-password', {
      method: 'POST',
      body: JSON.stringify({ password }),
    });
  }

  async getBreachStats() {
    return this.request('/breach/stats');
  }

  // Phishing endpoints
  async checkPhishingURL(url) {
    return this.request('/phishing/check-url', {
      method: 'POST',
      body: JSON.stringify({ url }),
    });
  }

  // Security endpoints
  async getSecurityNews() {
    return this.request('/security/news');
  }

  async getAIAnalysis(context) {
    return this.request('/security/ai-analysis', {
      method: 'POST',
      body: JSON.stringify({ context }),
    });
  }

  async getSecurityLogs(page = 1, limit = 20) {
    return this.request(`/security/logs?page=${page}&limit=${limit}`);
  }

  async getSecurityDashboard() {
    return this.request('/security/dashboard');
  }
}

const api = new ApiClient();
export default api;