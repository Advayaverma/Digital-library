-- ==============================================================================
-- Digital Library Storage Setup: Supabase Storage for Book Covers
-- Phase 14: Object Storage Configuration & Policies
-- ==============================================================================

-- 1. Create the 'book-covers' public bucket if not already present
INSERT INTO storage.buckets (id, name, public)
VALUES ('book-covers', 'book-covers', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Allow anyone to view and download book covers
DROP POLICY IF EXISTS "Public can view book covers" ON storage.objects;
CREATE POLICY "Public can view book covers"
    ON storage.objects FOR SELECT
    TO public
    USING (bucket_id = 'book-covers');

-- 3. Allow only administrators to upload book cover images
DROP POLICY IF EXISTS "Only admins can upload book covers" ON storage.objects;
CREATE POLICY "Only admins can upload book covers"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'book-covers' AND
        public.is_admin()
    );

-- 4. Allow only administrators to delete book cover images
DROP POLICY IF EXISTS "Only admins can delete book covers" ON storage.objects;
CREATE POLICY "Only admins can delete book covers"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'book-covers' AND
        public.is_admin()
    );
