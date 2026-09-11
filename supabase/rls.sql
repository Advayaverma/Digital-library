-- ==============================================================================
-- Digital Library Database Security: Row Level Security (RLS) Policies
-- Phase 13: Database-Level Authorization & Access Control
-- ==============================================================================

-- ==============================================================================
-- 1. HELPER SECURITY FUNCTION: is_admin()
-- Evaluates whether the currently authenticated user has the 'admin' role
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- 2. ENABLE RLS ON ALL APPLICATION TABLES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.borrowings ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- 3. PROFILES POLICIES
-- ==============================================================================
DROP POLICY IF EXISTS "Public profiles are readable by authenticated users" ON public.profiles;
CREATE POLICY "Public profiles are readable by authenticated users"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
    ON public.profiles FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- ==============================================================================
-- 4. BOOKS POLICIES
-- Anyone can browse books; only admins can modify the catalog
-- ==============================================================================
DROP POLICY IF EXISTS "Anyone can view books" ON public.books;
CREATE POLICY "Anyone can view books"
    ON public.books FOR SELECT
    TO public
    USING (true);

DROP POLICY IF EXISTS "Only admins can insert books" ON public.books;
CREATE POLICY "Only admins can insert books"
    ON public.books FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Only admins can update books" ON public.books;
CREATE POLICY "Only admins can update books"
    ON public.books FOR UPDATE
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Only admins can delete books" ON public.books;
CREATE POLICY "Only admins can delete books"
    ON public.books FOR DELETE
    TO authenticated
    USING (public.is_admin());

-- ==============================================================================
-- 5. BORROWINGS POLICIES
-- Normal users can only manage their own borrowings; admins have system oversight
-- ==============================================================================
DROP POLICY IF EXISTS "Users can view own borrowings; admins view all" ON public.borrowings;
CREATE POLICY "Users can view own borrowings; admins view all"
    ON public.borrowings FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can insert their own borrowings" ON public.borrowings;
CREATE POLICY "Users can insert their own borrowings"
    ON public.borrowings FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can return their own borrowings; admins can update all" ON public.borrowings;
CREATE POLICY "Users can return their own borrowings; admins can update all"
    ON public.borrowings FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id OR public.is_admin())
    WITH CHECK (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can delete their own returned records; admins delete all" ON public.borrowings;
CREATE POLICY "Users can delete their own returned records; admins delete all"
    ON public.borrowings FOR DELETE
    TO authenticated
    USING ((auth.uid() = user_id AND status = 'returned') OR public.is_admin());
