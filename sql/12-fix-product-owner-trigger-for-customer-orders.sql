-- =====================================================
-- 12-FIX-PRODUCT-OWNER-TRIGGER-FOR-CUSTOMER-ORDERS.SQL
-- Allow customer checkout to update seller product inventory safely
-- =====================================================

CREATE OR REPLACE FUNCTION public.prepare_product_owner_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_profile_id UUID;
    v_is_admin BOOLEAN;
    v_current_seller_id UUID;
    v_existing_owner_id UUID;
    v_existing_seller_id UUID;
    v_owner_name TEXT;
BEGIN
    v_profile_id := public.current_profile_id();
    v_is_admin := public.is_current_user_admin();
    v_current_seller_id := public.current_seller_id();
    v_existing_owner_id := CASE WHEN TG_OP = 'UPDATE' THEN OLD.owner_id ELSE NULL END;
    v_existing_seller_id := CASE WHEN TG_OP = 'UPDATE' THEN OLD.seller_id ELSE NULL END;

    -- Allow checkout/order workflows to update stock, sales, status, and timestamps
    -- without forcing the customer to be an approved seller.
    IF TG_OP = 'UPDATE'
        AND NEW.owner_type IS NOT DISTINCT FROM OLD.owner_type
        AND NEW.owner_id IS NOT DISTINCT FROM OLD.owner_id
        AND NEW.seller_id IS NOT DISTINCT FROM OLD.seller_id
        AND NEW.owner_name IS NOT DISTINCT FROM OLD.owner_name
    THEN
        NEW.updated_at := NOW();
        RETURN NEW;
    END IF;

    IF v_profile_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required';
    END IF;

    IF NEW.owner_type = 'seller' THEN
        IF v_is_admin THEN
            NEW.owner_id := COALESCE(NEW.owner_id, v_existing_owner_id);
            NEW.seller_id := COALESCE(NEW.seller_id, v_existing_seller_id);
        ELSE
            IF v_current_seller_id IS NULL THEN
                RAISE EXCEPTION 'Approved seller access required';
            END IF;

            NEW.owner_id := v_profile_id;
            NEW.seller_id := v_current_seller_id;
        END IF;

        IF COALESCE(NEW.owner_name, '') = '' THEN
            SELECT s.business_name
            INTO v_owner_name
            FROM public.sellers s
            WHERE s.id = NEW.seller_id;

            NEW.owner_name := COALESCE(v_owner_name, NEW.owner_name, 'Seller');
        END IF;
    ELSIF NEW.owner_type = 'admin' THEN
        IF NOT v_is_admin THEN
            RAISE EXCEPTION 'Admin access required';
        END IF;

        NEW.owner_id := COALESCE(v_existing_owner_id, v_profile_id);
        NEW.seller_id := NULL;

        IF COALESCE(NEW.owner_name, '') = '' THEN
            SELECT COALESCE(NULLIF(TRIM(CONCAT(u.first_name, ' ', u.last_name)), ''), u.email, 'Admin')
            INTO v_owner_name
            FROM public.users u
            WHERE u.id = NEW.owner_id;

            NEW.owner_name := COALESCE(v_owner_name, 'Admin');
        END IF;
    ELSE
        RAISE EXCEPTION 'Invalid owner_type';
    END IF;

    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$;
