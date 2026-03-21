-- =====================================================
-- PRODUCT ANALYTICS — Views & Demand Tracking
-- =====================================================
-- Run this in Supabase SQL Editor
-- =====================================================

-- Table to track individual product views (for trending/demand)
CREATE TABLE IF NOT EXISTS product_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    session_id TEXT,  -- browser session fingerprint (localStorage UUID)
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_views_product ON product_views(product_id);
CREATE INDEX IF NOT EXISTS idx_product_views_viewed_at ON product_views(viewed_at);
CREATE INDEX IF NOT EXISTS idx_product_views_session ON product_views(session_id);

-- Public read for trending calculations, public insert for anonymous tracking
ALTER TABLE product_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can log product views" ON product_views
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can read product views" ON product_views
    FOR SELECT USING (true);

-- =====================================================
-- View: trending products (last 7 days by view count)
-- =====================================================
CREATE OR REPLACE VIEW trending_products AS
SELECT
    p.*,
    COUNT(pv.id) AS recent_views
FROM products p
LEFT JOIN product_views pv
    ON pv.product_id = p.id
    AND pv.viewed_at >= NOW() - INTERVAL '7 days'
WHERE p.status = 'active'
GROUP BY p.id
ORDER BY recent_views DESC, p.sales DESC;

-- =====================================================
-- END
-- =====================================================
