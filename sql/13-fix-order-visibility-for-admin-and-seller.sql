-- =====================================================
-- 13-FIX-ORDER-VISIBILITY-FOR-ADMIN-AND-SELLER.SQL
-- Ensure seller/admin order views stay visible with users RLS enabled
-- =====================================================

-- Allow admins to read customer profiles required by order dashboards.
DROP POLICY IF EXISTS "Admins can read all users for orders" ON public.users;
CREATE POLICY "Admins can read all users for orders"
    ON public.users
    FOR SELECT
    USING (public.is_current_user_admin());

-- Allow sellers to read customer rows only for orders containing their items.
DROP POLICY IF EXISTS "Sellers can read customers from own orders" ON public.users;
CREATE POLICY "Sellers can read customers from own orders"
    ON public.users
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1
            FROM public.orders o
            JOIN public.order_items oi
                ON oi.order_id = o.id
            WHERE o.user_id = users.id
              AND oi.seller_id = public.current_seller_id()
        )
    );

-- Keep orders visible even if customer directory access is partially restricted.
DROP VIEW IF EXISTS public.order_details;
CREATE VIEW public.order_details
WITH (security_invoker = true) AS
SELECT
    o.*,
    u.first_name || ' ' || u.last_name AS customer_name,
    u.email AS customer_email,
    COALESCE(
        json_agg(
            json_build_object(
                'id', oi.id,
                'product_id', oi.product_id,
                'seller_id', oi.seller_id,
                'owner_id', p.owner_id,
                'owner_name', p.owner_name,
                'name', oi.name,
                'sku', oi.sku,
                'image', oi.image,
                'price', oi.price,
                'quantity', oi.quantity,
                'total', oi.total,
                'status', oi.status,
                'min_processing_days', oi.min_processing_days,
                'max_processing_days', oi.max_processing_days
            )
        ) FILTER (WHERE oi.id IS NOT NULL),
        '[]'
    ) AS items
FROM public.orders o
LEFT JOIN public.users u
    ON u.id = o.user_id
LEFT JOIN public.order_items oi
    ON oi.order_id = o.id
LEFT JOIN public.products p
    ON p.id = oi.product_id
GROUP BY o.id, u.first_name, u.last_name, u.email;

DROP VIEW IF EXISTS public.seller_order_items_view;
CREATE VIEW public.seller_order_items_view
WITH (security_invoker = true) AS
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
JOIN public.orders o
    ON o.id = oi.order_id
LEFT JOIN public.users u
    ON u.id = o.user_id
LEFT JOIN public.products p
    ON p.id = oi.product_id;
