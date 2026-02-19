import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const checkAuth = useCallback(async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) { setLoading(false); return; }
      const response = await api.getCurrentUser();
      setUser(response.data.user);
    } catch {
      api.clearTokens();
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
    const handleLogout = () => setUser(null);
    window.addEventListener('auth:logout', handleLogout);
    return () => window.removeEventListener('auth:logout', handleLogout);
  }, [checkAuth]);

  const login = async (email, password) => {
    try {
      setError(null);
      const response = await api.login(email, password);
      setUser(response.data.user);
      return { success: true, user: response.data.user };
    } catch (err) {
      const message = err.message || 'Login failed';
      setError(message);
      return { success: false, error: message };
    }
  };

  const register = async (email, password, firstName, lastName) => {
    try {
      setError(null);
      const response = await api.register(email, password, firstName, lastName);
      setUser(response.data.user);
      return { success: true, user: response.data.user };
    } catch (err) {
      const message = err.message || 'Registration failed';
      setError(message);
      return { success: false, error: message };
    }
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout, isAuthenticated: !!user, setError }}>
      {children}
    </AuthContext.Provider>
  );
};
