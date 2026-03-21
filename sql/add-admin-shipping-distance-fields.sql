-- Ajouter les colonnes de livraison dynamique par kilomètre (Admin)
ALTER TABLE settings
ADD COLUMN IF NOT EXISTS base_price DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS price_per_km DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS location_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10,8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11,8);

NOTIFY pgrst, 'reload schema';
