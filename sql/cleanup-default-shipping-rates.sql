-- Cleanup script to remove old default shipping rules
-- Use this to delete the rules that were hardcoded in previous versions

DELETE FROM public.shipping_rates
WHERE name IN (
  'Livraison locale (Port-au-Prince)',
  'Livraison nationale (Haïti)',
  'Livraison internationale'
);

-- Alternative: Delete by ID if they were inserted with specific string IDs
DELETE FROM public.shipping_rates
WHERE id IN ('local', 'national', 'international');
