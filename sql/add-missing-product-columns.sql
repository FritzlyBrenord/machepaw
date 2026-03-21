-- Ajouter les colonnes manquantes à la table "products"

ALTER TABLE products 
ADD COLUMN IF NOT EXISTS attributes JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS has_variants BOOLEAN DEFAULT FALSE;
