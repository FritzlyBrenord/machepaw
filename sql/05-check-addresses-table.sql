-- Script pour vérifier et créer la table addresses si nécessaire
-- Exécuter dans l'éditeur SQL Supabase

-- Vérifier si la table addresses existe
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE  table_schema = 'public'
   AND    table_name   = 'addresses'
) AS addresses_table_exists;

-- Si la table n'existe pas, la créer
CREATE TABLE IF NOT EXISTS public.addresses (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  user_id uuid NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  address text NOT NULL,
  apartment text NULL,
  city text NOT NULL,
  postal_code text NOT NULL,
  country text NOT NULL DEFAULT 'Haiti',
  phone text NOT NULL,
  is_default boolean NULL DEFAULT false,
  label text NULL,
  created_at timestamp with time zone NULL DEFAULT now(),
  updated_at timestamp with time zone NULL DEFAULT now(),
  department text NULL,
  arrondissement text NULL,
  commune text NULL,
  communal_section text NULL,
  latitude numeric(12, 8) NULL,
  longitude numeric(12, 8) NULL,
  CONSTRAINT addresses_pkey PRIMARY KEY (id),
  CONSTRAINT addresses_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users (id) ON DELETE CASCADE
);

-- Créer les index manquants
CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON public.addresses USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_addresses_is_default ON public.addresses USING btree (is_default);

-- Créer le trigger pour updated_at
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

-- Activer RLS (Row Level Security)
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;

-- Créer les politiques RLS
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

-- Vérifier la structure finale
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'addresses' AND table_schema = 'public'
ORDER BY ordinal_position;
