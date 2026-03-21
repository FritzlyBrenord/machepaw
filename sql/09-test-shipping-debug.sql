-- Script pour tester manuellement le calcul de livraison
-- Exécuter dans l'éditeur SQL Supabase

-- 1. Vérifier s'il y a des tarifs de livraison configurés
SELECT '=== SHIPPING RATES ===' as section;
SELECT 
  id,
  name,
  base_price,
  price_per_km,
  latitude,
  longitude,
  location_name,
  is_active,
  priority
FROM shipping_rates 
WHERE is_active = true 
ORDER BY priority ASC, created_at ASC;

-- 2. Vérifier s'il y a des adresses avec coordonnées
SELECT '=== USER ADDRESSES ===' as section;
SELECT 
  id,
  user_id,
  first_name,
  last_name,
  address,
  city,
  commune,
  department,
  latitude,
  longitude,
  phone
FROM addresses 
WHERE latitude IS NOT NULL AND longitude IS NOT NULL
LIMIT 5;

-- 3. Vérifier les adresses sans coordonnées
SELECT '=== ADDRESSES WITHOUT COORDINATES ===' as section;
SELECT 
  id,
  user_id,
  first_name,
  last_name,
  address,
  city,
  commune,
  department,
  latitude,
  longitude
FROM addresses 
WHERE (latitude IS NULL OR longitude IS NULL) AND commune IS NOT NULL
LIMIT 5;

-- 4. Tester la fonction Haversine manuellement
SELECT '=== DISTANCE CALCULATION TEST ===' as section;
-- Distance entre Port-au-Prince et Cap-Haïtien
WITH distance_test AS (
  SELECT 
    18.5944 AS lat1, -- Port-au-Prince
    -72.3074 AS lng1,
    19.7543 AS lat2, -- Cap-Haïtien  
    -72.1969 AS lng2,
    6371 AS R -- Rayon Terre en km
)
SELECT 
  lat1, lng1, lat2, lng2,
  R * 2 * ASIN(SQRT(
    POWER(SIN((RADIANS(lat2 - lat1)) / 2), 2) +
    COS(RADIANS(lat1)) * COS(RADIANS(lat2)) *
    POWER(SIN((RADIANS(lng2 - lng1)) / 2), 2)
  )) AS distance_km
FROM distance_test;

-- 5. Calcul de frais de livraison exemple
SELECT '=== SHIPPING COST EXAMPLE ===' as section;
WITH shipping_calc AS (
  SELECT 
    250.00 AS base_price,
    50.00 AS price_per_km,
    131.5 AS distance_km -- Distance Port-au-Prince à Cap-Haïtien
)
SELECT 
  base_price,
  price_per_km,
  distance_km,
  CASE 
    WHEN distance_km <= 2 THEN base_price
    ELSE base_price + (distance_km * price_per_km)
  END AS total_shipping_cost
FROM shipping_calc;
