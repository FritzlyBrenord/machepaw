-- =====================================================
-- 26-BOUTIQUE-STOREFRONT-THEMES.SQL
-- Seller storefront theme persistence
-- =====================================================

ALTER TABLE public.sellers
    ADD COLUMN IF NOT EXISTS storefront_theme_slug TEXT NULL,
    ADD COLUMN IF NOT EXISTS storefront_theme_config JSONB NULL;

UPDATE public.sellers
SET storefront_theme_slug = COALESCE(NULLIF(TRIM(storefront_theme_slug), ''), 'atelier')
WHERE storefront_theme_slug IS NULL
   OR TRIM(storefront_theme_slug) = '';

ALTER TABLE public.sellers
    ALTER COLUMN storefront_theme_slug SET DEFAULT 'atelier';

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'sellers_storefront_theme_slug_check'
    ) THEN
        ALTER TABLE public.sellers
            ADD CONSTRAINT sellers_storefront_theme_slug_check
            CHECK (storefront_theme_slug IN ('atelier', 'noir', 'maison'));
    END IF;
END;
$$;
