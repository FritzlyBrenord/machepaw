-- =====================================================
-- SUPABASE BUCKETS & AUTH SYNC
-- Run ONLY this SQL code in Supabase SQL Editor
-- =====================================================

-- PART 1: AUTH/USERS SYNCHRONIZATION
-- =====================================================

-- Drop existing triggers and functions
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.handle_user_update() CASCADE;
DROP FUNCTION IF EXISTS public.handle_user_delete() CASCADE;

-- Create new users table structure (if not exists)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, auth_id, email, first_name, last_name, role, created_at)
    VALUES (
        NEW.id,
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'first_name', NEW.email),
        COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'role', 'customer'),
        NEW.created_at
    )
    ON CONFLICT (id) DO UPDATE
    SET 
        email = EXCLUDED.email,
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to sync auth.users → public.users (INSERT)
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- SYNC: AUTH.USERS UPDATE → PUBLIC.USERS
CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.users
    SET 
        email = NEW.email,
        updated_at = NOW()
    WHERE id = NEW.id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_updated
    AFTER UPDATE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_user_update();

-- SYNC: AUTH.USERS DELETE → PUBLIC.USERS
CREATE OR REPLACE FUNCTION public.handle_user_delete()
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM public.users WHERE id = OLD.id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_deleted
    BEFORE DELETE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_user_delete();

-- USERS TABLE STRUCTURE FIX
DO $$
BEGIN
    ALTER TABLE users ALTER COLUMN id DROP DEFAULT;
EXCEPTION
    WHEN others THEN NULL;
END $$;

ALTER TABLE users ALTER COLUMN auth_id DROP NOT NULL;

-- =====================================================
-- PART 2: STORAGE POLICIES
-- =====================================================

-- Enable RLS on storage
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

-- Policy: Public can view product images
CREATE POLICY "Public can view product images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'products-images');

-- Policy: Users can manage their own avatars
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'avatars' 
    AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'avatars' 
    AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'avatars' 
    AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Public can view avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- Policy: Only admins can manage categories
CREATE POLICY "Only admins can manage categories"
ON storage.objects FOR ALL
TO authenticated
USING (
    bucket_id = 'categories' 
    AND EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
)
WITH CHECK (
    bucket_id = 'categories' 
    AND EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Policy: Sellers can upload product images
CREATE POLICY "Sellers can upload product images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'products-images'
    AND EXISTS (
        SELECT 1 FROM sellers 
        WHERE user_id = auth.uid() 
        AND status = 'approved'
    )
);

-- Policy: Admins can access all product images
CREATE POLICY "Admins can manage product images"
ON storage.objects FOR ALL
TO authenticated
USING (
    bucket_id = 'products-images'
    AND EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
)
WITH CHECK (
    bucket_id = 'products-images'
    AND EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- =====================================================
-- PART 3: HELPER FUNCTIONS
-- =====================================================

-- Function to get public URL
CREATE OR REPLACE FUNCTION get_public_url(bucket TEXT, path TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN concat(
        current_setting('app.settings.supabase_url', true),
        '/storage/v1/object/public/',
        bucket,
        '/',
        path
    );
END;
$$ LANGUAGE plpgsql;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM users 
        WHERE id = user_uuid AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is seller
CREATE OR REPLACE FUNCTION is_approved_seller(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM sellers 
        WHERE user_id = user_uuid AND status = 'approved'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- CLEANUP FUNCTION FOR TEMP FILES
-- =====================================================

CREATE OR REPLACE FUNCTION cleanup_temp_uploads()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM storage.objects 
    WHERE bucket_id = 'temp-uploads' 
    AND created_at < NOW() - INTERVAL '24 hours';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
