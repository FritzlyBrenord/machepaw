-- =====================================================
-- 09-FIX-UUID-FUNCTION.SQL
-- Fixes the missing uuid_generate_v4() function error
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
            UPPER(SUBSTRING(REPLACE(gen_random_uuid()::TEXT, '-', '') FROM 1 FOR 8))
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

GRANT EXECUTE ON FUNCTION public.generate_marketplace_order_number() TO authenticated;
