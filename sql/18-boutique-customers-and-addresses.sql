-- =====================================================
-- 18-BOUTIQUE-CUSTOMERS-AND-ADDRESSES.SQL
-- Isolate customer enrollment and delivery addresses per boutique
-- =====================================================

CREATE TABLE IF NOT EXISTS public.boutique_customers (
    id UUID NOT NULL DEFAULT extensions.uuid_generate_v4(),
    seller_id UUID NOT NULL,
    user_id UUID NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    email TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL DEFAULT '',
    phone TEXT NULL,
    last_login_at TIMESTAMPTZ NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT boutique_customers_pkey PRIMARY KEY (id),
    CONSTRAINT boutique_customers_seller_id_fkey
        FOREIGN KEY (seller_id) REFERENCES public.sellers (id) ON DELETE CASCADE,
    CONSTRAINT boutique_customers_user_id_fkey
        FOREIGN KEY (user_id) REFERENCES public.users (id) ON DELETE CASCADE,
    CONSTRAINT boutique_customers_status_check
        CHECK (status = ANY (ARRAY['active'::TEXT, 'blocked'::TEXT])),
    CONSTRAINT boutique_customers_seller_user_key UNIQUE (seller_id, user_id)
) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_boutique_customers_seller
    ON public.boutique_customers USING btree (seller_id) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_boutique_customers_user
    ON public.boutique_customers USING btree (user_id) TABLESPACE pg_default;

CREATE TABLE IF NOT EXISTS public.boutique_customer_addresses (
    id UUID NOT NULL DEFAULT extensions.uuid_generate_v4(),
    boutique_customer_id UUID NOT NULL,
    seller_id UUID NOT NULL,
    user_id UUID NOT NULL,
    label TEXT NULL DEFAULT 'Domicile'::TEXT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    address TEXT NOT NULL,
    apartment TEXT NULL,
    department TEXT NULL,
    arrondissement TEXT NULL,
    commune TEXT NULL,
    communal_section TEXT NULL,
    city TEXT NOT NULL,
    postal_code TEXT NOT NULL DEFAULT ''::TEXT,
    country TEXT NOT NULL DEFAULT 'Haiti'::TEXT,
    phone TEXT NOT NULL,
    latitude NUMERIC(10, 8) NULL,
    longitude NUMERIC(11, 8) NULL,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT boutique_customer_addresses_pkey PRIMARY KEY (id),
    CONSTRAINT boutique_customer_addresses_customer_id_fkey
        FOREIGN KEY (boutique_customer_id) REFERENCES public.boutique_customers (id) ON DELETE CASCADE,
    CONSTRAINT boutique_customer_addresses_seller_id_fkey
        FOREIGN KEY (seller_id) REFERENCES public.sellers (id) ON DELETE CASCADE,
    CONSTRAINT boutique_customer_addresses_user_id_fkey
        FOREIGN KEY (user_id) REFERENCES public.users (id) ON DELETE CASCADE
) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_boutique_customer_addresses_customer
    ON public.boutique_customer_addresses USING btree (boutique_customer_id) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_boutique_customer_addresses_seller
    ON public.boutique_customer_addresses USING btree (seller_id) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_boutique_customer_addresses_user
    ON public.boutique_customer_addresses USING btree (user_id) TABLESPACE pg_default;

CREATE OR REPLACE FUNCTION public.is_current_user_boutique_customer(p_seller_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM public.boutique_customers bc
        WHERE bc.seller_id = p_seller_id
          AND bc.user_id = public.current_profile_id()
          AND bc.status = 'active'
    );
END;
$$;

DROP TRIGGER IF EXISTS update_boutique_customers_updated_at ON public.boutique_customers;
CREATE TRIGGER update_boutique_customers_updated_at
    BEFORE UPDATE ON public.boutique_customers
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_boutique_customer_addresses_updated_at ON public.boutique_customer_addresses;
CREATE TRIGGER update_boutique_customer_addresses_updated_at
    BEFORE UPDATE ON public.boutique_customer_addresses
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.boutique_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.boutique_customer_addresses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own boutique customers" ON public.boutique_customers;
CREATE POLICY "Users can read own boutique customers"
    ON public.boutique_customers
    FOR SELECT
    USING (
        user_id = public.current_profile_id()
        OR seller_id = public.current_seller_id()
        OR public.is_current_user_admin()
    );

DROP POLICY IF EXISTS "Users can insert own boutique customers" ON public.boutique_customers;
CREATE POLICY "Users can insert own boutique customers"
    ON public.boutique_customers
    FOR INSERT
    WITH CHECK (
        user_id = public.current_profile_id()
        OR public.is_current_user_admin()
    );

DROP POLICY IF EXISTS "Users can update own boutique customers" ON public.boutique_customers;
CREATE POLICY "Users can update own boutique customers"
    ON public.boutique_customers
    FOR UPDATE
    USING (
        user_id = public.current_profile_id()
        OR seller_id = public.current_seller_id()
        OR public.is_current_user_admin()
    )
    WITH CHECK (
        user_id = public.current_profile_id()
        OR seller_id = public.current_seller_id()
        OR public.is_current_user_admin()
    );

DROP POLICY IF EXISTS "Admins can delete boutique customers" ON public.boutique_customers;
CREATE POLICY "Admins can delete boutique customers"
    ON public.boutique_customers
    FOR DELETE
    USING (public.is_current_user_admin());

DROP POLICY IF EXISTS "Users can read own boutique customer addresses" ON public.boutique_customer_addresses;
CREATE POLICY "Users can read own boutique customer addresses"
    ON public.boutique_customer_addresses
    FOR SELECT
    USING (
        user_id = public.current_profile_id()
        OR seller_id = public.current_seller_id()
        OR public.is_current_user_admin()
    );

DROP POLICY IF EXISTS "Users can insert own boutique customer addresses" ON public.boutique_customer_addresses;
CREATE POLICY "Users can insert own boutique customer addresses"
    ON public.boutique_customer_addresses
    FOR INSERT
    WITH CHECK (
        user_id = public.current_profile_id()
        AND EXISTS (
            SELECT 1
            FROM public.boutique_customers bc
            WHERE bc.id = boutique_customer_addresses.boutique_customer_id
              AND bc.user_id = public.current_profile_id()
              AND bc.user_id = boutique_customer_addresses.user_id
              AND bc.seller_id = boutique_customer_addresses.seller_id
        )
    );

DROP POLICY IF EXISTS "Users can update own boutique customer addresses" ON public.boutique_customer_addresses;
CREATE POLICY "Users can update own boutique customer addresses"
    ON public.boutique_customer_addresses
    FOR UPDATE
    USING (
        user_id = public.current_profile_id()
        OR public.is_current_user_admin()
    )
    WITH CHECK (
        user_id = public.current_profile_id()
        OR public.is_current_user_admin()
    );

DROP POLICY IF EXISTS "Users can delete own boutique customer addresses" ON public.boutique_customer_addresses;
CREATE POLICY "Users can delete own boutique customer addresses"
    ON public.boutique_customer_addresses
    FOR DELETE
    USING (
        user_id = public.current_profile_id()
        OR public.is_current_user_admin()
    );
