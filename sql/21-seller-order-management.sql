-- =====================================================
-- 21-SELLER-ORDER-MANAGEMENT.SQL
-- Seller-managed payment confirmation and delivery dates
-- =====================================================

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
    SELECT s.id
    INTO v_current_seller_id
    FROM public.sellers s
    WHERE s.id = public.current_seller_id()
      AND s.status = 'approved';

    IF v_current_seller_id IS NULL THEN
        RAISE EXCEPTION 'Seller access required';
    END IF;

    IF p_status NOT IN ('pending', 'confirmed', 'processing', 'ready_for_pickup', 'shipped', 'delivered', 'cancelled') THEN
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
        WHERE id = v_order_item.order_id
          AND storefront_seller_id = v_current_seller_id;
    END IF;

    PERFORM public.sync_order_status_from_items(v_order_item.order_id);

    RETURN v_order_item;
END;
$$;

GRANT EXECUTE ON FUNCTION public.seller_update_order_item_status(UUID, TEXT, TEXT)
    TO authenticated;

CREATE OR REPLACE FUNCTION public.seller_update_order_payment_status(
    p_order_id UUID,
    p_payment_status TEXT
)
RETURNS public.orders
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_current_seller_id UUID;
    v_order public.orders%ROWTYPE;
BEGIN
    SELECT s.id
    INTO v_current_seller_id
    FROM public.sellers s
    WHERE s.id = public.current_seller_id()
      AND s.status = 'approved';

    IF v_current_seller_id IS NULL THEN
        RAISE EXCEPTION 'Seller access required';
    END IF;

    IF p_payment_status NOT IN ('pending', 'paid', 'failed', 'refunded') THEN
        RAISE EXCEPTION 'Invalid payment status';
    END IF;

    UPDATE public.orders
    SET payment_status = p_payment_status,
        updated_at = NOW()
    WHERE id = p_order_id
      AND storefront_seller_id = v_current_seller_id
    RETURNING *
    INTO v_order;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Order not found or not owned by current seller';
    END IF;

    RETURN v_order;
END;
$$;

GRANT EXECUTE ON FUNCTION public.seller_update_order_payment_status(UUID, TEXT)
    TO authenticated;

CREATE OR REPLACE FUNCTION public.seller_update_order_estimated_delivery(
    p_order_id UUID,
    p_estimated_delivery TIMESTAMPTZ
)
RETURNS public.orders
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_current_seller_id UUID;
    v_order public.orders%ROWTYPE;
BEGIN
    SELECT s.id
    INTO v_current_seller_id
    FROM public.sellers s
    WHERE s.id = public.current_seller_id()
      AND s.status = 'approved';

    IF v_current_seller_id IS NULL THEN
        RAISE EXCEPTION 'Seller access required';
    END IF;

    UPDATE public.orders
    SET estimated_delivery = p_estimated_delivery,
        updated_at = NOW()
    WHERE id = p_order_id
      AND storefront_seller_id = v_current_seller_id
    RETURNING *
    INTO v_order;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Order not found or not owned by current seller';
    END IF;

    RETURN v_order;
END;
$$;

GRANT EXECUTE ON FUNCTION public.seller_update_order_estimated_delivery(UUID, TIMESTAMPTZ)
    TO authenticated;
