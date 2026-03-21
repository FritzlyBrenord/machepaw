-- =====================================================
-- 19-BOUTIQUE-CLIENT-AUTH-AND-SESSION.SQL
-- Custom boutique client authentication and order linkage
-- =====================================================

ALTER TABLE public.boutique_customers
    ADD COLUMN IF NOT EXISTS password_hash TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_boutique_customers_seller_email
    ON public.boutique_customers USING btree (seller_id, LOWER(email)) TABLESPACE pg_default;

ALTER TABLE public.orders
    ADD COLUMN IF NOT EXISTS boutique_customer_id UUID NULL,
    ADD COLUMN IF NOT EXISTS storefront_seller_id UUID NULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'orders_boutique_customer_id_fkey'
    ) THEN
        ALTER TABLE public.orders
            ADD CONSTRAINT orders_boutique_customer_id_fkey
            FOREIGN KEY (boutique_customer_id) REFERENCES public.boutique_customers (id) ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'orders_storefront_seller_id_fkey'
    ) THEN
        ALTER TABLE public.orders
            ADD CONSTRAINT orders_storefront_seller_id_fkey
            FOREIGN KEY (storefront_seller_id) REFERENCES public.sellers (id) ON DELETE SET NULL;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_orders_boutique_customer
    ON public.orders USING btree (boutique_customer_id) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_orders_storefront_seller
    ON public.orders USING btree (storefront_seller_id) TABLESPACE pg_default;

CREATE TABLE IF NOT EXISTS public.boutique_customer_sessions (
    id UUID NOT NULL DEFAULT extensions.uuid_generate_v4(),
    boutique_customer_id UUID NOT NULL,
    seller_id UUID NOT NULL,
    session_token_hash TEXT NOT NULL,
    user_agent TEXT NULL,
    ip_address INET NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    revoked_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT boutique_customer_sessions_pkey PRIMARY KEY (id),
    CONSTRAINT boutique_customer_sessions_customer_id_fkey
        FOREIGN KEY (boutique_customer_id) REFERENCES public.boutique_customers (id) ON DELETE CASCADE,
    CONSTRAINT boutique_customer_sessions_seller_id_fkey
        FOREIGN KEY (seller_id) REFERENCES public.sellers (id) ON DELETE CASCADE,
    CONSTRAINT boutique_customer_sessions_token_hash_key UNIQUE (session_token_hash)
) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_boutique_customer_sessions_customer
    ON public.boutique_customer_sessions USING btree (boutique_customer_id) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_boutique_customer_sessions_seller
    ON public.boutique_customer_sessions USING btree (seller_id) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_boutique_customer_sessions_expires
    ON public.boutique_customer_sessions USING btree (expires_at) TABLESPACE pg_default;

DROP FUNCTION IF EXISTS public.create_boutique_order(UUID, UUID, UUID, JSONB, JSONB, NUMERIC, NUMERIC, TEXT, TEXT, TEXT, TEXT);

CREATE OR REPLACE FUNCTION public.create_boutique_order(
    p_user_id UUID,
    p_seller_id UUID,
    p_boutique_customer_id UUID,
    p_shipping_address JSONB,
    p_items JSONB,
    p_shipping_amount NUMERIC DEFAULT 0,
    p_tax_amount NUMERIC DEFAULT 0,
    p_payment_method TEXT DEFAULT NULL,
    p_payment_id TEXT DEFAULT NULL,
    p_payment_proof_path TEXT DEFAULT NULL,
    p_notes TEXT DEFAULT NULL
)
RETURNS TABLE (
    order_id UUID,
    order_number TEXT,
    subtotal NUMERIC,
    shipping NUMERIC,
    tax NUMERIC,
    total NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_order_id UUID;
    v_order_number TEXT;
    v_subtotal NUMERIC := 0;
    v_shipping NUMERIC := GREATEST(COALESCE(p_shipping_amount, 0), 0);
    v_tax NUMERIC := GREATEST(COALESCE(p_tax_amount, 0), 0);
    v_currency TEXT := NULL;
    v_item RECORD;
    v_product RECORD;
    v_effective_price NUMERIC;
    v_seller_user_id UUID;
BEGIN
    IF p_user_id IS NULL THEN
        RAISE EXCEPTION 'Boutique customer user is required';
    END IF;

    IF p_seller_id IS NULL OR p_boutique_customer_id IS NULL THEN
        RAISE EXCEPTION 'Boutique seller and customer are required';
    END IF;

    IF p_shipping_address IS NULL THEN
        RAISE EXCEPTION 'Shipping address is required';
    END IF;

    IF p_items IS NULL OR jsonb_typeof(p_items) <> 'array' OR jsonb_array_length(p_items) = 0 THEN
        RAISE EXCEPTION 'At least one product is required';
    END IF;

    SELECT s.user_id
    INTO v_seller_user_id
    FROM public.sellers s
    WHERE s.id = p_seller_id
      AND s.status = 'approved';

    IF v_seller_user_id IS NULL THEN
        RAISE EXCEPTION 'Seller boutique is not available';
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM public.boutique_customers bc
        WHERE bc.id = p_boutique_customer_id
          AND bc.seller_id = p_seller_id
          AND bc.user_id = p_user_id
          AND bc.status = 'active'
    ) THEN
        RAISE EXCEPTION 'Active boutique customer account required';
    END IF;

    FOR v_item IN
        SELECT *
        FROM jsonb_to_recordset(p_items) AS x(product_id UUID, quantity INTEGER)
    LOOP
        SELECT
            p.id,
            p.name,
            p.price,
            p.discount,
            p.status,
            p.stock,
            p.owner_type,
            p.owner_id,
            p.seller_id,
            p.min_processing_days,
            p.max_processing_days,
            COALESCE(p.currency_code, 'HTG') AS currency_code
        INTO v_product
        FROM public.products p
        WHERE p.id = v_item.product_id;

        IF NOT FOUND OR v_product.status <> 'active' THEN
            RAISE EXCEPTION 'Product % is not available', v_item.product_id;
        END IF;

        IF NOT (
            v_product.seller_id = p_seller_id
            OR (
                v_product.owner_type = 'seller'
                AND v_product.owner_id = v_seller_user_id
            )
        ) THEN
            RAISE EXCEPTION 'Product % does not belong to this boutique', v_item.product_id;
        END IF;

        IF COALESCE(v_product.stock, 0) < v_item.quantity THEN
            RAISE EXCEPTION 'Insufficient stock for product %', v_item.product_id;
        END IF;

        v_effective_price := public.calculate_effective_product_price(v_product.price, v_product.discount);
        v_subtotal := v_subtotal + (v_effective_price * v_item.quantity);

        IF v_currency IS NULL THEN
            v_currency := v_product.currency_code;
        ELSIF v_currency <> v_product.currency_code THEN
            RAISE EXCEPTION 'Mixed currency orders are not supported';
        END IF;
    END LOOP;

    v_order_number := public.generate_marketplace_order_number();

    DECLARE
        v_max_processing_days INTEGER := 3;
    BEGIN
        SELECT MAX(COALESCE(p.max_processing_days, 3))
        INTO v_max_processing_days
        FROM public.products p
        JOIN jsonb_to_recordset(p_items) AS x(product_id UUID) ON p.id = x.product_id;

        INSERT INTO public.orders (
            order_number,
            user_id,
            boutique_customer_id,
            storefront_seller_id,
            status,
            subtotal,
            shipping,
            tax,
            discount,
            total,
            currency,
            shipping_address,
            payment_method,
            payment_id,
            payment_proof_url,
            notes,
            estimated_delivery
        )
        VALUES (
            v_order_number,
            p_user_id,
            p_boutique_customer_id,
            p_seller_id,
            'pending',
            ROUND(v_subtotal, 2),
            ROUND(v_shipping, 2),
            ROUND(v_tax, 2),
            0,
            ROUND(v_subtotal + v_shipping + v_tax, 2),
            COALESCE(v_currency, 'HTG'),
            p_shipping_address,
            p_payment_method,
            p_payment_id,
            p_payment_proof_path,
            p_notes,
            NOW() + (v_max_processing_days || ' days')::INTERVAL
        )
        RETURNING id
        INTO v_order_id;
    END;

    FOR v_item IN
        SELECT *
        FROM jsonb_to_recordset(p_items) AS x(product_id UUID, quantity INTEGER)
    LOOP
        SELECT
            p.id,
            p.name,
            p.sku,
            p.images,
            p.price,
            p.discount,
            p.seller_id,
            p.owner_type,
            p.owner_id,
            p.min_processing_days,
            p.max_processing_days
        INTO v_product
        FROM public.products p
        WHERE p.id = v_item.product_id
        FOR UPDATE;

        v_effective_price := public.calculate_effective_product_price(v_product.price, v_product.discount);

        INSERT INTO public.order_items (
            order_id,
            product_id,
            seller_id,
            name,
            sku,
            image,
            price,
            quantity,
            total,
            status,
            min_processing_days,
            max_processing_days
        )
        VALUES (
            v_order_id,
            v_product.id,
            p_seller_id,
            v_product.name,
            v_product.sku,
            COALESCE(v_product.images[1], NULL),
            v_effective_price,
            v_item.quantity,
            ROUND(v_effective_price * v_item.quantity, 2),
            'pending',
            COALESCE(v_product.min_processing_days, 1),
            COALESCE(v_product.max_processing_days, 3)
        );

        UPDATE public.products
        SET stock = stock - v_item.quantity,
            sales = COALESCE(sales, 0) + v_item.quantity,
            status = CASE WHEN stock - v_item.quantity <= 0 THEN 'out_of_stock' ELSE status END,
            updated_at = NOW()
        WHERE id = v_product.id;
    END LOOP;

    order_id := v_order_id;
    order_number := v_order_number;
    subtotal := ROUND(v_subtotal, 2);
    shipping := ROUND(v_shipping, 2);
    tax := ROUND(v_tax, 2);
    total := ROUND(v_subtotal + v_shipping + v_tax, 2);

    RETURN NEXT;
END;
$$;

