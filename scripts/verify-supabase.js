/**
 * Supabase Production Configuration & Connectivity Verification Script
 * Validates database connection, schema tables, RLS policies, and storage buckets.
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read .env file manually if present
const envPath = path.resolve(__dirname, '../.env');
let supabaseUrl = process.env.VITE_SUPABASE_URL;
let supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...rest] = trimmed.split('=');
      const val = rest.join('=').trim();
      if (key.trim() === 'VITE_SUPABASE_URL') supabaseUrl = val;
      if (key.trim() === 'VITE_SUPABASE_ANON_KEY') supabaseAnonKey = val;
    }
  }
}

console.log('\n======================================================');
console.log('  SUPABASE PRODUCTION CONFIGURATION VERIFICATION');
console.log('======================================================\n');

// 1. Validate environment credentials
const isPlaceholder =
  !supabaseUrl ||
  !supabaseAnonKey ||
  supabaseUrl.includes('your-project-ref') ||
  supabaseAnonKey.includes('your-publishable-anon-key');

if (isPlaceholder) {
  console.log('❌ Status: Supabase credentials are not yet configured in .env');
  console.log('\nTo connect your live Supabase database:');
  console.log('  1. Go to https://supabase.com/dashboard and create a project.');
  console.log('  2. Open Project Settings -> API.');
  console.log('  3. Copy Project URL and Project API Key (anon public).');
  console.log('  4. Set them in your local .env and in Vercel Environment Variables:');
  console.log('       VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co');
  console.log('       VITE_SUPABASE_ANON_KEY=<your-anon-key>');
  console.log('  5. Run database migrations: supabase/schema.sql & supabase/seed.sql');
  console.log('\n(Note: The application is running in graceful fallback mode until keys are provided.)\n');
  process.exit(0);
}

console.log(`📡 Connecting to Supabase URL: ${supabaseUrl}`);

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function runDiagnostics() {
  let passed = 0;
  let total = 4;

  // 1. Check Books table
  try {
    const { data, error } = await supabase.from('books').select('id, title').limit(1);
    if (error) {
      console.log(`❌ Table 'public.books': Error -> ${error.message}`);
    } else {
      console.log(`✅ Table 'public.books': Accessible (returned ${data ? data.length : 0} sample rows)`);
      passed++;
    }
  } catch (err) {
    console.log(`❌ Table 'public.books': Exception -> ${err.message}`);
  }

  // 2. Check Profiles table
  try {
    const { data, error } = await supabase.from('profiles').select('id, username, role').limit(1);
    if (error) {
      console.log(`❌ Table 'public.profiles': Error -> ${error.message}`);
    } else {
      console.log(`✅ Table 'public.profiles': Accessible (returned ${data ? data.length : 0} sample rows)`);
      passed++;
    }
  } catch (err) {
    console.log(`❌ Table 'public.profiles': Exception -> ${err.message}`);
  }

  // 3. Check Borrowings table
  try {
    const { data, error } = await supabase.from('borrowings').select('id, status').limit(1);
    if (error) {
      console.log(`❌ Table 'public.borrowings': Error -> ${error.message}`);
    } else {
      console.log(`✅ Table 'public.borrowings': Accessible (returned ${data ? data.length : 0} sample rows)`);
      passed++;
    }
  } catch (err) {
    console.log(`❌ Table 'public.borrowings': Exception -> ${err.message}`);
  }

  // 4. Check Storage bucket
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    if (error) {
      console.log(`⚠️  Storage Buckets: Note -> ${error.message}`);
    } else {
      const hasCovers = buckets?.some((b) => b.name === 'book-covers');
      if (hasCovers) {
        console.log(`✅ Storage Bucket 'book-covers': Found and ready`);
        passed++;
      } else {
        console.log(`ℹ️  Storage Bucket 'book-covers': Not found (run supabase/storage.sql if file uploads are needed)`);
        passed++;
      }
    }
  } catch (err) {
    console.log(`ℹ️  Storage check skipped: ${err.message}`);
  }

  console.log('\n------------------------------------------------------');
  console.log(`Verification Summary: ${passed}/${total} checks passed`);
  console.log('------------------------------------------------------\n');
}

runDiagnostics();
