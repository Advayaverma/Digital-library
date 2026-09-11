# Supabase Production Setup Guide

This guide details the complete configuration required to connect the Digital Library web application to a live, production-grade Supabase project with PostgreSQL, Authentication, Row-Level Security (RLS), and Storage.

---

## 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and log in.
2. Click **New Project**.
3. Choose an organization, enter a name (e.g. `digital-library-prod`), set a strong database password, and select the region closest to your users.
4. Wait for the database provisioning to complete (~1-2 minutes).

---

## 2. Execute Database Schema & Policies
Open the **SQL Editor** in your Supabase Dashboard:

### Step 2.1: Run Schema & RLS Policies
1. Open [`supabase/schema.sql`](./schema.sql).
2. Copy the entire contents into the SQL Editor and click **Run**.
3. This creates:
   - `public.profiles` (User metadata & RBAC roles: `user` or `admin`)
   - `public.books` (Library catalog)
   - `public.borrowings` (Active loans and return history)
   - `unique_active_book_borrowing` partial index (concurrency protection preventing double-borrowing)
   - Trigger `on_auth_user_created` (automatically creates a profile row upon signup)
   - Row Level Security (RLS) policies and helper function `is_admin()`

### Step 2.2: Seed Library Catalog
1. Open [`supabase/seed.sql`](./seed.sql).
2. Paste the SQL into the SQL Editor and click **Run**.
3. This populates initial catalog books with titles, authors, genres, ISBNs, and cover URLs.

### Step 2.3: Set Up Storage (Optional for Book Covers)
1. Open [`supabase/storage.sql`](./storage.sql).
2. Paste into the SQL Editor and click **Run**.
3. This creates the public `book-covers` bucket with appropriate upload and read policies.

---

## 3. Configure Authentication Settings
In the Supabase Dashboard, navigate to **Authentication > URL Configuration**:

1. **Site URL**:
   - Production: `https://<your-app-name>.vercel.app`
   - Local: `http://localhost:5173`
2. **Redirect URLs**:
   Add the following entries to the Redirect URLs allowlist:
   - `http://localhost:5173/**`
   - `https://<your-app-name>.vercel.app/**`
   - `https://*-<your-vercel-team>.vercel.app/**` (allows preview deployment URLs)

### Email Provider Settings (**Authentication > Providers > Email**):
- **Enable Email provider**: Checked.
- **Confirm email**:
  - *Development / Evaluation*: Uncheck to allow instant login without email verification links.
  - *Production*: Check, and configure custom SMTP under **Project Settings > Auth**.

---

## 4. Retrieve API Credentials
In the Supabase Dashboard, go to **Project Settings > API**:
- **Project URL**: (e.g., `https://xyzcompany.supabase.co`)
- **Project API Keys > `anon` `public`**: (e.g., `eyJhbGciOi...`)

> **Note**: Never expose your `service_role` key in frontend code or Git. Only use the `anon` public key in client environments.

---

## 5. Set Environment Variables
### In Local Development (`.env`):
```env
VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
```

### In Vercel Production:
1. Navigate to your project on [vercel.com](https://vercel.com).
2. Go to **Settings > Environment Variables**.
3. Add:
   - `VITE_SUPABASE_URL` = `https://<your-project-ref>.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `<your-anon-key>`
4. Check **Production**, **Preview**, and **Development**.
5. Trigger a redeployment.

---

## 6. Verify Configuration
Run the automated verification script:
```bash
npm run verify
```
This script validates that:
- Credentials format is valid.
- `public.books`, `public.profiles`, and `public.borrowings` tables are accessible.
- `book-covers` storage bucket is available.
