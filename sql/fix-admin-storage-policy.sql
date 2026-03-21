-- Fix: Ajouter la politique de sécurité (RLS) pour permettre aux administrateurs de gérer les images des produits
-- À exécuter dans l'éditeur SQL de Supabase

CREATE POLICY "Admins can manage product images"
ON storage.objects FOR ALL
TO authenticated
USING (
    bucket_id = 'products-images'
    AND EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
)
WITH CHECK (
    bucket_id = 'products-images'
    AND EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);
