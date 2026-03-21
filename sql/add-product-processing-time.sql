-- Add processing time columns to products table
ALTER TABLE products 
ADD COLUMN min_processing_days INTEGER DEFAULT 1,
ADD COLUMN max_processing_days INTEGER DEFAULT 3;

-- Update the active_products view to include the new columns
DROP VIEW IF EXISTS active_products;
CREATE VIEW active_products AS
SELECT 
    p.*,
    c.name as category_name,
    c.slug as category_slug,
    s.business_name as seller_business_name,
    s.is_verified as seller_verified
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN sellers s ON p.seller_id = s.id
WHERE p.status = 'active';
