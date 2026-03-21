-- Ensure 'shipping_rates' table has columns for distance-based shipping
ALTER TABLE shipping_rates
ADD COLUMN IF NOT EXISTS base_price DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS price_per_km DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS location_name TEXT,
ADD COLUMN IF NOT EXISTS location_type TEXT,
ADD COLUMN IF NOT EXISTS location_dept TEXT,
ADD COLUMN IF NOT EXISTS latitude DECIMAL(12,8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(12,8),
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS name TEXT DEFAULT 'Configuration Livraison';

-- Ensure at least one shipping rate row exists to serve as global config
INSERT INTO shipping_rates (name, base_price, price_per_km, is_active)
SELECT 'Configuration Livraison Par Défaut', 0.00, 0.00, TRUE
WHERE NOT EXISTS (SELECT 1 FROM shipping_rates);

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';
