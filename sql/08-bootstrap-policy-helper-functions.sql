-- =====================================================
-- 08-BOOTSTRAP-POLICY-HELPER-FUNCTIONS.SQL
-- Recovery migration for databases where policy helper
-- functions from 04 were not created before running 06.
-- Run this, then rerun 06-admin-and-product-policies.sql.
-- =====================================================

-- =====================================================
-- ROLE / PROFILE HELPERS
-- =====================================================

CREATE OR REPLACE FUNCTION public.current_profile_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT u.id
    FROM public.users u
    WHERE u.id = auth.uid() OR u.auth_id = auth.uid()
    ORDER BY CASE WHEN u.id = auth.uid() THEN 0 ELSE 1 END
    LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT u.role
    FROM public.users u
    WHERE u.id = public.current_profile_id()
    LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.users u
        WHERE u.id = public.current_profile_id()
          AND u.role = 'admin'
          AND COALESCE(u.is_blocked, FALSE) = FALSE
    )
$$;

CREATE OR REPLACE FUNCTION public.current_seller_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT s.id
    FROM public.sellers s
    WHERE s.user_id = public.current_profile_id()
    ORDER BY s.created_at DESC
    LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.is_current_user_approved_seller()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.sellers s
        WHERE s.user_id = public.current_profile_id()
          AND s.status = 'approved'
    )
$$;
