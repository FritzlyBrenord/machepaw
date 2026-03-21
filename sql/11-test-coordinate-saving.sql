-- Script pour tester si les coordonnées sont bien sauvegardées
-- Exécuter dans l'éditeur SQL Supabase

-- 1. Vérifier la structure actuelle de la table addresses
SELECT '=== CURRENT ADDRESSES STRUCTURE ===' as section;
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'addresses' 
AND column_name IN ('latitude', 'longitude', 'commune', 'department', 'arrondissement', 'city')
ORDER BY column_name;

-- 2. Vérifier les adresses existantes avec leurs coordonnées
SELECT '=== EXISTING ADDRESSES WITH COORDINATES ===' as section;
SELECT 
  id,
  user_id,
  first_name,
  last_name,
  commune,
  department,
  arrondissement,
  city,
  latitude,
  longitude,
  CASE 
    WHEN latitude IS NULL OR longitude IS NULL THEN 'MISSING COORDINATES'
    ELSE 'COORDINATES OK'
  END as coordinate_status
FROM addresses 
ORDER BY created_at DESC;

-- 3. Tester si les coordonnées peuvent être insérées
SELECT '=== COORDINATE INSERTION TEST ===' as section;
-- Simuler une insertion avec coordonnées
SELECT 'Test insertion with coordinates:' as test;
SELECT 
  'Cap-Haïtien' as commune,
  19.75952 as latitude,
  -72.20081 as longitude,
  'Nord' as department,
  'Cap-Haïtien' as arrondissement;

-- 4. Vérifier les tarifs de livraison actifs
SELECT '=== ACTIVE SHIPPING RATES ===' as section;
SELECT 
  id,
  name,
  base_price,
  price_per_km,
  latitude,
  longitude,
  location_name,
  is_active
FROM shipping_rates 
WHERE is_active = true 
ORDER BY priority ASC;

-- Message de confirmation
SELECT '=== TEST COMPLETE ===' as section;
SELECT 'Ready to test coordinate saving in AddressForm!' as message;
