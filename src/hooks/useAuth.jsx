import React, { createContext, useContext, useState, useEffect } from 'react';
import * as authService from '../services/authService.js';
import * as profileService from '../services/profileService.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper to fetch user's database profile and role
  const loadProfile = async (currentUser) => {
    if (!currentUser) {
      setProfile(null);
      return;
    }
    try {
      const userProfile = await profileService.getProfile(currentUser.id);
      setProfile(userProfile);
    } catch (err) {
      console.warn('Error loading user profile:', err);
    }
  };

  useEffect(() => {
    // Initial session lookup
    async function initSession() {
      try {
        const initialSession = await authService.getSession();
        setSession(initialSession);
        const currentUser = initialSession?.user || null;
        setUser(currentUser);
        if (currentUser) {
          await loadProfile(currentUser);
        }
      } catch (err) {
        console.error('Error initializing auth session:', err);
      } finally {
        setLoading(false);
      }
    }

    initSession();

    // Listen to Supabase auth events (login, logout, token refresh)
    const subscription = authService.onAuthStateChange(async (_event, currentSession) => {
      setSession(currentSession);
      const currentUser = currentSession?.user || null;
      setUser(currentUser);
      if (currentUser) {
        await loadProfile(currentUser);
      } else {
        setProfile(null);
      }
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
      await loadProfile(res.data.user);
    }
    return res;
  };

  const signUp = async ({ email, password, username }) => {
    const res = await authService.signUp({ email, password, username });
    if (res.data?.session) {
      setSession(res.data.session);
      setUser(res.data.user);
      await loadProfile(res.data.user);
    }
    return res;
  };

  const signOut = async () => {
    await authService.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  // Resolve role from database profile or metadata
  const role = profile?.role || user?.user_metadata?.role || localStorage.getItem('role') || 'user';
  const isAdmin = role === 'admin';

  const value = {
    user,
    session,
    profile,
    role,
    isAdmin,
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
