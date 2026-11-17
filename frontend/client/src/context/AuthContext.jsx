import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [backendStatus, setBackendStatus] = useState('checking'); // 'connected' | 'disconnected' | 'checking'

  // Check health and validate profile on mount
  useEffect(() => {
    let mounted = true;

    const checkStatus = async () => {
      try {
        await api.checkHealth();
        if (mounted) setBackendStatus('connected');
      } catch (err) {
        if (mounted) setBackendStatus('disconnected');
      }

      if (token) {
        try {
          const profile = await api.auth.getProfile();
          if (mounted && profile?.success) {
            setUser(profile.user);
            setTenant(profile.tenant);
            localStorage.setItem('user', JSON.stringify(profile.user));
          }
        } catch (err) {
          console.warn('Profile fetch error, token might be invalid/expired:', err);
          // If 401/403, clear stale session
          if (err.status === 401 || err.status === 403) {
            logout();
          }
        }
      }
      if (mounted) setLoading(false);
    };

    checkStatus();

    const interval = setInterval(async () => {
      try {
        await api.checkHealth();
        if (mounted) setBackendStatus('connected');
      } catch {
        if (mounted) setBackendStatus('disconnected');
      }
    }, 15000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [token]);

  const login = async (email, password) => {
    const res = await api.auth.login({ email, password });
    if (res.success && res.data) {
      const { token: newToken, user: newUser } = res.data;
      setToken(newToken);
      setUser(newUser);
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(newUser));
      setBackendStatus('connected');
      return res.data;
    }
    throw new Error(res.message || 'Login failed');
  };

  const register = async ({ fullname, email, password, companyName }) => {
    const res = await api.auth.register({
      fullname,
      email,
      password,
      companyName
    });
    if (res.success) {
      // Auto login after successful register
      return await login(email, password);
    }
    throw new Error(res.message || 'Registration failed');
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setTenant(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const retryConnection = async () => {
    setBackendStatus('checking');
    try {
      await api.checkHealth();
      setBackendStatus('connected');
      return true;
    } catch {
      setBackendStatus('disconnected');
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        tenant,
        loading,
        backendStatus,
        isAuthenticated: !!token && !!user,
        isAdmin: user?.role === 'ADMIN',
        login,
        register,
        logout,
        retryConnection
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
