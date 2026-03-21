-- =====================================================
-- 06-PRODUCT-ORDER-SECURITY-AND-AUDIT.SQL
-- Product ownership hardening, secure views, and audit trail
-- =====================================================

-- =====================================================
-- AUDIT ACCESS
-- =====================================================

DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_logs;
CREATE POLICY "Admins can view audit logs"
    ON public.audit_logs
    FOR SELECT
    USING (public.is_current_user_admin());

DROP POLICY IF EXISTS "Users can view own audit logs" ON public.audit_logs;
CREATE POLICY "Users can view own audit logs"
    ON public.audit_logs
    FOR SELECT
    USING (user_id = public.current_profile_id());

-- =====================================================
-- USER DIRECTORY ACCESS FOR ORDER VISIBILITY
-- =====================================================

DROP POLICY IF EXISTS "Admins can read all users for orders" ON public.users;
CREATE POLICY "Admins can read all users for orders"
    ON public.users
    FOR SELECT
    USING (public.is_current_user_admin());

DROP POLICY IF EXISTS "Sellers can read customers from own orders" ON public.users;
CREATE POLICY "Sellers can read customers from own orders"
    ON public.users
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1
            FROM public.orders o
            JOIN public.order_items oi
                ON oi.order_id = o.id
            WHERE o.user_id = users.id
              AND oi.seller_id = public.current_seller_id()
        )
    );

-- =====================================================
-- PRODUCT OWNERSHIP
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

    -- Allow inventory/status updates during checkout and other system workflows
    -- when product ownership fields are not being modified.
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

DROP TRIGGER IF EXISTS prepare_product_owner_fields_trigger ON public.products;
CREATE TRIGGER prepare_product_owner_fields_trigger
    BEFORE INSERT OR UPDATE ON public.products
    FOR EACH ROW
    EXECUTE FUNCTION public.prepare_product_owner_fields();

DROP POLICY IF EXISTS "Products are viewable by everyone" ON public.products;
DROP POLICY IF EXISTS "Sellers can manage own products" ON public.products;
DROP POLICY IF EXISTS "Admins can manage all products" ON public.products;
DROP POLICY IF EXISTS "Active products are viewable publicly" ON public.products;
DROP POLICY IF EXISTS "Owners can read own products" ON public.products;
DROP POLICY IF EXISTS "Sellers can insert own products" ON public.products;
DROP POLICY IF EXISTS "Sellers can update own products" ON public.products;
DROP POLICY IF EXISTS "Sellers can delete own products" ON public.products;

CREATE POLICY "Active products are viewable publicly"
    ON public.products
    FOR SELECT
    USING (
        status = 'active'
        OR owner_id = public.current_profile_id()
        OR seller_id = public.current_seller_id()
        OR public.is_current_user_admin()
    );

CREATE POLICY "Sellers can insert own products"
    ON public.products
    FOR INSERT
    WITH CHECK (
        owner_type = 'seller'
        AND owner_id = public.current_profile_id()
        AND seller_id = public.current_seller_id()
    );

CREATE POLICY "Sellers can update own products"
    ON public.products
    FOR UPDATE
    USING (
        owner_type = 'seller'
        AND owner_id = public.current_profile_id()
        AND seller_id = public.current_seller_id()
    )
    WITH CHECK (
        owner_type = 'seller'
        AND owner_id = public.current_profile_id()
        AND seller_id = public.current_seller_id()
    );

CREATE POLICY "Sellers can delete own products"
    ON public.products
    FOR DELETE
    USING (
        owner_type = 'seller'
        AND owner_id = public.current_profile_id()
        AND seller_id = public.current_seller_id()
    );

CREATE POLICY "Admins can manage all products"
    ON public.products
    FOR ALL
    USING (public.is_current_user_admin())
    WITH CHECK (public.is_current_user_admin());

-- =====================================================
-- ORDER / ORDER ITEM ACCESS
-- =====================================================

DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can manage all orders" ON public.orders;
DROP POLICY IF EXISTS "Users can read order items for own orders" ON public.order_items;
DROP POLICY IF EXISTS "Admins can manage all order items" ON public.order_items;

CREATE POLICY "Users can view own orders"
    ON public.orders
    FOR SELECT
    USING (
        user_id = public.current_profile_id()
        OR public.is_current_user_admin()
        OR EXISTS (
            SELECT 1
            FROM public.order_items oi
            WHERE oi.order_id = orders.id
              AND oi.seller_id = public.current_seller_id()
        )
    );

CREATE POLICY "Admins can manage all orders"
    ON public.orders
    FOR ALL
    USING (public.is_current_user_admin())
    WITH CHECK (public.is_current_user_admin());

CREATE POLICY "Users can read order items for own orders"
    ON public.order_items
    FOR SELECT
    USING (
        public.is_current_user_admin()
        OR EXISTS (
            SELECT 1
            FROM public.orders o
            WHERE o.id = order_items.order_id
              AND o.user_id = public.current_profile_id()
        )
        OR order_items.seller_id = public.current_seller_id()
    );

CREATE POLICY "Admins can manage all order items"
    ON public.order_items
    FOR ALL
    USING (public.is_current_user_admin())
    WITH CHECK (public.is_current_user_admin());

-- =====================================================
-- AUDIT HELPERS
-- =====================================================

CREATE OR REPLACE FUNCTION public.log_audit_event(
    p_action TEXT,
    p_entity_type TEXT,
    p_entity_id UUID DEFAULT NULL,
    p_old_values JSONB DEFAULT NULL,
    p_new_values JSONB DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.audit_logs (
        user_id,
        action,
        entity_type,
        entity_id,
        old_values,
        new_values
    )
    VALUES (
        public.current_profile_id(),
        p_action,
        p_entity_type,
        p_entity_id,
        p_old_values,
        p_new_values
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.audit_row_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_entity_type TEXT;
BEGIN
    v_entity_type := COALESCE(TG_ARGV[0], TG_TABLE_NAME);

    IF TG_OP = 'INSERT' THEN
        PERFORM public.log_audit_event(
            LOWER(v_entity_type) || '_created',
            v_entity_type,
            NEW.id,
            NULL,
            to_jsonb(NEW)
        );
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        PERFORM public.log_audit_event(
            LOWER(v_entity_type) || '_updated',
            v_entity_type,
            NEW.id,
            to_jsonb(OLD),
            to_jsonb(NEW)
        );
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        PERFORM public.log_audit_event(
            LOWER(v_entity_type) || '_deleted',
            v_entity_type,
            OLD.id,
            to_jsonb(OLD),
            NULL
        );
        RETURN OLD;
    END IF;

    RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS audit_products_trigger ON public.products;
CREATE TRIGGER audit_products_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.products
    FOR EACH ROW
    EXECUTE FUNCTION public.audit_row_changes('product');

DROP TRIGGER IF EXISTS audit_orders_trigger ON public.orders;
CREATE TRIGGER audit_orders_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.audit_row_changes('order');

DROP TRIGGER IF EXISTS audit_order_items_trigger ON public.order_items;
CREATE TRIGGER audit_order_items_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.order_items
    FOR EACH ROW
    EXECUTE FUNCTION public.audit_row_changes('order_item');

-- =====================================================
-- SECURITY-INVOKER VIEWS
-- =====================================================

DROP VIEW IF EXISTS public.active_products;
CREATE VIEW public.active_products
WITH (security_invoker = true) AS
SELECT
    p.*,
    c.name AS category_name,
    c.slug AS category_slug,
    s.business_name AS seller_business_name,
    s.is_verified AS seller_verified
FROM public.products p
LEFT JOIN public.categories c ON c.id::TEXT = p.category_id::TEXT
LEFT JOIN public.sellers s ON s.id = p.seller_id
WHERE p.status = 'active';

DROP VIEW IF EXISTS public.order_details;
CREATE VIEW public.order_details
WITH (security_invoker = true) AS
SELECT
    o.*,
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
LEFT JOIN public.users u
    ON u.id = o.user_id
LEFT JOIN public.order_items oi
    ON oi.order_id = o.id
LEFT JOIN public.products p
    ON p.id = oi.product_id
GROUP BY o.id, u.first_name, u.last_name, u.email;

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

ALTER VIEW IF EXISTS public.admin_seller_overview
    SET (security_invoker = true);
