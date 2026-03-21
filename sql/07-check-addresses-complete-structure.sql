-- Script pour vérifier la structure complète de la table addresses
-- Exécuter dans l'éditeur SQL Supabase

-- Vérifier si la table addresses existe
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE  table_schema = 'public'
   AND    table_name   = 'addresses'
) AS addresses_table_exists;

-- Afficher la structure complète de la table
SELECT 
  column_name,
  data_type,
  character_maximum_length,
  is_nullable,
  column_default,
  ordinal_position
FROM information_schema.columns
WHERE table_name = 'addresses' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Vérifier les contraintes de la table
SELECT 
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
LEFT JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.table_name = 'addresses' AND tc.table_schema = 'public'
ORDER BY tc.constraint_type, tc.constraint_name;

-- Vérifier les index
SELECT 
  indexname,
  indexdef,
  schemaname,
  tablename
FROM pg_indexes
WHERE tablename = 'addresses' AND schemaname = 'public'
ORDER BY indexname;

-- Vérifier les politiques RLS
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'addresses'
ORDER BY policyname;

-- Afficher quelques exemples de données (si existantes)
SELECT 
  id,
  user_id,
  first_name,
  last_name,
  address,
  city,
  department,
  commune,
  arrondissement,
  communal_section,
  country,
  phone,
  is_default,
  label,
  created_at
FROM addresses
LIMIT 5;
