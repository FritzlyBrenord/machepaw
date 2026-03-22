-- =====================================================
-- 23-SELLER-PLAN-SYSTEM.SQL
-- SaaS plan catalog, seller activation and plan requests
-- =====================================================

CREATE TABLE IF NOT EXISTS public.seller_plans (
    id UUID NOT NULL DEFAULT uuid_generate_v4(),
    slug TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    price NUMERIC NOT NULL DEFAULT 0,
    promo_price NUMERIC NULL,
    currency_code TEXT NOT NULL DEFAULT 'HTG',
    billing_interval TEXT NOT NULL DEFAULT 'monthly',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    features JSONB NOT NULL DEFAULT '[]'::JSONB,
    limits JSONB NOT NULL DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT seller_plans_pkey PRIMARY KEY (id),
    CONSTRAINT seller_plans_slug_key UNIQUE (slug),
    CONSTRAINT seller_plans_billing_interval_check
        CHECK (billing_interval IN ('monthly', 'yearly', 'one_time'))
) TABLESPACE pg_default;

DROP TRIGGER IF EXISTS update_seller_plans_updated_at ON public.seller_plans;
CREATE TRIGGER update_seller_plans_updated_at
    BEFORE UPDATE ON public.seller_plans
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_seller_plans_active
    ON public.seller_plans USING btree (is_active, sort_order) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_seller_plans_slug
    ON public.seller_plans USING btree (slug) TABLESPACE pg_default;

INSERT INTO public.seller_plans (
    slug,
    name,
    description,
    price,
    promo_price,
    currency_code,
    billing_interval,
    is_active,
    is_featured,
    sort_order,
    features,
    limits
)
VALUES
(
    'free',
    'Gratuit',
    'Un plan de base pour demarrer rapidement avec une boutique professionnelle.',
    0,
    0,
    'HTG',
    'monthly',
    TRUE,
    FALSE,
    1,
    '[
      {"key":"storefront","label":"Boutique publique","enabled":true,"description":"Page boutique active et partageable."},
      {"key":"products","label":"Jusqu''a 10 produits","enabled":true,"description":"Catalogue limite pour rester simple au depart."},
      {"key":"delivery","label":"Livraison et retrait","enabled":true,"description":"Modes de remise actifs."},
      {"key":"analytics","label":"Statistiques de base","enabled":true,"description":"Vues simples sur ventes et commandes."},
      {"key":"support","label":"Support standard","enabled":true,"description":"Aide classique par echange."},
      {"key":"custom_design","label":"Theme personnalise","enabled":false,"description":"Personnalisation visuelle avancee reservee aux plans payants."},
      {"key":"custom_domain","label":"Nom de domaine perso","enabled":false,"description":"Reserve au plan Premium."}
    ]'::JSONB,
    '{
      "products": 10,
      "announcements": 1,
      "promotions": 0,
      "offers": 2,
      "pages": 1,
      "team_members": 1,
      "payment_methods": 2,
      "custom_design": false,
      "custom_domain": false,
      "product_images": 5
    }'::JSONB
),
(
    'pro',
    'Pro',
    'Le plan pour les vendeurs qui veulent plus de volume, plus de pages et plus de controle.',
    2500,
    1990,
    'HTG',
    'monthly',
    TRUE,
    TRUE,
    2,
    '[
      {"key":"storefront","label":"Boutique publique","enabled":true,"description":"Page boutique complete et professionnelle."},
      {"key":"products","label":"Catalogue etendu","enabled":true,"description":"Plus de produits et plus de variantes."},
      {"key":"announcements","label":"Annonces multiples","enabled":true,"description":"Plusieurs emplacements de communication."},
      {"key":"promotions","label":"Promotions et ventes flash","enabled":true,"description":"Campagnes commerciales plus frequentes."},
      {"key":"offers","label":"Offres et bundles","enabled":true,"description":"Creer plus d''offres et de packs."},
      {"key":"custom_design","label":"Theme personnalise","enabled":true,"description":"Controle sur les blocs visuels et la mise en avant."},
      {"key":"analytics","label":"Statistiques avancees","enabled":true,"description":"Suivi de performance plus complet."},
      {"key":"priority_support","label":"Support prioritaire","enabled":true,"description":"Traitement plus rapide."}
    ]'::JSONB,
    '{
      "products": 50,
      "announcements": 5,
      "promotions": 3,
      "offers": 10,
      "pages": 5,
      "team_members": 3,
      "payment_methods": 4,
      "custom_design": true,
      "custom_domain": false,
      "product_images": 8
    }'::JSONB
),
(
    'premium',
    'Premium',
    'Le plan premium pour une boutique plus complete, plus visible et plus flexible.',
    7500,
    5900,
    'HTG',
    'monthly',
    TRUE,
    FALSE,
    3,
    '[
      {"key":"storefront","label":"Boutique premium","enabled":true,"description":"Interface avancee et image de marque renforcee."},
      {"key":"products","label":"Volume large","enabled":true,"description":"Catalogue eleve pour les boutiques actives."},
      {"key":"announcements","label":"Communication complete","enabled":true,"description":"Plus de visibilite sur les emplacements annonces."},
      {"key":"promotions","label":"Promotions avancees","enabled":true,"description":"Campagnes et ventes flash plus nombreuses."},
      {"key":"offers","label":"Offres multiples","enabled":true,"description":"Bundles, offres saisonnieres et packs plus nombreux."},
      {"key":"custom_design","label":"Theme complet","enabled":true,"description":"Controle visuel plus poussee."},
      {"key":"analytics","label":"Analytics premium","enabled":true,"description":"Suivi detaille et lecture de performance."},
      {"key":"priority_support","label":"Support prioritaire","enabled":true,"description":"Priorite de traitement."},
      {"key":"custom_domain","label":"Nom de domaine perso","enabled":true,"description":"A connecter a la boutique."}
    ]'::JSONB,
    '{
      "products": 200,
      "announcements": 20,
      "promotions": 10,
      "offers": 50,
      "pages": 20,
      "team_members": 10,
      "payment_methods": 8,
      "custom_design": true,
      "custom_domain": true,
      "product_images": 12
    }'::JSONB
)
ON CONFLICT (slug) DO UPDATE
SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    promo_price = EXCLUDED.promo_price,
    currency_code = EXCLUDED.currency_code,
    billing_interval = EXCLUDED.billing_interval,
    is_active = EXCLUDED.is_active,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    features = EXCLUDED.features,
    limits = EXCLUDED.limits,
    updated_at = NOW();

ALTER TABLE public.sellers
    ADD COLUMN IF NOT EXISTS current_plan_id UUID NULL,
    ADD COLUMN IF NOT EXISTS current_plan_status TEXT NOT NULL DEFAULT 'none',
    ADD COLUMN IF NOT EXISTS current_plan_request_id UUID NULL,
    ADD COLUMN IF NOT EXISTS requested_plan_id UUID NULL,
    ADD COLUMN IF NOT EXISTS plan_selection_completed BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS plan_started_at TIMESTAMPTZ NULL,
    ADD COLUMN IF NOT EXISTS plan_expires_at TIMESTAMPTZ NULL,
    ADD COLUMN IF NOT EXISTS plan_payment_method TEXT NULL,
    ADD COLUMN IF NOT EXISTS plan_payment_first_name TEXT NULL,
    ADD COLUMN IF NOT EXISTS plan_payment_last_name TEXT NULL,
    ADD COLUMN IF NOT EXISTS plan_payment_reference TEXT NULL,
    ADD COLUMN IF NOT EXISTS plan_payment_proof_url TEXT NULL,
    ADD COLUMN IF NOT EXISTS plan_reviewed_at TIMESTAMPTZ NULL,
    ADD COLUMN IF NOT EXISTS plan_updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE TABLE IF NOT EXISTS public.seller_plan_requests (
    id UUID NOT NULL DEFAULT uuid_generate_v4(),
    seller_id UUID NOT NULL,
    plan_id UUID NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending_review',
    payment_method TEXT NULL,
    payment_first_name TEXT NULL,
    payment_last_name TEXT NULL,
    payment_reference TEXT NULL,
    payment_proof_url TEXT NULL,
    reviewed_by UUID NULL,
    reviewed_at TIMESTAMPTZ NULL,
    rejection_reason TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT seller_plan_requests_pkey PRIMARY KEY (id),
    CONSTRAINT seller_plan_requests_seller_id_fkey
        FOREIGN KEY (seller_id) REFERENCES public.sellers (id) ON DELETE CASCADE,
    CONSTRAINT seller_plan_requests_plan_id_fkey
        FOREIGN KEY (plan_id) REFERENCES public.seller_plans (id) ON DELETE RESTRICT,
    CONSTRAINT seller_plan_requests_reviewed_by_fkey
        FOREIGN KEY (reviewed_by) REFERENCES public.users (id) ON DELETE SET NULL,
    CONSTRAINT seller_plan_requests_status_check
        CHECK (status IN ('pending_review', 'approved', 'rejected', 'cancelled', 'draft'))
) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_seller_plan_requests_seller
    ON public.seller_plan_requests USING btree (seller_id, status) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_seller_plan_requests_plan
    ON public.seller_plan_requests USING btree (plan_id, status) TABLESPACE pg_default;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'sellers_current_plan_id_fkey'
    )
    AND to_regclass('public.seller_plans') IS NOT NULL THEN
        EXECUTE '
            ALTER TABLE public.sellers
                ADD CONSTRAINT sellers_current_plan_id_fkey
                FOREIGN KEY (current_plan_id) REFERENCES public.seller_plans (id) ON DELETE SET NULL
        ';
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'sellers_current_plan_request_id_fkey'
    )
    AND to_regclass('public.seller_plan_requests') IS NOT NULL THEN
        EXECUTE '
            ALTER TABLE public.sellers
                ADD CONSTRAINT sellers_current_plan_request_id_fkey
                FOREIGN KEY (current_plan_request_id) REFERENCES public.seller_plan_requests (id) ON DELETE SET NULL
        ';
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'sellers_requested_plan_id_fkey'
    )
    AND to_regclass('public.seller_plans') IS NOT NULL THEN
        EXECUTE '
            ALTER TABLE public.sellers
                ADD CONSTRAINT sellers_requested_plan_id_fkey
                FOREIGN KEY (requested_plan_id) REFERENCES public.seller_plans (id) ON DELETE SET NULL
        ';
    END IF;
END;
$$;

DROP TRIGGER IF EXISTS update_seller_plan_requests_updated_at ON public.seller_plan_requests;
CREATE TRIGGER update_seller_plan_requests_updated_at
    BEFORE UPDATE ON public.seller_plan_requests
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.compute_seller_plan_expires_at(p_billing_interval TEXT)
RETURNS TIMESTAMPTZ
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
    CASE LOWER(COALESCE(TRIM(p_billing_interval), ''))
        WHEN 'monthly' THEN
            RETURN NOW() + INTERVAL '30 days';
        WHEN 'yearly' THEN
            RETURN NOW() + INTERVAL '365 days';
        ELSE
            RETURN NULL;
    END CASE;
END;
$$;

CREATE OR REPLACE FUNCTION public.ensure_default_seller_plan()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_free_plan_id UUID;
BEGIN
    SELECT sp.id
    INTO v_free_plan_id
    FROM public.seller_plans sp
    WHERE sp.slug = 'free'
      AND sp.is_active = TRUE
    LIMIT 1;

    IF NEW.status = 'approved' AND NEW.current_plan_id IS NULL THEN
        NEW.current_plan_id := v_free_plan_id;
        NEW.current_plan_status := 'active';
        NEW.plan_started_at := COALESCE(NEW.plan_started_at, NOW());
        NEW.plan_updated_at := NOW();
    END IF;

    IF NEW.current_plan_status IS NULL OR NEW.current_plan_status = '' THEN
        NEW.current_plan_status := 'none';
    END IF;

    NEW.plan_updated_at := NOW();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS ensure_default_seller_plan_trigger ON public.sellers;
CREATE TRIGGER ensure_default_seller_plan_trigger
    BEFORE INSERT OR UPDATE OF status, current_plan_id, current_plan_status ON public.sellers
    FOR EACH ROW
    EXECUTE FUNCTION public.ensure_default_seller_plan();

CREATE OR REPLACE FUNCTION public.validate_seller_plan_request()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_plan RECORD;
    v_existing_pending BOOLEAN;
    v_requested_status TEXT;
BEGIN
    SELECT *
    INTO v_plan
    FROM public.seller_plans sp
    WHERE sp.id = NEW.plan_id
      AND sp.is_active = TRUE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Plan not found or inactive';
    END IF;

    SELECT EXISTS (
        SELECT 1
        FROM public.seller_plan_requests spr
        WHERE spr.seller_id = NEW.seller_id
          AND spr.status IN ('pending_review', 'draft')
          AND (NEW.id IS NULL OR spr.id <> NEW.id)
    ) INTO v_existing_pending;

    IF v_existing_pending AND NEW.status IN ('pending_review', 'draft') THEN
        RAISE EXCEPTION 'A plan request is already pending for this seller';
    END IF;

    v_requested_status := LOWER(COALESCE(TRIM(NEW.status), ''));

    IF COALESCE(v_plan.price, 0) <= 0 THEN
        NEW.status := 'approved';
        NEW.payment_method := NULL;
        NEW.payment_first_name := NULL;
        NEW.payment_last_name := NULL;
        NEW.payment_reference := NULL;
        NEW.payment_proof_url := NULL;
    ELSE
        IF TG_OP = 'INSERT' THEN
            NEW.status := CASE
                WHEN v_requested_status = 'draft' THEN 'draft'
                ELSE 'pending_review'
            END;
        ELSE
            NEW.status := CASE
                WHEN v_requested_status IN ('approved', 'rejected', 'cancelled', 'draft', 'pending_review') THEN
                    v_requested_status
                ELSE
                    COALESCE(NULLIF(OLD.status, ''), 'pending_review')
            END;
        END IF;

        IF NEW.status IN ('pending_review', 'approved') THEN
            IF LOWER(COALESCE(TRIM(NEW.payment_method), '')) NOT IN ('moncash_manual', 'natcash_manual') THEN
                RAISE EXCEPTION 'Paid plans require MonCash manual or NatCash manual';
            END IF;

            IF COALESCE(TRIM(NEW.payment_first_name), '') = ''
                OR COALESCE(TRIM(NEW.payment_last_name), '') = ''
                OR COALESCE(TRIM(NEW.payment_reference), '') = ''
                OR COALESCE(TRIM(NEW.payment_proof_url), '') = '' THEN
                RAISE EXCEPTION 'Payment identity and proof are required for paid plans';
            END IF;
        END IF;
    END IF;

    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_seller_plan_request_trigger ON public.seller_plan_requests;
CREATE TRIGGER validate_seller_plan_request_trigger
    BEFORE INSERT OR UPDATE ON public.seller_plan_requests
    FOR EACH ROW
    EXECUTE FUNCTION public.validate_seller_plan_request();

CREATE OR REPLACE FUNCTION public.sync_seller_plan_request_state()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_plan RECORD;
    v_free_plan_id UUID;
BEGIN
    SELECT sp.*
    INTO v_plan
    FROM public.seller_plans sp
    WHERE sp.id = NEW.plan_id;

    SELECT sp.id
    INTO v_free_plan_id
    FROM public.seller_plans sp
    WHERE sp.slug = 'free'
      AND sp.is_active = TRUE
    LIMIT 1;

    IF NEW.status = 'approved' THEN
        UPDATE public.sellers s
        SET current_plan_id = NEW.plan_id,
            current_plan_status = 'active',
            current_plan_request_id = NULL,
            requested_plan_id = NULL,
            plan_selection_completed = TRUE,
            plan_started_at = NOW(),
            plan_expires_at = public.compute_seller_plan_expires_at(v_plan.billing_interval),
            plan_payment_method = NEW.payment_method,
            plan_payment_first_name = NEW.payment_first_name,
            plan_payment_last_name = NEW.payment_last_name,
            plan_payment_reference = NEW.payment_reference,
            plan_payment_proof_url = NEW.payment_proof_url,
            plan_reviewed_at = NOW(),
            plan_updated_at = NOW()
        WHERE s.id = NEW.seller_id;
    ELSIF NEW.status = 'pending_review' THEN
        UPDATE public.sellers s
        SET current_plan_id = COALESCE(s.current_plan_id, v_free_plan_id),
            current_plan_status = 'active',
            current_plan_request_id = NEW.id,
            requested_plan_id = NEW.plan_id,
            plan_selection_completed = TRUE,
            plan_started_at = COALESCE(s.plan_started_at, NOW()),
            plan_payment_method = NEW.payment_method,
            plan_payment_first_name = NEW.payment_first_name,
            plan_payment_last_name = NEW.payment_last_name,
            plan_payment_reference = NEW.payment_reference,
            plan_payment_proof_url = NEW.payment_proof_url,
            plan_reviewed_at = NULL,
            plan_updated_at = NOW()
        WHERE s.id = NEW.seller_id;
    ELSIF NEW.status IN ('rejected', 'cancelled') THEN
        UPDATE public.sellers s
        SET current_plan_id = COALESCE(s.current_plan_id, v_free_plan_id),
            current_plan_status = CASE
                WHEN s.current_plan_id IS NULL THEN 'active'
                ELSE s.current_plan_status
            END,
            current_plan_request_id = NULL,
            requested_plan_id = NULL,
            plan_selection_completed = TRUE,
            plan_started_at = COALESCE(s.plan_started_at, NOW()),
            plan_payment_method = NULL,
            plan_payment_first_name = NULL,
            plan_payment_last_name = NULL,
            plan_payment_reference = NULL,
            plan_payment_proof_url = NULL,
            plan_reviewed_at = NOW(),
            plan_updated_at = NOW()
        WHERE s.id = NEW.seller_id;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sync_seller_plan_request_state_trigger ON public.seller_plan_requests;
CREATE TRIGGER sync_seller_plan_request_state_trigger
    AFTER INSERT OR UPDATE OF status ON public.seller_plan_requests
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_seller_plan_request_state();

ALTER TABLE public.seller_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seller_plan_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read active plans" ON public.seller_plans;
CREATE POLICY "Anyone can read active plans"
    ON public.seller_plans
    FOR SELECT
    USING (is_active = TRUE OR public.is_current_user_admin());

DROP POLICY IF EXISTS "Admins can manage plans" ON public.seller_plans;
CREATE POLICY "Admins can manage plans"
    ON public.seller_plans
    FOR ALL
    USING (public.is_current_user_admin())
    WITH CHECK (public.is_current_user_admin());

DROP POLICY IF EXISTS "Sellers can read own plan requests" ON public.seller_plan_requests;
CREATE POLICY "Sellers can read own plan requests"
    ON public.seller_plan_requests
    FOR SELECT
    USING (
        seller_id = public.current_seller_id()
        OR public.is_current_user_admin()
    );

DROP POLICY IF EXISTS "Sellers can insert own plan requests" ON public.seller_plan_requests;
CREATE POLICY "Sellers can insert own plan requests"
    ON public.seller_plan_requests
    FOR INSERT
    WITH CHECK (
        seller_id = public.current_seller_id()
        OR public.is_current_user_admin()
    );

DROP POLICY IF EXISTS "Admins can update plan requests" ON public.seller_plan_requests;
CREATE POLICY "Admins can update plan requests"
    ON public.seller_plan_requests
    FOR UPDATE
    USING (public.is_current_user_admin())
    WITH CHECK (public.is_current_user_admin());

DROP POLICY IF EXISTS "Admins can delete plan requests" ON public.seller_plan_requests;
CREATE POLICY "Admins can delete plan requests"
    ON public.seller_plan_requests
    FOR DELETE
    USING (public.is_current_user_admin());

UPDATE public.sellers s
SET current_plan_id = sp.id,
    current_plan_status = 'active',
    plan_started_at = COALESCE(s.plan_started_at, NOW()),
    plan_updated_at = NOW()
FROM public.seller_plans sp
WHERE sp.slug = 'free'
  AND sp.is_active = TRUE
  AND s.status = 'approved'
  AND s.current_plan_id IS NULL;
