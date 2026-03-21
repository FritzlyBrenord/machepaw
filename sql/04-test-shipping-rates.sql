-- Script pour insérer des tarifs de livraison de test
-- Exécuter dans l'éditeur SQL Supabase

-- Insérer un tarif de livraison par défaut pour l'admin
INSERT INTO shipping_rates (
  name,
  base_rate,
  base_price,
  price_per_km,
  free_shipping_threshold,
  is_active,
  is_free_enabled,
  priority,
  latitude,
  longitude,
  location_name,
  location_type,
  currency_code,
  country_code,
  zone_scope
) VALUES (
  'Livraison Standard - Port-au-Prince',
  250.00,
  250.00,
  50.00,
  5000.00,
  true,
  true,
  1,
  18.5944,
  -72.3074,
  'Port-au-Prince',
  'city',
  'HTG',
  'HT',
  'global'
) ON CONFLICT DO NOTHING;

-- Insérer un tarif pour Cap-Haïtien (basé sur l'adresse de l'utilisateur)
INSERT INTO shipping_rates (
  name,
  base_rate,
  base_price,
  price_per_km,
  free_shipping_threshold,
  is_active,
  is_free_enabled,
  priority,
  latitude,
  longitude,
  location_name,
  location_type,
  currency_code,
  country_code,
  zone_scope
) VALUES (
  'Livraison Nord - Cap-Haïtien',
  350.00,
  350.00,
  60.00,
  5000.00,
  true,
  true,
  2,
  19.7543,
  -72.1969,
  'Cap-Haïtien',
  'city',
  'HTG',
  'HT',
  'global'
) ON CONFLICT DO NOTHING;

-- Insérer un tarif pour Fort-Liberté (ville de l'utilisateur)
INSERT INTO shipping_rates (
  name,
  base_rate,
  base_price,
  price_per_km,
  free_shipping_threshold,
  is_active,
  is_free_enabled,
  priority,
  latitude,
  longitude,
  location_name,
  location_type,
  currency_code,
  country_code,
  zone_scope
) VALUES (
  'Livraison Nord-Est - Fort-Liberté',
  400.00,
  400.00,
  70.00,
  5000.00,
  true,
  true,
  3,
  19.6733,
  -71.8423,
  'Fort-Liberté',
  'city',
  'HTG',
  'HT',
  'global'
) ON CONFLICT DO NOTHING;

-- Vérifier les tarifs insérés
SELECT 
  id,
  name,
  base_price,
  price_per_km,
  free_shipping_threshold,
  latitude,
  longitude,
  location_name,
  priority
FROM shipping_rates 
WHERE is_active = true 
ORDER BY priority ASC, created_at ASC;
