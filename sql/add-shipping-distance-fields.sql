-- Ajouter les colonnes de configuration de livraison par kilomètre à la table 'sellers'
ALTER TABLE sellers
ADD COLUMN IF NOT EXISTS base_shipping_price DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS price_per_km DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS location_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10,8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11,8);

-- Ajouter les coordonnées géographiques à la table 'addresses'
ALTER TABLE addresses
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10,8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11,8);

-- Rafraîchir le schéma JSON PostgREST de Supabase (facultatif mais recommandé après des ajouts de colonnes)
NOTIFY pgrst, 'reload schema';
