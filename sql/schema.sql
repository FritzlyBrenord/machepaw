-- =====================================================
-- LUXE E-COMMERCE PLATFORM - SUPABASE DATABASE SCHEMA
-- =====================================================
-- Copy and paste this entire file into Supabase SQL Editor
-- Run as a single query
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. USERS TABLE (extends auth.users)
-- =====================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT,
    avatar TEXT,
    role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('admin', 'customer', 'seller')),
    is_blocked BOOLEAN DEFAULT FALSE,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_auth_id ON users(auth_id);

-- =====================================================
-- 2. ADDRESSES TABLE
-- =====================================================
CREATE TABLE addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    address TEXT NOT NULL,
    apartment TEXT,
    department TEXT,
    arrondissement TEXT,
    commune TEXT,
    city TEXT NOT NULL,
    postal_code TEXT NOT NULL,
    country TEXT NOT NULL DEFAULT 'Haïti',
    phone TEXT NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_addresses_user_id ON addresses(user_id);

-- =====================================================
-- 3. CATEGORIES TABLE
-- =====================================================
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    image TEXT,
    description TEXT,
    product_count INTEGER DEFAULT 0,
    parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_parent ON categories(parent_id);

-- Insert default categories
INSERT INTO categories (name, slug, description) VALUES
('Montres', 'montres', 'Montres de luxe pour hommes et femmes'),
('Bijoux', 'bijoux', 'Bijoux précieux et accessoires'),
('Maroquinerie', 'maroquinerie', 'Sacs, portefeuilles et accessoires en cuir'),
('Accessoires', 'accessoires', 'Accessoires de mode et de luxe'),
('Électronique', 'electronique', 'Produits électroniques haut de gamme'),
('Mode', 'mode', 'Vêtements et chaussures de luxe'),
('Maison', 'maison', 'Décoration et art de vivre'),
('Beauté', 'beaute', 'Produits de beauté premium');

-- =====================================================
-- 4. SELLERS TABLE
-- =====================================================
CREATE TABLE sellers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
    business_name TEXT NOT NULL,
    business_type TEXT NOT NULL CHECK (business_type IN ('individual', 'company')),
    has_physical_store BOOLEAN DEFAULT FALSE,
    tax_id TEXT,
    description TEXT,
    categories UUID[] DEFAULT '{}',
    contact_person TEXT NOT NULL,
    contact_phone TEXT NOT NULL,
    contact_email TEXT NOT NULL,
    logo TEXT,
    banner TEXT,
    -- Stats
    total_sales INTEGER DEFAULT 0,
    total_revenue DECIMAL(15,2) DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    products_count INTEGER DEFAULT 0,
    -- Admin fields
    is_verified BOOLEAN DEFAULT FALSE,
    commission_rate DECIMAL(5,2) DEFAULT 10.00,
    application_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    blocked_until TIMESTAMP WITH TIME ZONE,
    block_reason TEXT,
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_sellers_user_id ON sellers(user_id);
CREATE INDEX idx_sellers_status ON sellers(status);

-- =====================================================
-- 5. SELLER APPLICATIONS TABLE
-- =====================================================
CREATE TABLE seller_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    current_step INTEGER DEFAULT 1 CHECK (current_step IN (1, 2, 3)),
    -- Step 1: Personal Info
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    -- Step 2: Business Info
    business_name TEXT NOT NULL,
    business_type TEXT NOT NULL,
    has_physical_store BOOLEAN DEFAULT FALSE,
    physical_store_address JSONB,
    tax_id TEXT,
    -- Step 3: Product Info
    product_categories UUID[] DEFAULT '{}',
    product_types TEXT,
    business_description TEXT,
    estimated_products INTEGER DEFAULT 0,
    -- Admin
    submitted_at TIMESTAMP WITH TIME ZONE,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID REFERENCES users(id),
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_seller_applications_user_id ON seller_applications(user_id);
CREATE INDEX idx_seller_applications_status ON seller_applications(status);

-- =====================================================
-- 6. PRODUCTS TABLE
-- =====================================================
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(15,2) NOT NULL,
    original_price DECIMAL(15,2),
    images TEXT[] DEFAULT '{}',
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    subcategory TEXT,
    tags TEXT[] DEFAULT '{}',
    -- Ratings & Reviews
    rating DECIMAL(3,2) DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    -- Inventory
    stock INTEGER DEFAULT 0,
    sku TEXT UNIQUE,
    features TEXT[] DEFAULT '{}',
    specifications JSONB DEFAULT '{}',
    -- Flags
    is_new BOOLEAN DEFAULT FALSE,
    is_bestseller BOOLEAN DEFAULT FALSE,
    discount INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    priority INTEGER DEFAULT 0,
    -- Owner
    owner_type TEXT NOT NULL CHECK (owner_type IN ('admin', 'seller')),
    owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
    seller_id UUID REFERENCES sellers(id) ON DELETE SET NULL,
    owner_name TEXT,
    -- Status
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending', 'rejected', 'out_of_stock')),
    admin_notes TEXT,
    -- Stats
    views INTEGER DEFAULT 0,
    sales INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_owner ON products(owner_id);
CREATE INDEX idx_products_seller ON products(seller_id);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_featured ON products(is_featured) WHERE is_featured = TRUE;

-- =====================================================
-- 7. REVIEWS TABLE
-- =====================================================
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_name TEXT NOT NULL,
    avatar TEXT,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    images TEXT[] DEFAULT '{}',
    is_verified BOOLEAN DEFAULT FALSE,
    is_approved BOOLEAN DEFAULT TRUE,
    helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_reviews_product ON reviews(product_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);

-- =====================================================
-- 8. ORDERS TABLE
-- =====================================================
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number TEXT UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
    -- Financial
    subtotal DECIMAL(15,2) NOT NULL,
    shipping DECIMAL(15,2) DEFAULT 0,
    tax DECIMAL(15,2) DEFAULT 0,
    discount DECIMAL(15,2) DEFAULT 0,
    total DECIMAL(15,2) NOT NULL,
    currency TEXT DEFAULT 'HTG',
    -- Shipping
    shipping_address JSONB NOT NULL,
    tracking_number TEXT,
    estimated_delivery TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    -- Payment
    payment_method TEXT,
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    -- Meta
    notes TEXT,
    cancellation_reason TEXT,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at);
CREATE INDEX idx_orders_number ON orders(order_number);

-- =====================================================
-- 9. ORDER ITEMS TABLE
-- =====================================================
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE SET NULL,
    seller_id UUID REFERENCES sellers(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    sku TEXT,
    image TEXT,
    price DECIMAL(15,2) NOT NULL,
    quantity INTEGER NOT NULL,
    total DECIMAL(15,2) NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);
CREATE INDEX idx_order_items_seller ON order_items(seller_id);

-- =====================================================
-- 10. CONVERSATIONS TABLE (Support/Chat)
-- =====================================================
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_name TEXT NOT NULL,
    user_avatar TEXT,
    subject TEXT NOT NULL,
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'closed', 'pending')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    is_automated BOOLEAN DEFAULT FALSE,
    last_message TEXT,
    last_message_at TIMESTAMP WITH TIME ZONE,
    assigned_to UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_conversations_user ON conversations(user_id);
CREATE INDEX idx_conversations_status ON conversations(status);
CREATE INDEX idx_conversations_assigned ON conversations(assigned_to);

-- =====================================================
-- 11. MESSAGES TABLE
-- =====================================================
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    sender_name TEXT NOT NULL,
    sender_type TEXT NOT NULL CHECK (sender_type IN ('user', 'admin', 'system')),
    content TEXT NOT NULL,
    is_automated BOOLEAN DEFAULT FALSE,
    attachments JSONB DEFAULT '[]',
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_created ON messages(created_at);

-- =====================================================
-- 12. WISHLIST TABLE
-- =====================================================
CREATE TABLE wishlists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

CREATE INDEX idx_wishlists_user ON wishlists(user_id);
CREATE INDEX idx_wishlists_product ON wishlists(product_id);

-- =====================================================
-- 13. CURRENCIES TABLE
-- =====================================================
CREATE TABLE currencies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL CHECK (code IN ('HTG', 'USD', 'EUR', 'DOP')),
    name TEXT NOT NULL,
    symbol TEXT NOT NULL,
    exchange_rate DECIMAL(10,6) NOT NULL DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    is_default BOOLEAN DEFAULT FALSE,
    decimals INTEGER DEFAULT 2,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default currencies
INSERT INTO currencies (code, name, symbol, exchange_rate, is_active, is_default) VALUES
('HTG', 'Gourde Haïtienne', 'G', 0.0076, TRUE, TRUE),
('USD', 'Dollar US', '$', 1.0000, TRUE, FALSE),
('EUR', 'Euro', '€', 1.0800, TRUE, FALSE),
('DOP', 'Peso Dominicain', 'RD$', 0.0170, TRUE, FALSE);

-- =====================================================
-- 14. SHIPPING RATES TABLE
-- =====================================================
CREATE TABLE shipping_rates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    base_rate DECIMAL(10,2) NOT NULL,
    per_kg_rate DECIMAL(10,2) DEFAULT 0,
    free_shipping_threshold DECIMAL(10,2),
    is_active BOOLEAN DEFAULT TRUE,
    priority INTEGER DEFAULT 0,
    country_code TEXT,
    zone_scope TEXT NOT NULL DEFAULT 'global' CHECK (zone_scope IN ('global', 'country', 'department', 'arrondissement', 'commune', 'city', 'custom')),
    zone_values TEXT[] DEFAULT '{}',
    min_quantity INTEGER,
    max_quantity INTEGER,
    category_id TEXT,
    regions TEXT[] DEFAULT '{}',
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default shipping rates
INSERT INTO shipping_rates (name, base_rate, per_kg_rate, free_shipping_threshold, regions) VALUES
('Livraison locale', 500, 100, 10000, ARRAY['Port-au-Prince', 'Pétion-Ville']),
('Livraison nationale', 1000, 200, 20000, ARRAY['Haïti']),
('Livraison internationale', 2500, 500, NULL, ARRAY['International']);

UPDATE shipping_rates
SET
    country_code = CASE
        WHEN name = 'Livraison locale' THEN 'HT'
        WHEN name = 'Livraison nationale' THEN 'HT'
        ELSE NULL
    END,
    zone_scope = CASE
        WHEN name = 'Livraison locale' THEN 'city'
        WHEN name = 'Livraison nationale' THEN 'country'
        WHEN name = 'Livraison internationale' THEN 'country'
        ELSE 'global'
    END,
    zone_values = CASE
        WHEN name = 'Livraison locale' THEN ARRAY['Port-au-Prince', 'Petion-Ville']
        WHEN name = 'Livraison nationale' THEN ARRAY['HT']
        WHEN name = 'Livraison internationale' THEN ARRAY['US', 'CA', 'FR', 'DO']
        ELSE ARRAY[]::TEXT[]
    END,
    priority = CASE
        WHEN name = 'Livraison locale' THEN 40
        WHEN name = 'Livraison nationale' THEN 10
        WHEN name = 'Livraison internationale' THEN 10
        ELSE 0
    END;

-- =====================================================
-- 15. SETTINGS TABLE
-- =====================================================
CREATE TABLE settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    site_name TEXT DEFAULT 'LUXE',
    site_description TEXT DEFAULT 'Votre boutique de luxe en ligne',
    contact_email TEXT DEFAULT 'contact@luxe.com',
    support_phone TEXT DEFAULT '+509 1234-5678',
    maintenance_mode BOOLEAN DEFAULT FALSE,
    allow_new_registrations BOOLEAN DEFAULT TRUE,
    require_email_verification BOOLEAN DEFAULT TRUE,
    seller_commission_rate DECIMAL(5,2) DEFAULT 10.00,
    auto_approve_sellers BOOLEAN DEFAULT FALSE,
    default_shipping_base_rate DECIMAL(10,2) DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default settings
INSERT INTO settings (site_name, site_description) VALUES ('LUXE', 'Votre boutique de luxe en ligne');

-- =====================================================
-- 16. CART ITEMS TABLE (for persistent cart)
-- =====================================================
CREATE TABLE cart_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

CREATE INDEX idx_cart_items_user ON cart_items(user_id);

-- =====================================================
-- 17. AUDIT LOG TABLE
-- =====================================================
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Users: Users can read their own profile, admins can read all
CREATE POLICY "Users can read own profile" ON users
    FOR SELECT USING (auth.uid() = auth_id OR EXISTS (
        SELECT 1 FROM users WHERE auth_id = auth.uid() AND role = 'admin'
    ));

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = auth_id);

-- Addresses: Users can manage their own addresses
CREATE POLICY "Users can manage own addresses" ON addresses
    FOR ALL USING (EXISTS (
        SELECT 1 FROM users WHERE users.id = addresses.user_id AND users.auth_id = auth.uid()
    ));

-- Products: Public read, owners/admins can write
CREATE POLICY "Products are viewable by everyone" ON products
    FOR SELECT USING (status = 'active');

CREATE POLICY "Sellers can manage own products" ON products
    FOR ALL USING (EXISTS (
        SELECT 1 FROM users WHERE users.id = products.owner_id AND users.auth_id = auth.uid()
    ) AND owner_type = 'seller');

CREATE POLICY "Admins can manage all products" ON products
    FOR ALL USING (EXISTS (
        SELECT 1 FROM users WHERE users.auth_id = auth.uid() AND users.role = 'admin'
    ));

-- Orders: Users can view own orders, sellers can view orders with their items
CREATE POLICY "Users can view own orders" ON orders
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM users WHERE users.id = orders.user_id AND users.auth_id = auth.uid()
    ));

CREATE POLICY "Admins can manage all orders" ON orders
    FOR ALL USING (EXISTS (
        SELECT 1 FROM users WHERE users.auth_id = auth.uid() AND users.role = 'admin'
    ));

-- Reviews: Public read, users can manage own
CREATE POLICY "Reviews are viewable by everyone" ON reviews
    FOR SELECT USING (is_approved = TRUE);

CREATE POLICY "Users can create reviews" ON reviews
    FOR INSERT WITH CHECK (EXISTS (
        SELECT 1 FROM users WHERE users.id = reviews.user_id AND users.auth_id = auth.uid()
    ));

CREATE POLICY "Users can update own reviews" ON reviews
    FOR UPDATE USING (EXISTS (
        SELECT 1 FROM users WHERE users.id = reviews.user_id AND users.auth_id = auth.uid()
    ));

-- Wishlists: Users can manage own
CREATE POLICY "Users can manage own wishlist" ON wishlists
    FOR ALL USING (EXISTS (
        SELECT 1 FROM users WHERE users.id = wishlists.user_id AND users.auth_id = auth.uid()
    ));

-- Cart: Users can manage own
CREATE POLICY "Users can manage own cart" ON cart_items
    FOR ALL USING (EXISTS (
        SELECT 1 FROM users WHERE users.id = cart_items.user_id AND users.auth_id = auth.uid()
    ));

-- Conversations: Users can view own, admins can view all
CREATE POLICY "Users can view own conversations" ON conversations
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM users WHERE users.id = conversations.user_id AND users.auth_id = auth.uid()
    ));

CREATE POLICY "Admins can manage all conversations" ON conversations
    FOR ALL USING (EXISTS (
        SELECT 1 FROM users WHERE users.auth_id = auth.uid() AND users.role = 'admin'
    ));

-- Messages: Same as conversations
CREATE POLICY "Users can view own messages" ON messages
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM conversations 
        WHERE conversations.id = messages.conversation_id 
        AND EXISTS (SELECT 1 FROM users WHERE users.id = conversations.user_id AND users.auth_id = auth.uid())
    ));

CREATE POLICY "Admins can manage all messages" ON messages
    FOR ALL USING (EXISTS (
        SELECT 1 FROM users WHERE users.auth_id = auth.uid() AND users.role = 'admin'
    ));

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Update timestamps automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sellers_updated_at BEFORE UPDATE ON sellers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_order_items_updated_at BEFORE UPDATE ON order_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON cart_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update product rating when reviews are added/updated
CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE products
    SET 
        rating = (SELECT AVG(rating)::DECIMAL(3,2) FROM reviews WHERE product_id = NEW.product_id AND is_approved = TRUE),
        review_count = (SELECT COUNT(*) FROM reviews WHERE product_id = NEW.product_id AND is_approved = TRUE)
    WHERE id = NEW.product_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_product_rating_after_review
    AFTER INSERT OR UPDATE OR DELETE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_product_rating();

-- Function to update order totals
CREATE OR REPLACE FUNCTION update_order_total()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE orders
    SET total = (
        SELECT COALESCE(SUM(total), 0) FROM order_items WHERE order_id = NEW.order_id
    ) + shipping + tax - discount
    WHERE id = NEW.order_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_order_total_after_item
    AFTER INSERT OR UPDATE OR DELETE ON order_items
    FOR EACH ROW EXECUTE FUNCTION update_order_total();

-- Function to generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.order_number = 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || substr(md5(random()::text), 1, 6);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_order_number_trigger
    BEFORE INSERT ON orders
    FOR EACH ROW EXECUTE FUNCTION generate_order_number();

-- =====================================================
-- VIEWS FOR CONVENIENCE
-- =====================================================

-- View for active products with seller info
CREATE VIEW active_products AS
SELECT 
    p.*,
    c.name as category_name,
    c.slug as category_slug,
    s.business_name as seller_business_name,
    s.is_verified as seller_verified
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN sellers s ON p.seller_id = s.id
WHERE p.status = 'active';

-- View for order details
DROP VIEW IF EXISTS order_details;
CREATE VIEW order_details AS
SELECT 
    o.*,
    u.first_name || ' ' || u.last_name as customer_name,
    u.email as customer_email,
    COALESCE(
        json_agg(
            json_build_object(
                'id', oi.id,
                'product_id', oi.product_id,
                'name', oi.name,
                'sku', oi.sku,
                'image', oi.image,
                'price', oi.price,
                'quantity', oi.quantity,
                'total', oi.total,
                'status', oi.status
            )
        ) FILTER (WHERE oi.id IS NOT NULL),
        '[]'
    ) as items
FROM orders o
JOIN users u ON o.user_id = u.id
LEFT JOIN order_items oi ON o.id = oi.order_id
GROUP BY o.id, u.first_name, u.last_name, u.email;

-- =====================================================
-- ADMIN USER SETUP (Run after creating auth user)
-- =====================================================
-- After creating admin@luxe.com in Supabase Auth, run:
-- INSERT INTO users (auth_id, email, first_name, last_name, role, phone) 
-- VALUES ('auth-uuid-from-supabase', 'admin@luxe.com', 'Admin', 'LUXE', 'admin', '+509 1234-5678');

-- =====================================================
-- END OF SCHEMA
-- =====================================================
