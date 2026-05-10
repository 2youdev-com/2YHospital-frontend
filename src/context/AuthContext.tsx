// src/context/AuthContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import Cookies from 'js-cookie';
import { authService } from '@/services/auth.service';
import { clearAuthCookies } from '@/services/api.client';
import type { User } from '@/types';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (tokens: { accessToken: string; refreshToken: string; user: User }) => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// In-memory user cache — survives page navigation within the same session
// but is cleared on logout or page reload.
let cachedUser: User | null = null;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(cachedUser);
  // If we already have a cached user, skip the loading state
  const [isLoading, setIsLoading] = useState(cachedUser === null);

  const refreshUser = useCallback(async () => {
    try {
      const me = await authService.getMe();
      cachedUser = me;
      setUser(me);
    } catch {
      cachedUser = null;
      setUser(null);
    }
  }, []);

  useEffect(() => {
    // If we already have a cached user from a previous render, skip the API call
    if (cachedUser !== null) {
      setIsLoading(false);
      return;
    }

    const token = Cookies.get('accessToken');
    if (token) {
      refreshUser().finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [refreshUser]);

  const login = useCallback((tokens: { accessToken: string; refreshToken: string; user: User }) => {
    Cookies.set('accessToken', tokens.accessToken, { expires: 1 });
    Cookies.set('refreshToken', tokens.refreshToken, { expires: 7 });
    Cookies.set('userRole', tokens.user.role, { expires: 7 });
    Cookies.set('userId', tokens.user.id, { expires: 7 });
    cachedUser = tokens.user;
    setUser(tokens.user);
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = Cookies.get('refreshToken');
    if (refreshToken) {
      try { await authService.logout(refreshToken); } catch { /* ignore */ }
    }
    cachedUser = null;
    clearAuthCookies();
    setUser(null);
    window.location.href = '/login';
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated: !!user, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}