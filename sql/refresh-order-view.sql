-- Update order_details view to include new columns
DROP VIEW IF EXISTS order_details;
CREATE VIEW order_details AS
SELECT 
    o.*,
    u.first_name || ' ' || u.last_name as customer_name,
    u.email as customer_email,
    COALESCE(
        json_agg(
            json_build_object(
                'id', oi.id,
                'product_id', oi.product_id,
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
    ) as items
FROM orders o
JOIN users u ON o.user_id = u.id
LEFT JOIN order_items oi ON o.id = oi.order_id
GROUP BY o.id, u.first_name, u.last_name, u.email;
