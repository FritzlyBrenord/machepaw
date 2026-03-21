-- =====================================================
-- 05-SECURE-MARKETPLACE-ORDER-WORKFLOW.SQL
-- Secure order creation, seller item updates, order sync
-- =====================================================

CREATE OR REPLACE FUNCTION public.calculate_effective_product_price(
    p_price NUMERIC,
    p_discount INTEGER
)
RETURNS NUMERIC
LANGUAGE sql
IMMUTABLE
AS $$
    SELECT CASE
        WHEN COALESCE(p_discount, 0) > 0 THEN ROUND(p_price * ((100 - p_discount)::NUMERIC / 100), 2)
        ELSE p_price
    END
$$;

CREATE OR REPLACE FUNCTION public.set_order_item_seller_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_seller_id UUID;
BEGIN
    IF NEW.product_id IS NULL THEN
        RETURN NEW;
    END IF;

    SELECT p.seller_id
    INTO v_seller_id
    FROM public.products p
    WHERE p.id = NEW.product_id;

    NEW.seller_id := v_seller_id;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_order_item_seller_id_trigger ON public.order_items;
CREATE TRIGGER set_order_item_seller_id_trigger
    BEFORE INSERT OR UPDATE ON public.order_items
    FOR EACH ROW
    EXECUTE FUNCTION public.set_order_item_seller_id();

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
    v_has_shipped BOOLEAN;
    v_all_delivered BOOLEAN;
    v_all_cancelled BOOLEAN;
    v_next_status TEXT;
BEGIN
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

    INSERT INTO public.orders (
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

GRANT EXECUTE ON FUNCTION public.create_marketplace_order(JSONB, JSONB, NUMERIC, TEXT, TEXT, TEXT, TEXT)
    TO authenticated;

CREATE OR REPLACE FUNCTION public.seller_update_order_item_status(
    p_order_item_id UUID,
    p_status TEXT,
    p_tracking_number TEXT DEFAULT NULL
)
RETURNS public.order_items
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_current_seller_id UUID;
    v_order_item public.order_items%ROWTYPE;
BEGIN
    v_current_seller_id := public.current_seller_id();

    IF v_current_seller_id IS NULL THEN
        RAISE EXCEPTION 'Seller access required';
    END IF;

    IF p_status NOT IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled') THEN
        RAISE EXCEPTION 'Invalid seller status';
    END IF;

    UPDATE public.order_items
    SET status = p_status,
        updated_at = NOW()
    WHERE id = p_order_item_id
      AND seller_id = v_current_seller_id
    RETURNING *
    INTO v_order_item;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Order item not found or not owned by current seller';
    END IF;

    IF p_tracking_number IS NOT NULL AND LENGTH(TRIM(p_tracking_number)) > 0 THEN
        UPDATE public.orders
        SET tracking_number = p_tracking_number,
            updated_at = NOW()
        WHERE id = v_order_item.order_id;
    END IF;

    PERFORM public.sync_order_status_from_items(v_order_item.order_id);

    RETURN v_order_item;
END;
$$;

GRANT EXECUTE ON FUNCTION public.seller_update_order_item_status(UUID, TEXT, TEXT)
    TO authenticated;
