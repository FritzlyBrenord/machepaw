-- =====================================================
-- 24-FIX-SELLER-PLAN-REQUEST-STATUS.SQL
-- Prevent admin review actions from being forced back to pending_review
-- =====================================================

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

    v_requested_status := LOWER(COALESCE(TRIM(NEW.status), ''));

    SELECT EXISTS (
        SELECT 1
        FROM public.seller_plan_requests spr
        WHERE spr.seller_id = NEW.seller_id
          AND spr.status IN ('pending_review', 'draft')
          AND (NEW.id IS NULL OR spr.id <> NEW.id)
    ) INTO v_existing_pending;

    IF v_existing_pending AND v_requested_status IN ('pending_review', 'draft') THEN
        RAISE EXCEPTION 'A plan request is already pending for this seller';
    END IF;

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
