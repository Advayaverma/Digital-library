import { supabase, isSupabaseConfigured } from '../lib/supabase.js';

/**
 * Sign up a new user using Supabase Auth.
 * Passwords are encrypted and hashed by Supabase (never stored in plain text).
 */
export async function signUp({ email, password, username }) {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username || email.split('@')[0],
          },
        },
      });

      if (error) throw error;
      return { data, error: null };
    } catch (err) {
      console.error('Supabase signup error:', err.message);
      return { data: null, error: err };
    }
  }

  // Fallback simulation when Supabase credentials are not yet configured in .env
  console.warn('Supabase not configured. Using local simulation for signup.');
  const mockUser = {
    id: `local-user-${Date.now()}`,
    email,
    user_metadata: { username: username || email.split('@')[0] },
  };
  // Store user info without plain-text password
  localStorage.setItem('currentUser', JSON.stringify(mockUser));
  return { data: { user: mockUser, session: { user: mockUser } }, error: null };
}

/**
 * Resolves an email address from either a direct email or a username.
 */
export async function resolveEmailFromIdentifier(identifier) {
  if (!identifier) return '';
  const trimmed = identifier.trim();
  if (trimmed.includes('@')) return trimmed;

  if (isSupabaseConfigured()) {
    try {
      // 1. Try Supabase RPC get_email_by_username
      const { data, error } = await supabase.rpc('get_email_by_username', {
        p_username: trimmed,
      });

      if (!error && data) {
        return data;
      }

      // 2. Fallback direct profiles query
      const { data: profile } = await supabase
        .from('profiles')
        .select('email')
        .ilike('username', trimmed)
        .maybeSingle();

      if (profile?.email) {
        return profile.email;
      }
    } catch (err) {
      console.warn('Error resolving email from username:', err.message);
    }
  }

  // Fallback simulation
  if (trimmed === 'user123') return 'user123@digitallibrary.local';
  if (trimmed === 'admin123') return 'admin123@digitallibrary.local';

  return trimmed;
}

/**
 * Sign in an existing user using Supabase Auth with either email or username.
 */
export async function signIn({ email, identifier, password }) {
  const targetIdentifier = identifier || email;
  const resolvedEmail = await resolveEmailFromIdentifier(targetIdentifier);

  if (!resolvedEmail) {
    return {
      data: null,
      error: new Error(`Could not find an account associated with "${targetIdentifier}".`),
    };
  }

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: resolvedEmail,
        password,
      });

      if (error) throw error;
      return { data, error: null };
    } catch (err) {
      console.error('Supabase signin error:', err.message);
      return { data: null, error: err };
    }
  }

  // Fallback simulation when Supabase credentials are not yet configured in .env
  console.warn('Supabase not configured. Using local simulation for login.');
  const mockUser = {
    id: 'local-demo-user',
    email: resolvedEmail,
    user_metadata: { username: targetIdentifier.split('@')[0] },
  };
  localStorage.setItem('currentUser', JSON.stringify(mockUser));
  return { data: { user: mockUser, session: { user: mockUser } }, error: null };
}

/**
 * Sign out the current user and destroy active session.
 */
export async function signOut() {
  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (err) {
      console.error('Supabase signout error:', err.message);
    }
  }

  localStorage.removeItem('currentUser');
  localStorage.removeItem('role');
  return { error: null };
}

/**
 * Get current active session.
 */
export async function getSession() {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      return data.session;
    } catch (err) {
      console.error('Error fetching session:', err.message);
      return null;
    }
  }

  const local = localStorage.getItem('currentUser');
  return local ? { user: JSON.parse(local) } : null;
}

/**
 * Get current authenticated user.
 */
export async function getCurrentUser() {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error) throw error;
      return data.user;
    } catch (err) {
      return null;
    }
  }

  const local = localStorage.getItem('currentUser');
  return local ? JSON.parse(local) : null;
}

/**
 * Subscribe to Supabase auth state changes (login, logout, token refresh).
 */
export function onAuthStateChange(callback) {
  if (isSupabaseConfigured()) {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        callback(event, session);
      }
    );
    return subscription;
  }

  return {
    unsubscribe: () => {},
  };
}
