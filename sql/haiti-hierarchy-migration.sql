-- Migration: Add support for 4-level Haiti administrative hierarchy in shipping rules
-- Hierarchy: Department -> Arrondissement -> Commune -> Section Communale

-- 1. Add communal_section column to shipping_rates
ALTER TABLE public.shipping_rates 
ADD COLUMN IF NOT EXISTS communal_section TEXT,
ADD COLUMN IF NOT EXISTS arrondissement TEXT,
ADD COLUMN IF NOT EXISTS is_free_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS country_code TEXT DEFAULT 'HT',
ADD COLUMN IF NOT EXISTS zone_scope TEXT DEFAULT 'global',
ADD COLUMN IF NOT EXISTS zone_values TEXT[] DEFAULT '{}'::TEXT[];

-- 2. Ensure existing 'city' or 'regions' data is mapped to the new structure if possible
-- (Manual adjustments might be needed via Admin UI after migration)

-- 3. Update 'free_shipping_threshold' logic
UPDATE public.shipping_rates
SET is_free_enabled = TRUE
WHERE free_shipping_threshold IS NOT NULL AND free_shipping_threshold > 0;

-- 4. Clean up any hardcoded international rules that shouldn't be there
DELETE FROM public.shipping_rates 
WHERE name IN ('Livraison internationale', 'International Shipping') 
   OR country = 'USA' 
   OR country = 'Canada';

-- 5. Add communal_section to addresses table for user profiles
ALTER TABLE public.addresses
ADD COLUMN IF NOT EXISTS communal_section TEXT,
ADD COLUMN IF NOT EXISTS arrondissement TEXT;

-- 6. Refresh RLS Policies (Ensure they allow the new columns)
DROP POLICY IF EXISTS "Allow public read-only access for shipping rates" ON public.shipping_rates;
CREATE POLICY "Allow public read-only access for shipping rates"
ON public.shipping_rates FOR SELECT
TO anon, authenticated
USING (is_active = true);

DROP POLICY IF EXISTS "Allow admins full access to shipping rates" ON public.shipping_rates;
CREATE POLICY "Allow admins full access to shipping rates"
ON public.shipping_rates FOR ALL
TO authenticated
USING (auth.uid() IN (SELECT id FROM public.users WHERE role = 'admin'))
WITH CHECK (auth.uid() IN (SELECT id FROM public.users WHERE role = 'admin'));
