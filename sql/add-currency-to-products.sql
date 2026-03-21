-- Add currency_code to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS currency_code VARCHAR(10) DEFAULT 'HTG';

-- Optional: Update existing products to HTG if they are NULL (though DEFAULT should handle it)
UPDATE products SET currency_code = 'HTG' WHERE currency_code IS NULL;

-- Ensure shipping_rates also has a currency code if needed (optional based on user request "tout les taux sera convertir")
-- For now we assume shipping rates are in the system default or we add a column there too.
ALTER TABLE shipping_rates ADD COLUMN IF NOT EXISTS currency_code VARCHAR(10) DEFAULT 'HTG';
