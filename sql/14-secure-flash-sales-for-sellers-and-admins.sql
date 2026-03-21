-- =====================================================
-- 14-SECURE-FLASH-SALES-FOR-SELLERS-AND-ADMINS.SQL
-- Enable RLS for flash sales and let sellers manage only
-- the promotions attached to their own products.
-- =====================================================

ALTER TABLE public.flash_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flash_sale_purchases ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- FLASH SALES ACCESS
-- =====================================================

DROP POLICY IF EXISTS "Public can read active flash sales" ON public.flash_sales;
CREATE POLICY "Public can read active flash sales"
    ON public.flash_sales
    FOR SELECT
    USING (
        status = 'active'
        OR public.is_current_user_admin()
        OR EXISTS (
            SELECT 1
            FROM public.products p
            WHERE p.id = flash_sales.product_id
              AND p.seller_id = public.current_seller_id()
        )
    );

DROP POLICY IF EXISTS "Sellers can insert own flash sales" ON public.flash_sales;
CREATE POLICY "Sellers can insert own flash sales"
    ON public.flash_sales
    FOR INSERT
    WITH CHECK (
        created_by = public.current_profile_id()
        AND EXISTS (
            SELECT 1
            FROM public.products p
            WHERE p.id = flash_sales.product_id
              AND p.seller_id = public.current_seller_id()
        )
    );

DROP POLICY IF EXISTS "Sellers can update own flash sales" ON public.flash_sales;
CREATE POLICY "Sellers can update own flash sales"
    ON public.flash_sales
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1
            FROM public.products p
            WHERE p.id = flash_sales.product_id
              AND p.seller_id = public.current_seller_id()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM public.products p
            WHERE p.id = flash_sales.product_id
              AND p.seller_id = public.current_seller_id()
        )
    );

DROP POLICY IF EXISTS "Sellers can delete own flash sales" ON public.flash_sales;
CREATE POLICY "Sellers can delete own flash sales"
    ON public.flash_sales
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1
            FROM public.products p
            WHERE p.id = flash_sales.product_id
              AND p.seller_id = public.current_seller_id()
        )
    );

DROP POLICY IF EXISTS "Admins can manage all flash sales" ON public.flash_sales;
CREATE POLICY "Admins can manage all flash sales"
    ON public.flash_sales
    FOR ALL
    USING (public.is_current_user_admin())
    WITH CHECK (public.is_current_user_admin());

-- =====================================================
-- FLASH SALE PURCHASE ACCESS
-- =====================================================

DROP POLICY IF EXISTS "Users can read own flash sale purchases" ON public.flash_sale_purchases;
CREATE POLICY "Users can read own flash sale purchases"
    ON public.flash_sale_purchases
    FOR SELECT
    USING (user_id = public.current_profile_id());

DROP POLICY IF EXISTS "Sellers can read purchases from own flash sales" ON public.flash_sale_purchases;
CREATE POLICY "Sellers can read purchases from own flash sales"
    ON public.flash_sale_purchases
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1
            FROM public.flash_sales fs
            JOIN public.products p
                ON p.id = fs.product_id
            WHERE fs.id = flash_sale_purchases.flash_sale_id
              AND p.seller_id = public.current_seller_id()
        )
    );

DROP POLICY IF EXISTS "Admins can manage all flash sale purchases" ON public.flash_sale_purchases;
CREATE POLICY "Admins can manage all flash sale purchases"
    ON public.flash_sale_purchases
    FOR ALL
    USING (public.is_current_user_admin())
    WITH CHECK (public.is_current_user_admin());
