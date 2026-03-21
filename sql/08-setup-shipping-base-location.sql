-- Script pour configurer les tarifs de livraison avec emplacement de base
-- Exécuter dans l'éditeur SQL Supabase

-- Supprimer les anciens tarifs de test
DELETE FROM shipping_rates WHERE location_name IN ('Livraison Standard - Port-au-Prince', 'Livraison Nord - Cap-Haïtien', 'Livraison Nord-Est - Fort-Liberté');

-- Insérer le tarif de base pour l'admin (emplacement de base)
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
  'Tarif Base - Port-au-Prince',
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
);

-- Vérifier la configuration
SELECT 
  id,
  name,
  base_price,
  price_per_km,
  latitude,
  longitude,
  location_name,
  priority,
  is_active
FROM shipping_rates 
WHERE is_active = true 
ORDER BY priority ASC, created_at ASC;

-- Message de test pour vérifier
SELECT 'Configuration terminée. Emplacement base: Port-au-Prince (18.5944, -72.3074), Prix base: 250 HTG, Prix/km: 50 HTG' AS message;
