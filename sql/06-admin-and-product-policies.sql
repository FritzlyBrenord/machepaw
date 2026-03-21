-- =====================================================
-- 06-ADMIN-AND-PRODUCT-POLICIES.SQL
-- Extra admin governance and explicit seller product rules
-- Run this after 04-secure-marketplace-foundation.sql
-- =====================================================

-- =====================================================
-- USERS: ADMINS MUST BE ABLE TO GOVERN THE DIRECTORY
-- =====================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage all users" ON public.users;
CREATE POLICY "Admins can manage all users"
    ON public.users
    FOR ALL
    USING (public.is_current_user_admin())
    WITH CHECK (public.is_current_user_admin());

-- =====================================================
-- PRODUCTS: EXPLICIT POLICIES FOR SELLER-OWNED CATALOG
-- =====================================================

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Products are viewable by everyone" ON public.products;
CREATE POLICY "Products are viewable by everyone"
    ON public.products
    FOR SELECT
    USING (status = 'active');

DROP POLICY IF EXISTS "Sellers can manage own products" ON public.products;
DROP POLICY IF EXISTS "Sellers can read own products" ON public.products;
CREATE POLICY "Sellers can read own products"
    ON public.products
    FOR SELECT
    USING (
        owner_type = 'seller'
        AND owner_id = public.current_profile_id()
    );

DROP POLICY IF EXISTS "Sellers can create own products" ON public.products;
CREATE POLICY "Sellers can create own products"
    ON public.products
    FOR INSERT
    WITH CHECK (
        owner_type = 'seller'
        AND owner_id = public.current_profile_id()
        AND seller_id = public.current_seller_id()
    );

DROP POLICY IF EXISTS "Sellers can update own products" ON public.products;
CREATE POLICY "Sellers can update own products"
    ON public.products
    FOR UPDATE
    USING (
        owner_type = 'seller'
        AND owner_id = public.current_profile_id()
    )
    WITH CHECK (
        owner_type = 'seller'
        AND owner_id = public.current_profile_id()
        AND seller_id = public.current_seller_id()
    );

DROP POLICY IF EXISTS "Sellers can delete own products" ON public.products;
CREATE POLICY "Sellers can delete own products"
    ON public.products
    FOR DELETE
    USING (
        owner_type = 'seller'
        AND owner_id = public.current_profile_id()
    );

DROP POLICY IF EXISTS "Admins can manage all products" ON public.products;
CREATE POLICY "Admins can manage all products"
    ON public.products
    FOR ALL
    USING (public.is_current_user_admin())
    WITH CHECK (public.is_current_user_admin());
