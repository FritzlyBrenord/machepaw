-- =====================================================
-- 10-FIX-PAYMENT-BUCKET-AND-ORDERS-RLS.SQL
-- Fixes Infinite Recursion on Orders and Payment Bucket Visibility
-- =====================================================

-- -----------------------------------------------------
-- 1. FIX PAYMENT-PROOFS BUCKET VISIBILITY
-- -----------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-proofs', 'payment-proofs', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public full access to payment-proofs" ON storage.objects;
CREATE POLICY "Public full access to payment-proofs"
ON storage.objects FOR SELECT
USING ( bucket_id = 'payment-proofs' );

-- -----------------------------------------------------
-- 2. FIX ORDERS INFINITE RECURSION
-- -----------------------------------------------------
-- Problem: "Sellers can read orders with their products" on orders queried order_items.
-- And "Users can read own order items" on order_items queried orders.
-- Result: INFINITE RECURSION.
-- Fix: Use a SECURITY DEFINER function so that checking order_items from orders bypasses RLS and breaks the loop.

-- Security Definer Function: Runs as the owner (bypassing RLS)
CREATE OR REPLACE FUNCTION public.is_order_seller(p_order_id UUID, p_auth_uid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.order_items 
        JOIN public.sellers ON order_items.seller_id = sellers.id
        JOIN public.users ON sellers.user_id = users.id
        WHERE order_items.order_id = p_order_id
        AND users.auth_id = p_auth_uid
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.is_order_seller(UUID, UUID) TO authenticated;

-- Drop the old recursive policy on orders
DROP POLICY IF EXISTS "Sellers can read orders with their products" ON public.orders;

-- Create the new non-recursive policy
CREATE POLICY "Sellers can read orders with their products" ON public.orders
FOR SELECT USING (
    public.is_order_seller(id, auth.uid())
);

-- We also make sure the Admins policy uses the JWT directly to avoid any extra queries!
DROP POLICY IF EXISTS "Admins can manage all orders" ON public.orders;
CREATE POLICY "Admins can manage all orders" ON public.orders
FOR ALL USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
)
WITH CHECK (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);
