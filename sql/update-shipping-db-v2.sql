-- Update shipping_rates table for hierarchical and conditional shipping
-- V2: Adds is_free_enabled and ensures consistency for Haiti hierarchy

-- 1. Add new columns if they don't exist
ALTER TABLE public.shipping_rates 
ADD COLUMN IF NOT EXISTS is_free_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS country_code TEXT DEFAULT 'HT',
ADD COLUMN IF NOT EXISTS zone_scope TEXT DEFAULT 'global',
ADD COLUMN IF NOT EXISTS zone_values TEXT[] DEFAULT '{}'::TEXT[];

-- 2. Update existing data to reflect the new structure where possible
UPDATE public.shipping_rates
SET country_code = 'HT'
WHERE country_code IS NULL;

-- 3. Ensure the 'free_shipping_threshold' is used correctly with the toggle
UPDATE public.shipping_rates
SET is_free_enabled = TRUE
WHERE free_shipping_threshold IS NOT NULL AND free_shipping_threshold > 0;

-- 4. Enable RLS (if not already)
ALTER TABLE public.shipping_rates ENABLE ROW LEVEL SECURITY;

-- 5. Policies
CREATE POLICY "Allow public read-only access for shipping rates"
ON public.shipping_rates FOR SELECT
TO anon, authenticated
USING (is_active = true);

CREATE POLICY "Allow admins full access to shipping rates"
ON public.shipping_rates FOR ALL
TO authenticated
USING (auth.uid() IN (SELECT id FROM public.users WHERE role = 'admin'))
WITH CHECK (auth.uid() IN (SELECT id FROM public.users WHERE role = 'admin'));

-- Note: The 'isActive' check in the policies depends on your column naming.
-- If you used is_active instead of isActive, adjust accordingly.
