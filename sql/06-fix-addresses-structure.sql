-- Script pour mettre à jour la table addresses avec la structure correcte
-- Exécuter dans l'éditeur SQL Supabase

-- Ajouter les champs manquants à la table addresses
ALTER TABLE public.addresses 
ADD COLUMN IF NOT EXISTS label text NULL,
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone NULL DEFAULT now(),
ADD COLUMN IF NOT EXISTS department text NULL,
ADD COLUMN IF NOT EXISTS commune text NULL;

-- Vérifier la structure actuelle
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'addresses' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Mettre à jour les valeurs par défaut si nécessaire
UPDATE public.addresses 
SET country = 'Haiti' 
WHERE country IS NULL OR country = 'Haïti';

-- Créer le trigger pour updated_at s'il n'existe pas
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_addresses_updated_at ON public.addresses;
CREATE TRIGGER update_addresses_updated_at
BEFORE UPDATE ON public.addresses
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Activer RLS (Row Level Security) si pas déjà fait
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;

-- Créer les politiques RLS si elles n'existent pas
DROP POLICY IF EXISTS "Users can view own addresses" ON public.addresses;
CREATE POLICY "Users can view own addresses" ON public.addresses
FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own addresses" ON public.addresses;
CREATE POLICY "Users can insert own addresses" ON public.addresses
FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own addresses" ON public.addresses;
CREATE POLICY "Users can update own addresses" ON public.addresses
FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own addresses" ON public.addresses;
CREATE POLICY "Users can delete own addresses" ON public.addresses
FOR DELETE USING (auth.uid() = user_id);
