-- Clean up 'settings' table to only include general site configuration
ALTER TABLE settings 
ADD COLUMN IF NOT EXISTS site_name TEXT,
ADD COLUMN IF NOT EXISTS site_description TEXT,
ADD COLUMN IF NOT EXISTS contact_email TEXT,
ADD COLUMN IF NOT EXISTS support_phone TEXT,
ADD COLUMN IF NOT EXISTS maintenance_mode BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS allow_new_registrations BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS require_email_verification BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS seller_commission_rate DECIMAL(10,2) DEFAULT 10.00,
ADD COLUMN IF NOT EXISTS auto_approve_sellers BOOLEAN DEFAULT FALSE;

-- Ensure at least one settings row exists
INSERT INTO settings (site_name, site_description)
SELECT 'LUXE', 'Votre boutique de luxe en ligne'
WHERE NOT EXISTS (SELECT 1 FROM settings);

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';
