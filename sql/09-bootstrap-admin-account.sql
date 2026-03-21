-- =====================================================
-- 09-BOOTSTRAP-ADMIN-ACCOUNT.SQL
-- Creates or repairs a real administrator account
-- in auth.users + auth.identities + public.users.
--
-- IMPORTANT:
-- 1. Edit v_email / v_password / v_first_name / v_last_name
-- 2. Run this in Supabase SQL Editor as postgres
-- 3. Then log in from /admin/login with that email/password
-- =====================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
    v_email TEXT := 'luxeadmin@admin.com';
    v_password TEXT := 'luxeadmin@2026';
    v_first_name TEXT := 'Admin';
    v_last_name TEXT := 'Principal';
    v_user_id UUID;
BEGIN


    IF POSITION('@' IN v_email) = 0 THEN
        RAISE EXCEPTION 'v_email must be a valid email address.';
    END IF;

    IF LENGTH(v_password) < 12 THEN
        RAISE EXCEPTION 'v_password must contain at least 12 characters.';
    END IF;

    SELECT au.id
    INTO v_user_id
    FROM auth.users au
    WHERE LOWER(au.email) = LOWER(v_email)
    LIMIT 1;

    IF v_user_id IS NULL THEN
        v_user_id := gen_random_uuid();

        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            recovery_sent_at,
            last_sign_in_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at,
            confirmation_token,
            email_change,
            email_change_token_new,
            recovery_token
        )
        VALUES (
            '00000000-0000-0000-0000-000000000000',
            v_user_id,
            'authenticated',
            'authenticated',
            v_email,
            crypt(v_password, gen_salt('bf')),
            NOW(),
            NOW(),
            NOW(),
            jsonb_build_object('provider', 'email', 'providers', ARRAY['email']),
            jsonb_build_object(
                'first_name', v_first_name,
                'last_name', v_last_name,
                'role', 'admin'
            ),
            NOW(),
            NOW(),
            '',
            '',
            '',
            ''
        );
    ELSE
        UPDATE auth.users
        SET
            encrypted_password = crypt(v_password, gen_salt('bf')),
            email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
            raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object(
                'provider', 'email',
                'providers', ARRAY['email']
            ),
            raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || jsonb_build_object(
                'first_name', v_first_name,
                'last_name', v_last_name,
                'role', 'admin'
            ),
            updated_at = NOW()
        WHERE id = v_user_id;
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM auth.identities ai
        WHERE ai.user_id = v_user_id
          AND ai.provider = 'email'
    ) THEN
        INSERT INTO auth.identities (
            id,
            user_id,
            identity_data,
            provider,
            provider_id,
            last_sign_in_at,
            created_at,
            updated_at
        )
        VALUES (
            gen_random_uuid(),
            v_user_id,
            jsonb_build_object(
                'sub', v_user_id::TEXT,
                'email', v_email,
                'email_verified', TRUE
            ),
            'email',
            v_email,
            NOW(),
            NOW(),
            NOW()
        );
    END IF;

    INSERT INTO public.users (
        id,
        auth_id,
        email,
        first_name,
        last_name,
        role,
        is_blocked,
        created_at,
        updated_at
    )
    VALUES (
        v_user_id,
        v_user_id,
        v_email,
        v_first_name,
        v_last_name,
        'admin',
        FALSE,
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE
    SET
        auth_id = EXCLUDED.auth_id,
        email = EXCLUDED.email,
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        role = 'admin',
        is_blocked = FALSE,
        updated_at = NOW();

    RAISE NOTICE 'Admin account ready: %', v_email;
END $$;
