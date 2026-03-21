-- Script pour ajouter les coordonnées de l'adresse de l'utilisateur
-- Exécuter dans l'éditeur SQL Supabase

-- Mettre à jour l'adresse de l'utilisateur avec les coordonnées de Fort-Liberté
UPDATE addresses 
SET 
  latitude = 19.6733,
  longitude = -71.8423
WHERE id = '7c4a1273-d045-47a6-82d8-79c2cce6d22e';

-- Vérifier la mise à jour
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
WHERE id = '7c4a1273-d045-47a6-82d8-79c2cce6d22e';

-- Calculer la distance depuis Port-au-Prince jusqu'à Fort-Liberté
WITH distance_calc AS (
  SELECT 
    18.5944 AS port_au_prince_lat,
    -72.3074 AS port_au_prince_lng,
    19.6733 AS fort_liberte_lat,
    -71.8423 AS fort_liberte_lng,
    6371 AS earth_radius_km
)
SELECT 
  'Distance Port-au-Prince → Fort-Liberté' as route,
  earth_radius_km * 2 * ASIN(SQRT(
    POWER(SIN((RADIANS(fort_liberte_lat - port_au_prince_lat)) / 2), 2) +
    COS(RADIANS(port_au_prince_lat)) * COS(RADIANS(fort_liberte_lat)) *
    POWER(SIN((RADIANS(fort_liberte_lng - port_au_prince_lng)) / 2), 2)
  )) AS distance_km
FROM distance_calc;

-- Calculer les frais de livraison pour cette distance
WITH shipping_calc AS (
  SELECT 
    250.00 AS base_price,
    50.00 AS price_per_km,
    earth_radius_km * 2 * ASIN(SQRT(
      POWER(SIN((RADIANS(fort_liberte_lat - port_au_prince_lat)) / 2), 2) +
      COS(RADIANS(port_au_prince_lat)) * COS(RADIANS(fort_liberte_lat)) *
      POWER(SIN((RADIANS(fort_liberte_lng - port_au_prince_lng)) / 2), 2)
    )) AS distance_km
  FROM (
    SELECT 
      18.5944 AS port_au_prince_lat,
      -72.3074 AS port_au_prince_lng,
      19.6733 AS fort_liberte_lat,
      -71.8423 AS fort_liberte_lng,
      6371 AS earth_radius_km
  ) coords
)
SELECT 
  'Frais de livraison Fort-Liberté' as calculation,
  base_price,
  price_per_km,
  ROUND(distance_km, 2) AS distance_km,
  CASE 
    WHEN distance_km <= 2 THEN base_price
    ELSE base_price + (distance_km * price_per_km)
  END AS total_shipping_cost
FROM shipping_calc;
