import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = () => {
  return (
    Boolean(supabaseUrl) &&
    Boolean(supabaseAnonKey) &&
    supabaseUrl !== 'https://your-project-ref.supabase.co' &&
    supabaseAnonKey !== 'your-publishable-anon-key-here'
  );
};

if (!isSupabaseConfigured()) {
  console.warn(
    '⚠️ Supabase is not fully configured. Please set your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.'
  );
}

// Create and export the Supabase client instance
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key'
);
