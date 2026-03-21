-- =====================================================
-- 07-FIX-SECURE-ORDER-NUMBER.SQL
-- Fix create_marketplace_order so it generates a real order number
-- =====================================================

CREATE OR REPLACE FUNCTION public.generate_marketplace_order_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_candidate TEXT;
BEGIN
    LOOP
        v_candidate := CONCAT(
            'LX-',
            TO_CHAR(NOW(), 'YYYYMMDD'),
            '-',
            UPPER(SUBSTRING(REPLACE(uuid_generate_v4()::TEXT, '-', '') FROM 1 FOR 8))
        );

        EXIT WHEN NOT EXISTS (
            SELECT 1
            FROM public.orders
            WHERE order_number = v_candidate
        );
    END LOOP;

    RETURN v_candidate;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_marketplace_order(
    p_shipping_address JSONB,
    p_items JSONB,
    p_shipping_amount NUMERIC DEFAULT 0,
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
    v_order_number TEXT;
    v_subtotal NUMERIC := 0;
    v_shipping NUMERIC := GREATEST(COALESCE(p_shipping_amount, 0), 0);
    v_currency TEXT := NULL;
    v_item RECORD;
    v_product RECORD;
    v_effective_price NUMERIC;
BEGIN
    v_profile_id := public.current_profile_id();

    IF v_profile_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required';
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

    v_order_number := public.generate_marketplace_order_number();

    INSERT INTO public.orders (
        order_number,
        user_id,
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
        notes
    )
    VALUES (
        v_order_number,
        v_profile_id,
        'pending',
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

GRANT EXECUTE ON FUNCTION public.generate_marketplace_order_number()
    TO authenticated;

GRANT EXECUTE ON FUNCTION public.create_marketplace_order(JSONB, JSONB, NUMERIC, TEXT, TEXT, TEXT, TEXT)
    TO authenticated;
