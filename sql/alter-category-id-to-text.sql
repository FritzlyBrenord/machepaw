-- 1. Supprimer la vue qui utilise la colonne category_id
DROP VIEW IF EXISTS active_products;

-- 2. Supprimer la clé étrangère qui relie les produits à l'ancienne table 'categories'
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_category_id_fkey;

-- 3. Changer le type de la colonne category_id pour accepter du texte (ex: "jewelry")
-- On utilise CASCADE au cas où d'autres objets en dépendraient encore
ALTER TABLE products ALTER COLUMN category_id TYPE TEXT USING category_id::TEXT;

-- 4. Recréer la vue active_products
-- Note : La jointure sur 'categories' fonctionnera si les IDs correspondent, sinon elle retournera NULL
CREATE VIEW active_products AS
SELECT 
    p.*,
    c.name as category_name,
    c.slug as category_slug,
    s.business_name as seller_business_name,
    s.is_verified as seller_verified
FROM products p
LEFT JOIN categories c ON p.category_id = c.id::TEXT
LEFT JOIN sellers s ON p.seller_id = s.id
WHERE p.status = 'active';

-- 5. Forcer Supabase à recharger le cache du schéma
NOTIFY pgrst, 'reload schema';
