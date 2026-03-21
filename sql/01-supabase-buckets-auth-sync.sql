-- =====================================================
-- 01-SUPABASE-BUCKETS-AUTH-SYNC.SQL
-- Buckets Storage + Auth/Users Synchronization
-- Run this AFTER schema.sql
-- =====================================================

-- =====================================================
-- PART 1: STORAGE BUCKETS CREATION
-- =====================================================

-- Create buckets using Supabase Storage API
-- Note: These are SQL commands for Supabase. 
-- Alternative: Create via Supabase Dashboard → Storage

-- Function to ensure bucket exists (idempotent)
CREATE OR REPLACE FUNCTION create_storage_bucket(bucket_name TEXT, is_public BOOLEAN DEFAULT FALSE)
RETURNS VOID AS $$
BEGIN
    -- This is a placeholder - actual bucket creation happens via Supabase API
    -- or you can create manually in Dashboard: Storage → New Bucket
    RAISE NOTICE 'Bucket % should be created via Supabase Dashboard or Storage API', bucket_name;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- BUCKETS CONFIGURATION DOCUMENTATION
-- =====================================================
/*
CREATE THESE BUCKETS IN SUPABASE DASHBOARD:

1. products-images (Public)
   - Purpose: Product images, gallery photos
   - Policy: Public read, Authenticated users can upload
   - Path structure: products/{product_id}/{filename}

2. avatars (Public)  
   - Purpose: User profile pictures, seller logos
   - Policy: Public read, Users can only upload their own
   - Path structure: avatars/{user_id}/{filename}

3. seller-documents (Private)
   - Purpose: KYC documents, business registration
   - Policy: Only admin and owner seller can access
   - Path structure: sellers/{seller_id}/documents/{filename}

4. categories (Public)
   - Purpose: Category images, banners
   - Policy: Public read, Only admin can upload
   - Path structure: categories/{category_id}/{filename}

5. reviews (Public)
   - Purpose: Review images uploaded by customers
   - Policy: Public read, Users can upload with their reviews
   - Path structure: reviews/{review_id}/{filename}

6. temp-uploads (Private)
   - Purpose: Temporary uploads before processing
   - Policy: Only uploader can access, auto-cleanup after 24h
   - Path structure: temp/{user_id}/{filename}

7. admin-assets (Private)
   - Purpose: Admin panel assets, reports
   - Policy: Only admin access
   - Path structure: admin/{filename}
*/

-- =====================================================
-- PART 2: AUTH/USERS SYNCHRONIZATION
-- =====================================================

-- IMPORTANT: Drop and recreate users table with UUID matching auth.users
-- The users.id must match auth.users.id exactly

-- First, disable foreign key checks temporarily (be careful!)
-- Then recreate with proper structure

-- Drop existing triggers and functions that depend on users
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Drop and recreate users table with synchronized ID
-- Note: In production, you'd migrate data first. This is for fresh setup.

-- Create new users table structure (if not exists, or recreate with migration)
-- The key is: users.id = auth.users.id (same UUID)

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert into public.users with the SAME ID as auth.users
    INSERT INTO public.users (id, auth_id, email, first_name, last_name, role, created_at)
    VALUES (
        NEW.id,                    -- Same UUID as auth.users.id
        NEW.id,                    -- auth_id also references auth.id
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
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- SYNC: AUTH.USERS UPDATE → PUBLIC.USERS
-- =====================================================

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

DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
    AFTER UPDATE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_user_update();

-- =====================================================
-- SYNC: AUTH.USERS DELETE → PUBLIC.USERS
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_user_delete()
RETURNS TRIGGER AS $$
BEGIN
    -- Delete from public.users when auth.users is deleted
    DELETE FROM public.users WHERE id = OLD.id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;
CREATE TRIGGER on_auth_user_deleted
    BEFORE DELETE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_user_delete();

-- =====================================================
-- PART 3: USERS TABLE STRUCTURE FIX
-- =====================================================

-- Ensure users.id matches auth.users.id exactly (no separate generation)
-- Drop the default uuid_generate_v4() so ID comes from auth.users

-- If table exists, alter it to remove default (for existing setups)
DO $$
BEGIN
    ALTER TABLE users ALTER COLUMN id DROP DEFAULT;
EXCEPTION
    WHEN others THEN NULL;
END $$;

-- Make auth_id optional since id = auth_id now
ALTER TABLE users ALTER COLUMN auth_id DROP NOT NULL;

-- Add constraint to ensure id matches auth.users.id
-- Note: This is enforced by the trigger, not a FK constraint

-- =====================================================
-- PART 4: STORAGE POLICIES (RLS for Storage)
-- =====================================================

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own folder in avatars bucket
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

-- Policy: Public read for product images
CREATE POLICY "Public can view product images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'products-images');

-- Policy: Only admins can upload to categories
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

-- Policy: Sellers can upload to products-images (their own products)
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

-- Policy: Sellers can manage their own seller documents
CREATE POLICY "Sellers can manage own documents"
ON storage.objects FOR ALL
TO authenticated
USING (
    bucket_id = 'seller-documents' 
    AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
    bucket_id = 'seller-documents' 
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Admins can access all seller documents
CREATE POLICY "Admins can access all seller documents"
ON storage.objects FOR ALL
TO authenticated
USING (
    bucket_id = 'seller-documents' 
    AND EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
)
WITH CHECK (
    bucket_id = 'seller-documents' 
    AND EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Policy: Users can manage their temp uploads
CREATE POLICY "Users can manage temp uploads"
ON storage.objects FOR ALL
TO authenticated
USING (
    bucket_id = 'temp-uploads' 
    AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
    bucket_id = 'temp-uploads' 
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Public can view category images
CREATE POLICY "Public can view categories"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'categories');

-- =====================================================
-- PART 5: CLEANUP FUNCTION FOR TEMP FILES
-- =====================================================

-- Function to clean up old temp files (run as cron job or scheduled function)
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

-- =====================================================
-- PART 6: HELPER FUNCTIONS
-- =====================================================

-- Function to get public URL for a file
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
-- PART 7: MANUAL SYNC FOR EXISTING USERS (if needed)
-- =====================================================

-- If you have existing auth.users not in public.users, run this:
/*
INSERT INTO public.users (id, auth_id, email, first_name, last_name, role, created_at)
SELECT 
    au.id,
    au.id as auth_id,
    au.email,
    COALESCE(au.raw_user_meta_data->>'first_name', au.email) as first_name,
    COALESCE(au.raw_user_meta_data->>'last_name', '') as last_name,
    COALESCE(au.raw_user_meta_data->>'role', 'customer') as role,
    au.created_at
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL
ON CONFLICT (id) DO NOTHING;
*/

-- =====================================================
-- INSTRUCTIONS FOR BUCKET CREATION
-- =====================================================

/*
STEP 1: Create Buckets via Supabase Dashboard
-----------------------------------------------
Go to: Supabase Dashboard → Storage → New Bucket

Create these 7 buckets with specified settings:

1. products-images
   - Public bucket: YES
   - File size limit: 10MB
   - Allowed MIME types: image/*

2. avatars
   - Public bucket: YES
   - File size limit: 5MB
   - Allowed MIME types: image/*

3. seller-documents
   - Public bucket: NO (Private)
   - File size limit: 20MB
   - Allowed MIME types: image/*, application/pdf

4. categories
   - Public bucket: YES
   - File size limit: 5MB
   - Allowed MIME types: image/*

5. reviews
   - Public bucket: YES
   - File size limit: 5MB
   - Allowed MIME types: image/*

6. temp-uploads
   - Public bucket: NO (Private)
   - File size limit: 10MB
   - Allowed MIME types: image/*

7. admin-assets
   - Public bucket: NO (Private)
   - File size limit: 50MB
   - Allowed MIME types: *

STEP 2: Run this SQL
--------------------
Copy/paste this entire file into Supabase SQL Editor and run.

STEP 3: Verify Sync
-------------------
Create a new user via Supabase Auth - it should automatically appear in public.users table with the same ID.

The synchronization is now BIDIRECTIONAL:
- auth.users INSERT → public.users INSERT (same ID)
- auth.users UPDATE → public.users UPDATE  
- auth.users DELETE → public.users DELETE
*/

-- =====================================================
-- END OF FILE
-- =====================================================
