-- Update order_details view to include fulfillment and boutique columns explicitly
DROP VIEW IF EXISTS public.order_details;
CREATE VIEW public.order_details AS
SELECT
    o.id,
    o.order_number,
    o.user_id,
    o.status,
    o.fulfillment_method,
    o.subtotal,
    o.shipping,
    o.tax,
    o.discount,
    o.total,
    o.currency,
    o.shipping_address,
    o.tracking_number,
    o.estimated_delivery,
    o.delivered_at,
    o.payment_method,
    o.payment_status,
    o.notes,
    o.cancellation_reason,
    o.ip_address,
    o.user_agent,
    o.created_at,
    o.updated_at,
    o.payment_id,
    o.payment_proof_url,
    o.boutique_customer_id,
    o.storefront_seller_id,
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
                'status', oi.status
            )
        ) FILTER (WHERE oi.id IS NOT NULL),
        '[]'
    ) AS items
FROM public.orders o
JOIN public.users u
    ON o.user_id = u.id
LEFT JOIN public.order_items oi
    ON o.id = oi.order_id
LEFT JOIN public.products p
    ON p.id = oi.product_id
GROUP BY
    o.id,
    o.order_number,
    o.user_id,
    o.status,
    o.fulfillment_method,
    o.subtotal,
    o.shipping,
    o.tax,
    o.discount,
    o.total,
    o.currency,
    o.shipping_address,
    o.tracking_number,
    o.estimated_delivery,
    o.delivered_at,
    o.payment_method,
    o.payment_status,
    o.notes,
    o.cancellation_reason,
    o.ip_address,
    o.user_agent,
    o.created_at,
    o.updated_at,
    o.payment_id,
    o.payment_proof_url,
    o.boutique_customer_id,
    o.storefront_seller_id,
    u.first_name,
    u.last_name,
    u.email;
