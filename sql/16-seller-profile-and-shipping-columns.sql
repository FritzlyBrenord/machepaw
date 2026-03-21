-- =====================================================
-- 16-SELLER-PROFILE-AND-SHIPPING-COLUMNS.SQL
-- Ensure seller profile photo and shipping settings columns exist
-- =====================================================

ALTER TABLE public.users
    ADD COLUMN IF NOT EXISTS avatar TEXT;

ALTER TABLE public.sellers
    ADD COLUMN IF NOT EXISTS shipping_settings JSONB NOT NULL DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS pickup_address JSONB,
    ADD COLUMN IF NOT EXISTS base_shipping_price NUMERIC(10, 2) DEFAULT 0.00,
    ADD COLUMN IF NOT EXISTS price_per_km NUMERIC(10, 2) DEFAULT 0.00,
    ADD COLUMN IF NOT EXISTS location_name VARCHAR(255),
    ADD COLUMN IF NOT EXISTS location_type TEXT,
    ADD COLUMN IF NOT EXISTS location_dept TEXT,
    ADD COLUMN IF NOT EXISTS latitude NUMERIC(10, 8),
    ADD COLUMN IF NOT EXISTS longitude NUMERIC(11, 8);

UPDATE public.sellers
SET shipping_settings = jsonb_strip_nulls(
    COALESCE(shipping_settings, '{}'::jsonb) ||
    jsonb_build_object(
        'basePrice', COALESCE(base_shipping_price, 0),
        'pricePerKm', COALESCE(price_per_km, 0),
        'locationName', location_name,
        'locationType', location_type,
        'locationDept', location_dept,
        'latitude', latitude,
        'longitude', longitude,
        'allowPickup', CASE WHEN pickup_address IS NULL THEN false ELSE true END
    )
)
WHERE
    shipping_settings IS NULL
    OR shipping_settings = '{}'::jsonb
    OR location_name IS NOT NULL
    OR location_type IS NOT NULL
    OR location_dept IS NOT NULL
    OR latitude IS NOT NULL
    OR longitude IS NOT NULL
    OR pickup_address IS NOT NULL
    OR COALESCE(base_shipping_price, 0) <> 0
    OR COALESCE(price_per_km, 0) <> 0;
