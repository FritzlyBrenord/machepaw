-- =====================================================
-- 25-BOUTIQUE-FULFILLMENT-AVAILABILITY.SQL
-- Ensure boutique orders respect seller delivery and pickup configuration
-- =====================================================

DROP FUNCTION IF EXISTS public.create_boutique_order(
    UUID,
    UUID,
    UUID,
    JSONB,
    JSONB,
    NUMERIC,
    TEXT,
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
    v_seller_shipping_settings JSONB := '{}'::JSONB;
    v_seller_pickup_address JSONB := '{}'::JSONB;
    v_delivery_enabled BOOLEAN := FALSE;
    v_pickup_enabled BOOLEAN := FALSE;
    v_fulfillment_method TEXT := LOWER(COALESCE(TRIM(p_fulfillment_method), 'delivery'));
    v_payment_method TEXT := LOWER(COALESCE(TRIM(p_payment_method), ''));
    v_payment_method_row RECORD;
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

    IF v_fulfillment_method = 'pickup' AND v_payment_method = '' THEN
        v_payment_method := 'store_pickup';
    END IF;

    IF p_shipping_address IS NULL THEN
        RAISE EXCEPTION 'Shipping address is required';
    END IF;

    IF p_items IS NULL OR jsonb_typeof(p_items) <> 'array' OR jsonb_array_length(p_items) = 0 THEN
        RAISE EXCEPTION 'At least one product is required';
    END IF;

    SELECT
        s.user_id,
        COALESCE(s.shipping_settings, '{}'::JSONB),
        COALESCE(s.pickup_address, '{}'::JSONB)
    INTO
        v_seller_user_id,
        v_seller_shipping_settings,
        v_seller_pickup_address
    FROM public.sellers s
    WHERE s.id = p_seller_id
      AND s.status = 'approved';

    IF v_seller_user_id IS NULL THEN
        RAISE EXCEPTION 'Seller boutique is not available';
    END IF;

    v_delivery_enabled :=
        (
            COALESCE((v_seller_shipping_settings->>'allowDelivery')::BOOLEAN, FALSE)
            OR v_seller_shipping_settings->>'allowDelivery' IS NULL
        )
        AND COALESCE(NULLIF(TRIM(COALESCE(v_seller_shipping_settings->>'locationName', '')), ''), '') <> ''
        AND v_seller_shipping_settings ? 'basePrice'
        AND v_seller_shipping_settings ? 'pricePerKm'
        AND COALESCE(NULLIF(TRIM(COALESCE(v_seller_shipping_settings->>'latitude', '')), ''), '') <> ''
        AND COALESCE(NULLIF(TRIM(COALESCE(v_seller_shipping_settings->>'longitude', '')), ''), '') <> '';

    v_pickup_enabled :=
        (
            COALESCE((v_seller_shipping_settings->>'allowPickup')::BOOLEAN, FALSE)
            OR v_seller_shipping_settings->>'allowPickup' IS NULL
        )
        AND COALESCE(NULLIF(TRIM(COALESCE(v_seller_pickup_address->>'address', '')), ''), '') <> '';

    IF v_fulfillment_method = 'delivery' AND NOT v_delivery_enabled THEN
        RAISE EXCEPTION 'Delivery is not configured for this boutique';
    END IF;

    IF v_fulfillment_method = 'pickup' AND NOT v_pickup_enabled THEN
        RAISE EXCEPTION 'Pickup is not configured for this boutique';
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

    IF v_payment_method = '' THEN
        RAISE EXCEPTION 'A payment method is required';
    END IF;

    SELECT
        spm.method_code,
        spm.is_active,
        spm.merchant_first_name,
        spm.merchant_last_name,
        spm.merchant_agent_code
    INTO v_payment_method_row
    FROM public.seller_payment_methods spm
    WHERE spm.seller_id = p_seller_id
      AND spm.method_code = v_payment_method
      AND spm.is_active = TRUE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Payment method % is not active for this boutique', v_payment_method;
    END IF;

    IF NOT public.can_seller_payment_method_be_used_for_fulfillment(v_payment_method, v_fulfillment_method) THEN
        RAISE EXCEPTION 'Payment method % is not compatible with % fulfillment', v_payment_method, v_fulfillment_method;
    END IF;

    IF v_payment_method IN ('moncash_manual', 'natcash_manual') THEN
        IF COALESCE(TRIM(p_payment_id), '') = '' OR COALESCE(TRIM(p_payment_proof_path), '') = '' THEN
            RAISE EXCEPTION 'Payment reference and proof are required';
        END IF;
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

    DECLARE
        v_max_processing_days INTEGER := 3;
    BEGIN
        SELECT MAX(COALESCE(p.max_processing_days, 3))
        INTO v_max_processing_days
        FROM public.products p
        JOIN jsonb_to_recordset(p_items) AS x(product_id UUID) ON p.id = x.product_id;

        INSERT INTO public.orders AS o (
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
            v_payment_method,
            p_payment_id,
            p_payment_proof_path,
            p_notes,
            NOW() + (v_max_processing_days || ' days')::INTERVAL
        )
        RETURNING o.id
        INTO v_order_id;

        SELECT o.order_number
        INTO v_order_number
        FROM public.orders o
        WHERE o.id = v_order_id;
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
