-- =====================================================
-- 04-SECURE-MARKETPLACE-FOUNDATION.SQL
-- Security helpers, seller KYC, role-aware RLS, seller/admin views
-- Run this after schema.sql and the auth sync migrations.
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

-- =====================================================
-- SELLER SECURITY / KYC COLUMNS
-- =====================================================

ALTER TABLE public.sellers
    ADD COLUMN IF NOT EXISTS kyc_status TEXT NOT NULL DEFAULT 'not_submitted',
    ADD COLUMN IF NOT EXISTS kyc_submitted_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS kyc_reviewed_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS kyc_review_notes TEXT,
    ADD COLUMN IF NOT EXISTS payout_details JSONB NOT NULL DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS notification_settings JSONB NOT NULL DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS shipping_settings JSONB NOT NULL DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS pickup_address JSONB;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'sellers_kyc_status_check'
    ) THEN
        ALTER TABLE public.sellers
            ADD CONSTRAINT sellers_kyc_status_check
            CHECK (kyc_status IN ('not_submitted', 'pending', 'approved', 'rejected', 'needs_more_info'));
    END IF;
END $$;

ALTER TABLE public.seller_applications
    ADD COLUMN IF NOT EXISTS kyc_status TEXT NOT NULL DEFAULT 'not_submitted',
    ADD COLUMN IF NOT EXISTS legal_name TEXT,
    ADD COLUMN IF NOT EXISTS identity_document_number TEXT,
    ADD COLUMN IF NOT EXISTS reviewed_notes TEXT;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'seller_applications_kyc_status_check'
    ) THEN
        ALTER TABLE public.seller_applications
            ADD CONSTRAINT seller_applications_kyc_status_check
            CHECK (kyc_status IN ('not_submitted', 'pending', 'approved', 'rejected', 'needs_more_info'));
    END IF;
END $$;

-- =====================================================
-- SELLER KYC DOCUMENTS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.seller_kyc_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    seller_id UUID REFERENCES public.sellers(id) ON DELETE CASCADE,
    seller_application_id UUID REFERENCES public.seller_applications(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL CHECK (
        document_type IN (
            'national_id',
            'tax_document',
            'proof_of_address',
            'business_registration',
            'bank_statement',
            'selfie_verification',
            'other'
        )
    ),
    storage_bucket TEXT NOT NULL DEFAULT 'seller-kyc',
    storage_path TEXT NOT NULL,
    file_name TEXT,
    mime_type TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'needs_more_info')),
    notes TEXT,
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_seller_kyc_documents_user_id
    ON public.seller_kyc_documents(user_id);

CREATE INDEX IF NOT EXISTS idx_seller_kyc_documents_seller_id
    ON public.seller_kyc_documents(seller_id);

CREATE INDEX IF NOT EXISTS idx_seller_kyc_documents_application_id
    ON public.seller_kyc_documents(seller_application_id);

CREATE INDEX IF NOT EXISTS idx_seller_kyc_documents_status
    ON public.seller_kyc_documents(status);

ALTER TABLE public.seller_kyc_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Seller KYC docs are readable by owner and admins" ON public.seller_kyc_documents;
CREATE POLICY "Seller KYC docs are readable by owner and admins"
    ON public.seller_kyc_documents
    FOR SELECT
    USING (
        user_id = public.current_profile_id()
        OR public.is_current_user_admin()
    );

DROP POLICY IF EXISTS "Seller KYC docs can be created by owner" ON public.seller_kyc_documents;
CREATE POLICY "Seller KYC docs can be created by owner"
    ON public.seller_kyc_documents
    FOR INSERT
    WITH CHECK (
        user_id = public.current_profile_id()
    );

DROP POLICY IF EXISTS "Seller KYC docs can be updated by owner and admins" ON public.seller_kyc_documents;
CREATE POLICY "Seller KYC docs can be updated by owner and admins"
    ON public.seller_kyc_documents
    FOR UPDATE
    USING (
        user_id = public.current_profile_id()
        OR public.is_current_user_admin()
    )
    WITH CHECK (
        user_id = public.current_profile_id()
        OR public.is_current_user_admin()
    );

-- =====================================================
-- SELLER / APPLICATION RLS
-- =====================================================

ALTER TABLE public.sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seller_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Sellers can read own seller profile" ON public.sellers;
CREATE POLICY "Sellers can read own seller profile"
    ON public.sellers
    FOR SELECT
    USING (
        user_id = public.current_profile_id()
        OR public.is_current_user_admin()
    );

DROP POLICY IF EXISTS "Sellers can update own seller profile" ON public.sellers;
CREATE POLICY "Sellers can update own seller profile"
    ON public.sellers
    FOR UPDATE
    USING (
        user_id = public.current_profile_id()
        OR public.is_current_user_admin()
    )
    WITH CHECK (
        user_id = public.current_profile_id()
        OR public.is_current_user_admin()
    );

DROP POLICY IF EXISTS "Admins can create seller rows" ON public.sellers;
CREATE POLICY "Admins can create seller rows"
    ON public.sellers
    FOR INSERT
    WITH CHECK (
        public.is_current_user_admin()
    );

DROP POLICY IF EXISTS "Users can read own seller applications" ON public.seller_applications;
CREATE POLICY "Users can read own seller applications"
    ON public.seller_applications
    FOR SELECT
    USING (
        user_id = public.current_profile_id()
        OR public.is_current_user_admin()
    );

DROP POLICY IF EXISTS "Users can create own seller applications" ON public.seller_applications;
CREATE POLICY "Users can create own seller applications"
    ON public.seller_applications
    FOR INSERT
    WITH CHECK (
        user_id = public.current_profile_id()
    );

DROP POLICY IF EXISTS "Users can update own pending seller applications" ON public.seller_applications;
CREATE POLICY "Users can update own pending seller applications"
    ON public.seller_applications
    FOR UPDATE
    USING (
        user_id = public.current_profile_id()
        OR public.is_current_user_admin()
    )
    WITH CHECK (
        user_id = public.current_profile_id()
        OR public.is_current_user_admin()
    );

-- =====================================================
-- ORDERS / ORDER ITEMS RLS
-- =====================================================

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
CREATE POLICY "Users can view own orders"
    ON public.orders
    FOR SELECT
    USING (
        user_id = public.current_profile_id()
        OR public.is_current_user_admin()
        OR EXISTS (
            SELECT 1
            FROM public.order_items oi
            WHERE oi.order_id = orders.id
              AND oi.seller_id = public.current_seller_id()
        )
    );

DROP POLICY IF EXISTS "Admins can manage all orders" ON public.orders;
CREATE POLICY "Admins can manage all orders"
    ON public.orders
    FOR ALL
    USING (public.is_current_user_admin())
    WITH CHECK (public.is_current_user_admin());

DROP POLICY IF EXISTS "Users can read order items for own orders" ON public.order_items;
CREATE POLICY "Users can read order items for own orders"
    ON public.order_items
    FOR SELECT
    USING (
        public.is_current_user_admin()
        OR EXISTS (
            SELECT 1
            FROM public.orders o
            WHERE o.id = order_items.order_id
              AND o.user_id = public.current_profile_id()
        )
        OR order_items.seller_id = public.current_seller_id()
    );

DROP POLICY IF EXISTS "Admins can manage all order items" ON public.order_items;
CREATE POLICY "Admins can manage all order items"
    ON public.order_items
    FOR ALL
    USING (public.is_current_user_admin())
    WITH CHECK (public.is_current_user_admin());

-- =====================================================
-- STORAGE POLICIES FOR PRIVATE SELLER / PAYMENT FILES
-- =====================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('seller-kyc', 'seller-kyc', false)
ON CONFLICT (id) DO NOTHING;

UPDATE storage.buckets
SET public = false
WHERE id IN ('seller-kyc', 'payment-proofs');

DROP POLICY IF EXISTS "Users can upload own seller kyc files" ON storage.objects;
CREATE POLICY "Users can upload own seller kyc files"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'seller-kyc'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

DROP POLICY IF EXISTS "Users can view own seller kyc files" ON storage.objects;
CREATE POLICY "Users can view own seller kyc files"
    ON storage.objects
    FOR SELECT
    TO authenticated
    USING (
        bucket_id = 'seller-kyc'
        AND (
            (storage.foldername(name))[1] = auth.uid()::text
            OR public.is_current_user_admin()
        )
    );

DROP POLICY IF EXISTS "Users can delete own seller kyc files" ON storage.objects;
CREATE POLICY "Users can delete own seller kyc files"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'seller-kyc'
        AND (
            (storage.foldername(name))[1] = auth.uid()::text
            OR public.is_current_user_admin()
        )
    );

DROP POLICY IF EXISTS "Users can upload own payment proofs" ON storage.objects;
CREATE POLICY "Users can upload own payment proofs"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'payment-proofs'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

DROP POLICY IF EXISTS "Users can view own payment proofs" ON storage.objects;
CREATE POLICY "Users can view own payment proofs"
    ON storage.objects
    FOR SELECT
    TO authenticated
    USING (
        bucket_id = 'payment-proofs'
        AND (
            (storage.foldername(name))[1] = auth.uid()::text
            OR public.is_current_user_admin()
        )
    );

-- =====================================================
-- VIEWS FOR SELLER / ADMIN BACKOFFICE
-- =====================================================

DROP VIEW IF EXISTS public.seller_order_items_view;
CREATE VIEW public.seller_order_items_view AS
SELECT
    oi.id,
    oi.order_id,
    oi.product_id,
    oi.seller_id,
    oi.name AS product_name,
    oi.sku,
    oi.image,
    oi.price,
    oi.quantity,
    oi.total,
    oi.status AS item_status,
    o.order_number,
    o.status AS order_status,
    o.payment_status,
    o.payment_method,
    o.payment_id,
    o.payment_proof_url,
    o.shipping_address,
    o.tracking_number,
    o.created_at,
    o.updated_at,
    u.id AS customer_id,
    u.first_name AS customer_first_name,
    u.last_name AS customer_last_name,
    u.email AS customer_email,
    p.owner_id,
    p.owner_name
FROM public.order_items oi
JOIN public.orders o ON o.id = oi.order_id
JOIN public.users u ON u.id = o.user_id
LEFT JOIN public.products p ON p.id = oi.product_id;

DROP VIEW IF EXISTS public.admin_seller_overview;
CREATE VIEW public.admin_seller_overview AS
WITH product_counts AS (
    SELECT seller_id, COUNT(*)::INT AS products_count
    FROM public.products
    WHERE seller_id IS NOT NULL
    GROUP BY seller_id
)
SELECT
    COALESCE(s.id, sa.id) AS review_id,
    s.id AS seller_id,
    sa.id AS application_id,
    COALESCE(s.user_id, sa.user_id) AS user_id,
    COALESCE(s.business_name, sa.business_name) AS business_name,
    COALESCE(s.business_type, sa.business_type) AS business_type,
    COALESCE(s.description, sa.business_description) AS description,
    COALESCE(s.contact_person, CONCAT(sa.first_name, ' ', sa.last_name)) AS contact_person,
    COALESCE(s.contact_phone, sa.phone) AS contact_phone,
    COALESCE(s.contact_email, sa.email) AS contact_email,
    COALESCE(s.tax_id, sa.tax_id) AS tax_id,
    COALESCE(s.status, sa.status) AS status,
    s.logo,
    s.banner,
    s.is_verified,
    s.kyc_status,
    s.kyc_submitted_at,
    s.kyc_reviewed_at,
    s.kyc_review_notes,
    s.total_sales,
    s.total_revenue,
    s.rating,
    s.review_count,
    s.commission_rate,
    s.blocked_until,
    s.block_reason,
    COALESCE(s.categories::TEXT[], sa.product_categories::TEXT[]) AS categories,
    COALESCE(pc.products_count, s.products_count, 0) AS products_count,
    sa.status AS application_status,
    sa.current_step,
    sa.rejection_reason,
    sa.reviewed_at,
    sa.reviewed_by,
    sa.submitted_at,
    COALESCE(s.created_at, sa.created_at) AS created_at,
    u.first_name,
    u.last_name,
    u.email
FROM public.seller_applications sa
LEFT JOIN public.sellers s
    ON s.user_id = sa.user_id
LEFT JOIN product_counts pc
    ON pc.seller_id = s.id
LEFT JOIN public.users u
    ON u.id = COALESCE(s.user_id, sa.user_id)
UNION
SELECT
    s.id AS review_id,
    s.id AS seller_id,
    NULL::UUID AS application_id,
    s.user_id,
    s.business_name,
    s.business_type,
    s.description,
    s.contact_person,
    s.contact_phone,
    s.contact_email,
    s.tax_id,
    s.status,
    s.logo,
    s.banner,
    s.is_verified,
    s.kyc_status,
    s.kyc_submitted_at,
    s.kyc_reviewed_at,
    s.kyc_review_notes,
    s.total_sales,
    s.total_revenue,
    s.rating,
    s.review_count,
    s.commission_rate,
    s.blocked_until,
    s.block_reason,
    s.categories::TEXT[],
    COALESCE(pc.products_count, s.products_count, 0) AS products_count,
    NULL::TEXT AS application_status,
    NULL::INT AS current_step,
    s.rejection_reason,
    NULL::TIMESTAMPTZ AS reviewed_at,
    NULL::UUID AS reviewed_by,
    NULL::TIMESTAMPTZ AS submitted_at,
    s.created_at,
    u.first_name,
    u.last_name,
    u.email
FROM public.sellers s
LEFT JOIN product_counts pc
    ON pc.seller_id = s.id
LEFT JOIN public.users u
    ON u.id = s.user_id
WHERE NOT EXISTS (
    SELECT 1
    FROM public.seller_applications sa
    WHERE sa.user_id = s.user_id
);
