-- =====================================================
-- 20-ORDER-FULFILLMENT-AND-PICKUP-WORKFLOW.SQL
-- Seller-managed fulfillment workflow with pickup-ready state
-- =====================================================

ALTER TABLE public.orders
    ADD COLUMN IF NOT EXISTS fulfillment_method TEXT NOT NULL DEFAULT 'delivery';

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'orders_fulfillment_method_check'
    ) THEN
        ALTER TABLE public.orders
            ADD CONSTRAINT orders_fulfillment_method_check
            CHECK (fulfillment_method IN ('delivery', 'pickup'));
    END IF;
END $$;

ALTER TABLE public.orders
    DROP CONSTRAINT IF EXISTS orders_status_check;

ALTER TABLE public.orders
    ADD CONSTRAINT orders_status_check
    CHECK (
        status IN (
            'pending',
            'confirmed',
            'processing',
            'ready_for_pickup',
            'shipped',
            'delivered',
            'cancelled',
            'refunded'
        )
    );

ALTER TABLE public.order_items
    DROP CONSTRAINT IF EXISTS order_items_status_check;

ALTER TABLE public.order_items
    ADD CONSTRAINT order_items_status_check
    CHECK (
        status IN (
            'pending',
            'confirmed',
            'processing',
            'ready_for_pickup',
            'shipped',
            'delivered',
            'cancelled'
        )
    );

CREATE OR REPLACE FUNCTION public.sync_order_status_from_items(p_order_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_has_pending BOOLEAN;
    v_has_confirmed BOOLEAN;
    v_has_processing BOOLEAN;
    v_has_ready_for_pickup BOOLEAN;
    v_has_shipped BOOLEAN;
    v_all_delivered BOOLEAN;
    v_all_cancelled BOOLEAN;
    v_fulfillment_method TEXT := 'delivery';
    v_next_status TEXT;
BEGIN
    SELECT COALESCE(fulfillment_method, 'delivery')
    INTO v_fulfillment_method
    FROM public.orders
    WHERE id = p_order_id;

    SELECT EXISTS (
        SELECT 1 FROM public.order_items WHERE order_id = p_order_id AND status = 'pending'
    ) INTO v_has_pending;

    SELECT EXISTS (
        SELECT 1 FROM public.order_items WHERE order_id = p_order_id AND status = 'confirmed'
    ) INTO v_has_confirmed;

    SELECT EXISTS (
        SELECT 1 FROM public.order_items WHERE order_id = p_order_id AND status = 'processing'
    ) INTO v_has_processing;

    SELECT EXISTS (
        SELECT 1 FROM public.order_items WHERE order_id = p_order_id AND status = 'ready_for_pickup'
    ) INTO v_has_ready_for_pickup;

    SELECT EXISTS (
        SELECT 1 FROM public.order_items WHERE order_id = p_order_id AND status = 'shipped'
    ) INTO v_has_shipped;

    SELECT COALESCE(BOOL_AND(status = 'delivered'), FALSE)
    INTO v_all_delivered
    FROM public.order_items
    WHERE order_id = p_order_id;

    SELECT COALESCE(BOOL_AND(status = 'cancelled'), FALSE)
    INTO v_all_cancelled
    FROM public.order_items
    WHERE order_id = p_order_id;

    IF v_all_cancelled THEN
        v_next_status := 'cancelled';
    ELSIF v_all_delivered THEN
        v_next_status := 'delivered';
    ELSIF v_fulfillment_method = 'pickup' AND v_has_ready_for_pickup THEN
        v_next_status := 'ready_for_pickup';
    ELSIF v_has_shipped THEN
        v_next_status := 'shipped';
    ELSIF v_has_processing THEN
        v_next_status := 'processing';
    ELSIF v_has_confirmed THEN
        v_next_status := 'confirmed';
    ELSIF v_has_pending THEN
        v_next_status := 'pending';
    ELSE
        v_next_status := 'pending';
    END IF;

    UPDATE public.orders
    SET status = v_next_status,
        updated_at = NOW()
    WHERE id = p_order_id;
END;
$$;

DROP FUNCTION IF EXISTS public.create_marketplace_order(
    JSONB,
    JSONB,
    NUMERIC,
    TEXT,
    TEXT,
    TEXT,
    TEXT,
    TEXT
);

CREATE OR REPLACE FUNCTION public.create_marketplace_order(
    p_shipping_address JSONB,
    p_items JSONB,
    p_shipping_amount NUMERIC DEFAULT 0,
    p_fulfillment_method TEXT DEFAULT 'delivery',
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
    total NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_profile_id UUID;
    v_order_id UUID;
    v_subtotal NUMERIC := 0;
    v_shipping NUMERIC := GREATEST(COALESCE(p_shipping_amount, 0), 0);
    v_currency TEXT := NULL;
    v_item RECORD;
    v_product RECORD;
    v_effective_price NUMERIC;
    v_fulfillment_method TEXT := LOWER(COALESCE(p_fulfillment_method, 'delivery'));
BEGIN
    v_profile_id := public.current_profile_id();

    IF v_profile_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required';
    END IF;

    IF v_fulfillment_method NOT IN ('delivery', 'pickup') THEN
        RAISE EXCEPTION 'Invalid fulfillment method';
    END IF;

    IF p_shipping_address IS NULL THEN
        RAISE EXCEPTION 'Shipping address is required';
    END IF;

    IF p_items IS NULL OR jsonb_typeof(p_items) <> 'array' OR jsonb_array_length(p_items) = 0 THEN
        RAISE EXCEPTION 'At least one product is required';
    END IF;

    FOR v_item IN
        SELECT *
        FROM jsonb_to_recordset(p_items) AS x(product_id UUID, quantity INTEGER)
    LOOP
        IF v_item.product_id IS NULL OR COALESCE(v_item.quantity, 0) <= 0 THEN
            RAISE EXCEPTION 'Invalid order item payload';
        END IF;

        SELECT
            p.id,
            p.name,
            p.sku,
            p.images,
            p.price,
            p.discount,
            p.stock,
            p.status,
            p.seller_id,
            COALESCE(p.currency_code, 'HTG') AS currency_code
        INTO v_product
        FROM public.products p
        WHERE p.id = v_item.product_id;

        IF NOT FOUND OR v_product.status <> 'active' THEN
            RAISE EXCEPTION 'Product % is not available', v_item.product_id;
        END IF;

        IF COALESCE(v_product.stock, 0) < v_item.quantity THEN
            RAISE EXCEPTION 'Insufficient stock for product %', v_product.name;
        END IF;

        v_effective_price := public.calculate_effective_product_price(v_product.price, v_product.discount);
        v_subtotal := v_subtotal + (v_effective_price * v_item.quantity);

        IF v_currency IS NULL THEN
            v_currency := v_product.currency_code;
        ELSIF v_currency <> v_product.currency_code THEN
            RAISE EXCEPTION 'Mixed currency orders are not supported';
        END IF;
    END LOOP;

    INSERT INTO public.orders (
        user_id,
        status,
        fulfillment_method,
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
        notes
    )
    VALUES (
        v_profile_id,
        'pending',
        v_fulfillment_method,
        ROUND(v_subtotal, 2),
        ROUND(v_shipping, 2),
        0,
        0,
        ROUND(v_subtotal + v_shipping, 2),
        COALESCE(v_currency, 'HTG'),
        p_shipping_address,
        p_payment_method,
        p_payment_id,
        p_payment_proof_path,
        p_notes
    )
    RETURNING id, orders.order_number
    INTO v_order_id, order_number;

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
            p.stock,
            p.status,
            p.seller_id
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
            status
        )
        VALUES (
            v_order_id,
            v_product.id,
            v_product.seller_id,
            v_product.name,
            v_product.sku,
            COALESCE(v_product.images[1], NULL),
            v_effective_price,
            v_item.quantity,
            ROUND(v_effective_price * v_item.quantity, 2),
            'pending'
        );

        UPDATE public.products
        SET stock = stock - v_item.quantity,
            sales = COALESCE(sales, 0) + v_item.quantity,
            status = CASE
                WHEN stock - v_item.quantity <= 0 THEN 'out_of_stock'
                ELSE status
            END,
            updated_at = NOW()
        WHERE id = v_product.id;
    END LOOP;

    order_id := v_order_id;
    subtotal := ROUND(v_subtotal, 2);
    shipping := ROUND(v_shipping, 2);
    total := ROUND(v_subtotal + v_shipping, 2);

    RETURN NEXT;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_marketplace_order(JSONB, JSONB, NUMERIC, TEXT, TEXT, TEXT, TEXT, TEXT)
    TO authenticated;

DROP FUNCTION IF EXISTS public.create_boutique_order(
    UUID,
    UUID,
    UUID,
    JSONB,
    JSONB,
    NUMERIC,
    NUMERIC,
    TEXT,
    TEXT,
    TEXT,
    TEXT
);

CREATE OR REPLACE FUNCTION public.create_boutique_order(
    p_user_id UUID,
    p_seller_id UUID,
    p_boutique_customer_id UUID,
    p_shipping_address JSONB,
    p_items JSONB,
    p_shipping_amount NUMERIC DEFAULT 0,
    p_fulfillment_method TEXT DEFAULT 'delivery',
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
    v_fulfillment_method TEXT := LOWER(COALESCE(p_fulfillment_method, 'delivery'));
BEGIN
    IF p_user_id IS NULL THEN
        RAISE EXCEPTION 'Boutique customer user is required';
    END IF;

    IF p_seller_id IS NULL OR p_boutique_customer_id IS NULL THEN
        RAISE EXCEPTION 'Boutique seller and customer are required';
    END IF;

    IF v_fulfillment_method NOT IN ('delivery', 'pickup') THEN
        RAISE EXCEPTION 'Invalid fulfillment method';
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
            fulfillment_method,
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
            v_fulfillment_method,
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

DROP VIEW IF EXISTS public.order_details;
CREATE VIEW public.order_details
WITH (security_invoker = true) AS
SELECT
    o.id,
    o.order_number,
    o.user_id,
    o.status,
    o.fulfillment_method,
    o.subtotal,
    o.shipping,
    o.tax,
    o.discount,
    o.total,
    o.currency,
    o.shipping_address,
    o.tracking_number,
    o.estimated_delivery,
    o.delivered_at,
    o.payment_method,
    o.payment_status,
    o.notes,
    o.cancellation_reason,
    o.ip_address,
    o.user_agent,
    o.created_at,
    o.updated_at,
    o.payment_id,
    o.payment_proof_url,
    o.boutique_customer_id,
    o.storefront_seller_id,
    u.first_name || ' ' || u.last_name AS customer_name,
    u.email AS customer_email,
    COALESCE(
        json_agg(
            json_build_object(
                'id', oi.id,
                'product_id', oi.product_id,
                'seller_id', oi.seller_id,
                'owner_id', p.owner_id,
                'owner_name', p.owner_name,
                'name', oi.name,
                'sku', oi.sku,
                'image', oi.image,
                'price', oi.price,
                'quantity', oi.quantity,
                'total', oi.total,
                'status', oi.status,
                'min_processing_days', oi.min_processing_days,
                'max_processing_days', oi.max_processing_days
            )
        ) FILTER (WHERE oi.id IS NOT NULL),
        '[]'
    ) AS items
FROM public.orders o
JOIN public.users u
    ON u.id = o.user_id
LEFT JOIN public.order_items oi
    ON oi.order_id = o.id
LEFT JOIN public.products p
    ON p.id = oi.product_id
GROUP BY
    o.id,
    o.order_number,
    o.user_id,
    o.status,
    o.fulfillment_method,
    o.subtotal,
    o.shipping,
    o.tax,
    o.discount,
    o.total,
    o.currency,
    o.shipping_address,
    o.tracking_number,
    o.estimated_delivery,
    o.delivered_at,
    o.payment_method,
    o.payment_status,
    o.notes,
    o.cancellation_reason,
    o.ip_address,
    o.user_agent,
    o.created_at,
    o.updated_at,
    o.payment_id,
    o.payment_proof_url,
    o.boutique_customer_id,
    o.storefront_seller_id,
    u.first_name,
    u.last_name,
    u.email;

DROP VIEW IF EXISTS public.seller_order_items_view;
CREATE VIEW public.seller_order_items_view
WITH (security_invoker = true) AS
SELECT
    oi.id,
    oi.order_id,
    oi.product_id,
    oi.seller_id,
    oi.name AS product_name,
    oi.sku,
    oi.image,
    oi.price,
    oi.quantity,
    oi.total,
    oi.status AS item_status,
    o.order_number,
    o.status AS order_status,
    o.fulfillment_method,
    o.payment_status,
    o.payment_method,
    o.payment_id,
    o.payment_proof_url,
    o.shipping_address,
    o.tracking_number,
    o.created_at,
    o.updated_at,
    u.id AS customer_id,
    u.first_name AS customer_first_name,
    u.last_name AS customer_last_name,
    u.email AS customer_email,
    p.owner_id,
    p.owner_name
FROM public.order_items oi
JOIN public.orders o
    ON o.id = oi.order_id
LEFT JOIN public.users u
    ON u.id = o.user_id
LEFT JOIN public.products p
    ON p.id = oi.product_id;
