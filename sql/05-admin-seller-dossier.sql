ALTER TABLE public.seller_applications
    ADD COLUMN IF NOT EXISTS legal_name TEXT,
    ADD COLUMN IF NOT EXISTS identity_document_number TEXT;

DROP VIEW IF EXISTS public.admin_seller_overview;

CREATE VIEW public.admin_seller_overview
WITH (security_invoker = true) AS
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
    sa.has_physical_store,
    sa.physical_store_address,
    sa.product_types,
    sa.estimated_products,
    sa.legal_name,
    sa.identity_document_number,
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
    s.has_physical_store,
    NULL::JSONB AS physical_store_address,
    NULL::TEXT AS product_types,
    NULL::INT AS estimated_products,
    NULL::TEXT AS legal_name,
    NULL::TEXT AS identity_document_number,
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
