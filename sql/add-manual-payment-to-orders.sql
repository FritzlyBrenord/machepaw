-- =====================================================
-- ADD MANUAL PAYMENT FIELDS TO ORDERS
-- =====================================================

-- Add payment fields to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS payment_id TEXT,
ADD COLUMN IF NOT EXISTS payment_proof_url TEXT;

-- =====================================================
-- CREATE PAYMENT PROOFS BUCKET
-- =====================================================

-- Note: The bucket itself should be created via Supabase Dashboard
-- Path: Storage -> New Bucket -> name: "payment-proofs", Public: YES (or Private with RLS)
-- For simplicity, we'll make it public for now like reviews/products-images

-- Storage Policies for payment-proofs bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-proofs', 'payment-proofs', true)
ON CONFLICT (id) DO NOTHING;

-- Policy: Authenticated users can upload their own proofs
CREATE POLICY "Users can upload own payment proofs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'payment-proofs'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can view their own proofs
CREATE POLICY "Users can view own payment proofs"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'payment-proofs'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Admins can view all proofs
CREATE POLICY "Admins can view all payment proofs"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'payment-proofs'
    AND (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
);
