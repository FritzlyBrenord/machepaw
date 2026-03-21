-- =====================================================
-- 17-SELLER-STOREFRONT-SLUG.SQL
-- Unique public boutique slug for each seller
-- =====================================================

ALTER TABLE public.sellers
    ADD COLUMN IF NOT EXISTS store_slug TEXT;

CREATE OR REPLACE FUNCTION public.slugify_storefront_value(p_value TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
    v_slug TEXT;
BEGIN
    v_slug := lower(COALESCE(trim(p_value), ''));
    v_slug := regexp_replace(v_slug, '[^a-z0-9]+', '-', 'g');
    v_slug := regexp_replace(v_slug, '(^-+|-+$)', '', 'g');
    v_slug := regexp_replace(v_slug, '-{2,}', '-', 'g');

    IF v_slug = '' THEN
        v_slug := 'boutique';
    END IF;

    RETURN v_slug;
END;
$$;

CREATE OR REPLACE FUNCTION public.ensure_seller_store_slug()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_base_slug TEXT;
    v_candidate TEXT;
    v_suffix INTEGER := 1;
BEGIN
    IF TG_OP = 'UPDATE'
        AND COALESCE(NEW.store_slug, '') = COALESCE(OLD.store_slug, '')
        AND COALESCE(NEW.business_name, '') = COALESCE(OLD.business_name, '')
        AND COALESCE(NEW.store_slug, '') <> ''
    THEN
        RETURN NEW;
    END IF;

    v_base_slug := public.slugify_storefront_value(
        COALESCE(NULLIF(NEW.store_slug, ''), NEW.business_name, 'boutique')
    );
    v_candidate := v_base_slug;

    WHILE EXISTS (
        SELECT 1
        FROM public.sellers s
        WHERE s.store_slug = v_candidate
          AND (TG_OP = 'INSERT' OR s.id <> NEW.id)
    ) LOOP
        v_suffix := v_suffix + 1;
        v_candidate := v_base_slug || '-' || v_suffix::TEXT;
    END LOOP;

    NEW.store_slug := v_candidate;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS ensure_seller_store_slug_trigger ON public.sellers;
CREATE TRIGGER ensure_seller_store_slug_trigger
    BEFORE INSERT OR UPDATE ON public.sellers
    FOR EACH ROW
    EXECUTE FUNCTION public.ensure_seller_store_slug();

UPDATE public.sellers
SET store_slug = NULL
WHERE store_slug IS NULL
   OR btrim(store_slug) = '';

UPDATE public.sellers
SET store_slug = store_slug
WHERE store_slug IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_sellers_store_slug
    ON public.sellers (store_slug)
    WHERE store_slug IS NOT NULL;
