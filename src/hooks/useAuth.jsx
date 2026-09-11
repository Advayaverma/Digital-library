import React, { createContext, useContext, useState, useEffect } from 'react';
import * as authService from '../services/authService.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial session lookup
    async function initSession() {
      try {
        const initialSession = await authService.getSession();
        setSession(initialSession);
        setUser(initialSession?.user || null);
      } catch (err) {
        console.error('Error initializing auth session:', err);
      } finally {
        setLoading(false);
      }
    }

    initSession();

    // Listen to Supabase auth events (login, logout, token refresh)
    const subscription = authService.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      setUser(currentSession?.user || null);
      setLoading(false);
    });

    return () => {
      if (subscription?.unsubscribe) {
        subscription.unsubscribe();
      }
    };
  }, []);

  const signIn = async (email, password) => {
    const res = await authService.signIn({ email, password });
    if (res.data?.session) {
      setSession(res.data.session);
      setUser(res.data.user);
    }
    return res;
  };

  const signUp = async ({ email, password, username }) => {
    const res = await authService.signUp({ email, password, username });
    if (res.data?.session) {
      setSession(res.data.session);
      setUser(res.data.user);
    }
    return res;
  };

  const signOut = async () => {
    await authService.signOut();
    setUser(null);
    setSession(null);
  };

  const value = {
    user,
    session,
    loading,
    isAuthenticated: Boolean(user),
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
