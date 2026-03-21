-- =====================================================
-- DÉSACTIVER ROW LEVEL SECURITY (RLS) SUR TOUTES LES TABLES
-- Exécutez ce script dans l'éditeur SQL de Supabase pour tout permettre
-- =====================================================

-- 1. Désactiver RLS sur les tables de la base de données (Schéma public)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE addresses DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE sellers DISABLE ROW LEVEL SECURITY;
ALTER TABLE seller_applications DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists DISABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE currencies DISABLE ROW LEVEL SECURITY;
ALTER TABLE shipping_rates DISABLE ROW LEVEL SECURITY;
ALTER TABLE settings DISABLE ROW LEVEL SECURITY;

-- 2. Contourner RLS sur le stockage (Storage)
-- Vous ne pouvez pas désactiver RLS sur storage.objects (erreur 42501).
-- À la place, on crée des politiques permissives ("Allow All").

-- D'abord, on supprime les politiques existantes pour éviter les conflits
DROP POLICY IF EXISTS "Public can view product images" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Public can view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Only admins can manage categories" ON storage.objects;
DROP POLICY IF EXISTS "Sellers can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can manage product images" ON storage.objects;

-- Ensuite, on crée une politique qui autorise TOUT pour TOUT LE MONDE (public)
CREATE POLICY "Allow All Storage" ON storage.objects FOR ALL USING (true) WITH CHECK (true);
