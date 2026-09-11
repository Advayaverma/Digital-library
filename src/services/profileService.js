import { supabase, isSupabaseConfigured } from '../lib/supabase.js';

/**
 * Fetch a user's profile and role from `public.profiles` table.
 */
export async function getProfile(userId) {
  if (!userId) return null;

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        // If profile doesn't exist yet, attempt to create default
        console.warn('Profile lookup note:', error.message);
        return null;
      }
      return data;
    } catch (err) {
      console.error('Error in getProfile:', err.message);
      return null;
    }
  }

  // Fallback simulation when Supabase is not configured in .env
  const localRole = localStorage.getItem('role') || 'user';
  return {
    id: userId,
    username: localRole === 'admin' ? 'admin123' : 'user123',
    role: localRole,
  };
}

/**
 * Update user's profile metadata or role.
 */
export async function updateProfile(userId, updates) {
  if (!userId) return null;

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error in updateProfile:', err.message);
      throw err;
    }
  }

  return { id: userId, ...updates };
}

/**
 * Check if the given profile or role object is admin.
 */
export function isAdmin(profile) {
  return profile?.role === 'admin';
}

/**
 * Check if the given user ID has the admin role.
 */
export async function isUserAdmin(userId) {
  const profile = await getProfile(userId);
  return profile?.role === 'admin';
}
