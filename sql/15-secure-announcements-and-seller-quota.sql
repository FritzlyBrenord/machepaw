-- =====================================================
-- 15-SECURE-ANNOUNCEMENTS-AND-SELLER-QUOTA.SQL
-- Secure announcements for admin/seller usage and protect
-- storefront rendering with seller limits.
-- =====================================================

ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_announcements_created_by_created_at
    ON public.announcements (created_by, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_announcements_placement_active_priority
    ON public.announcements (placement, is_active, priority DESC, created_at DESC);

CREATE OR REPLACE FUNCTION public.prepare_announcement_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_profile_id UUID;
    v_is_admin BOOLEAN;
    v_seller_id UUID;
    v_weekly_count INTEGER;
    v_active_same_placement INTEGER;
BEGIN
    v_profile_id := public.current_profile_id();
    v_is_admin := public.is_current_user_admin();
    v_seller_id := public.current_seller_id();

    IF v_profile_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required';
    END IF;

    PERFORM pg_advisory_xact_lock(hashtext('announcements:' || v_profile_id::TEXT));

    IF TG_OP = 'INSERT' THEN
        NEW.created_by := COALESCE(NEW.created_by, v_profile_id);
        NEW.created_at := COALESCE(NEW.created_at, NOW());
    ELSE
        NEW.created_by := OLD.created_by;
        NEW.created_at := OLD.created_at;
    END IF;

    NEW.starts_at := COALESCE(NEW.starts_at, NOW());
    NEW.updated_at := NOW();
    NEW.priority := COALESCE(NEW.priority, 0);
    NEW.display_delay_seconds := GREATEST(COALESCE(NEW.display_delay_seconds, 0), 0);

    IF NEW.ends_at IS NOT NULL AND NEW.ends_at <= NEW.starts_at THEN
        RAISE EXCEPTION 'Announcement end date must be after the start date';
    END IF;

    IF v_is_admin THEN
        RETURN NEW;
    END IF;

    IF v_seller_id IS NULL THEN
        RAISE EXCEPTION 'Approved seller access required';
    END IF;

    IF NEW.created_by <> v_profile_id THEN
        RAISE EXCEPTION 'You can only manage your own announcements';
    END IF;

    NEW.priority := LEAST(GREATEST(COALESCE(NEW.priority, 0), 0), 5);
    NEW.display_delay_seconds := LEAST(GREATEST(COALESCE(NEW.display_delay_seconds, 0), 0), 30);

    IF TG_OP = 'INSERT' THEN
        SELECT COUNT(*)
        INTO v_weekly_count
        FROM public.announcements a
        WHERE a.created_by = v_profile_id
          AND a.created_at >= NOW() - INTERVAL '7 days';

        IF v_weekly_count >= 3 THEN
            RAISE EXCEPTION 'Weekly seller announcement limit reached (3 per 7 days)';
        END IF;
    END IF;

    IF COALESCE(NEW.is_active, FALSE) THEN
        SELECT COUNT(*)
        INTO v_active_same_placement
        FROM public.announcements a
        WHERE a.created_by = v_profile_id
          AND a.placement = NEW.placement
          AND a.is_active = TRUE
          AND (a.ends_at IS NULL OR a.ends_at > NOW())
          AND a.id <> COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::UUID);

        IF v_active_same_placement >= 1 THEN
            RAISE EXCEPTION 'Only one active seller announcement is allowed per placement';
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prepare_announcement_fields_trigger ON public.announcements;
CREATE TRIGGER prepare_announcement_fields_trigger
    BEFORE INSERT OR UPDATE ON public.announcements
    FOR EACH ROW
    EXECUTE FUNCTION public.prepare_announcement_fields();

DROP POLICY IF EXISTS "Public can read active announcements" ON public.announcements;
CREATE POLICY "Public can read active announcements"
    ON public.announcements
    FOR SELECT
    USING (
        public.is_current_user_admin()
        OR created_by = public.current_profile_id()
        OR (
            is_active = TRUE
            AND starts_at <= NOW()
            AND (ends_at IS NULL OR ends_at > NOW())
        )
    );

DROP POLICY IF EXISTS "Sellers can insert own announcements" ON public.announcements;
CREATE POLICY "Sellers can insert own announcements"
    ON public.announcements
    FOR INSERT
    WITH CHECK (
        created_by = public.current_profile_id()
        AND public.current_seller_id() IS NOT NULL
    );

DROP POLICY IF EXISTS "Sellers can update own announcements" ON public.announcements;
CREATE POLICY "Sellers can update own announcements"
    ON public.announcements
    FOR UPDATE
    USING (
        created_by = public.current_profile_id()
        AND public.current_seller_id() IS NOT NULL
    )
    WITH CHECK (
        created_by = public.current_profile_id()
        AND public.current_seller_id() IS NOT NULL
    );

DROP POLICY IF EXISTS "Sellers can delete own announcements" ON public.announcements;
CREATE POLICY "Sellers can delete own announcements"
    ON public.announcements
    FOR DELETE
    USING (
        created_by = public.current_profile_id()
        AND public.current_seller_id() IS NOT NULL
    );

DROP POLICY IF EXISTS "Admins can manage all announcements" ON public.announcements;
CREATE POLICY "Admins can manage all announcements"
    ON public.announcements
    FOR ALL
    USING (public.is_current_user_admin())
    WITH CHECK (public.is_current_user_admin());

CREATE OR REPLACE FUNCTION public.increment_announcement_view(announcement_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE public.announcements
    SET view_count = COALESCE(view_count, 0) + 1,
        updated_at = NOW()
    WHERE id = announcement_id
      AND is_active = TRUE
      AND starts_at <= NOW()
      AND (ends_at IS NULL OR ends_at > NOW());
END;
$$;

CREATE OR REPLACE FUNCTION public.increment_announcement_click(announcement_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE public.announcements
    SET click_count = COALESCE(click_count, 0) + 1,
        updated_at = NOW()
    WHERE id = announcement_id
      AND is_active = TRUE
      AND starts_at <= NOW()
      AND (ends_at IS NULL OR ends_at > NOW());
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_announcement_view(UUID) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.increment_announcement_click(UUID) TO anon, authenticated, service_role;
