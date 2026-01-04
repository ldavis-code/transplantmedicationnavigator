/**
 * Subscriber Authentication Context
 * Manages authentication state for subscribers (patients)
 * Separate from admin AuthContext - uses Supabase for storage
 */

import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';

const SubscriberAuthContext = createContext(null);

// Storage keys (different from admin auth)
const SUBSCRIBER_TOKEN_KEY = 'tmn_subscriber_token';
const SUBSCRIBER_USER_KEY = 'tmn_subscriber_user';

// API base URL
const API_BASE = '/.netlify/functions';

export function SubscriberAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user from storage on mount
  useEffect(() => {
    async function loadUser() {
      try {
        const token = localStorage.getItem(SUBSCRIBER_TOKEN_KEY);
        const storedUser = localStorage.getItem(SUBSCRIBER_USER_KEY);

        if (token && storedUser) {
          // Verify token is still valid
          const response = await fetch(`${API_BASE}/subscriber-auth/verify`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (response.ok) {
            const data = await response.json();
            // Update user with latest data from server
            const updatedUser = data.user || JSON.parse(storedUser);
            setUser(updatedUser);
            localStorage.setItem(SUBSCRIBER_USER_KEY, JSON.stringify(updatedUser));
          } else {
            // Token invalid, clear storage
            localStorage.removeItem(SUBSCRIBER_TOKEN_KEY);
            localStorage.removeItem(SUBSCRIBER_USER_KEY);
          }
        }
      } catch (err) {
        console.error('Error loading subscriber:', err);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  // Login with email/password
  const login = useCallback(async (email, password) => {
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/subscriber-auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      localStorage.setItem(SUBSCRIBER_TOKEN_KEY, data.token);
      localStorage.setItem(SUBSCRIBER_USER_KEY, JSON.stringify(data.user));
      setUser(data.user);

      return { success: true, user: data.user };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, []);

  // Register new subscriber
  const register = useCallback(async (email, password, name) => {
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/subscriber-auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      localStorage.setItem(SUBSCRIBER_TOKEN_KEY, data.token);
      localStorage.setItem(SUBSCRIBER_USER_KEY, JSON.stringify(data.user));
      setUser(data.user);

      return { success: true, user: data.user };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, []);

  // Logout
  const logout = useCallback(() => {
    localStorage.removeItem(SUBSCRIBER_TOKEN_KEY);
    localStorage.removeItem(SUBSCRIBER_USER_KEY);
    setUser(null);
  }, []);

  // Get auth token for API calls
  const getToken = useCallback(() => {
    return localStorage.getItem(SUBSCRIBER_TOKEN_KEY);
  }, []);

  // Update user data locally (after sync, subscription change, etc.)
  const updateUser = useCallback((updates) => {
    setUser(prev => {
      const updated = { ...prev, ...updates };
      localStorage.setItem(SUBSCRIBER_USER_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Refresh user data from server
  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem(SUBSCRIBER_TOKEN_KEY);
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE}/subscriber-auth/verify`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.user) {
          setUser(data.user);
          localStorage.setItem(SUBSCRIBER_USER_KEY, JSON.stringify(data.user));
        }
      }
    } catch (err) {
      console.error('Error refreshing user:', err);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      error,
      isAuthenticated: !!user,
      isPro: user?.plan === 'pro' && user?.subscription_status === 'active',
      login,
      register,
      logout,
      getToken,
      updateUser,
      refreshUser,
    }),
    [user, loading, error, login, register, logout, getToken, updateUser, refreshUser]
  );

  return (
    <SubscriberAuthContext.Provider value={value}>
      {children}
    </SubscriberAuthContext.Provider>
  );
}

export function useSubscriberAuth() {
  const context = useContext(SubscriberAuthContext);
  if (!context) {
    throw new Error('useSubscriberAuth must be used within a SubscriberAuthProvider');
  }
  return context;
}

export default SubscriberAuthContext;
