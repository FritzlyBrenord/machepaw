-- =====================================================
-- PROMOTIONS & ANNOUNCEMENTS TABLES
-- =====================================================
-- Run this in your Supabase SQL Editor
-- =====================================================

-- =====================================================
-- 1. FLASH SALES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS flash_sales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    -- Pricing
    sale_price DECIMAL(15,2) NOT NULL,
    original_price DECIMAL(15,2) NOT NULL,
    -- Timing (starts_at is always set to NOW() on creation)
    starts_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
    -- Stock management
    quantity_limit INTEGER NOT NULL DEFAULT 0,  -- 0 = no limit
    quantity_sold INTEGER NOT NULL DEFAULT 0,
    -- Status
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'ended')),
    -- Metadata
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_flash_sales_product ON flash_sales(product_id);
CREATE INDEX IF NOT EXISTS idx_flash_sales_status ON flash_sales(status);
CREATE INDEX IF NOT EXISTS idx_flash_sales_ends_at ON flash_sales(ends_at);
CREATE INDEX IF NOT EXISTS idx_flash_sales_active ON flash_sales(status, ends_at) WHERE status = 'active';

-- =====================================================
-- 2. FLASH SALE PURCHASES (tracking)
-- =====================================================
CREATE TABLE IF NOT EXISTS flash_sale_purchases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    flash_sale_id UUID NOT NULL REFERENCES flash_sales(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(15,2) NOT NULL,
    purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fsp_flash_sale ON flash_sale_purchases(flash_sale_id);
CREATE INDEX IF NOT EXISTS idx_fsp_order ON flash_sale_purchases(order_id);
CREATE INDEX IF NOT EXISTS idx_fsp_user ON flash_sale_purchases(user_id);

-- =====================================================
-- 3. ANNOUNCEMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content TEXT,
    -- Type & Placement
    type TEXT NOT NULL DEFAULT 'banner' CHECK (type IN ('banner', 'popup', 'hero_slide', 'notification_bar')),
    placement TEXT NOT NULL DEFAULT 'hero' CHECK (placement IN ('hero', 'top_bar', 'popup', 'sidebar')),
    -- Media & Link
    image_url TEXT,
    link_url TEXT,
    link_text TEXT,
    -- Display Settings
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    show_on_every_visit BOOLEAN NOT NULL DEFAULT FALSE,
    display_delay_seconds INTEGER NOT NULL DEFAULT 0,
    -- Validity dates
    starts_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ends_at TIMESTAMP WITH TIME ZONE,
    -- Styling
    background_color TEXT DEFAULT '#000000',
    text_color TEXT DEFAULT '#FFFFFF',
    -- Ordering
    priority INTEGER NOT NULL DEFAULT 0,
    -- Analytics
    view_count INTEGER NOT NULL DEFAULT 0,
    click_count INTEGER NOT NULL DEFAULT 0,
    -- Metadata
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_announcements_type ON announcements(type);
CREATE INDEX IF NOT EXISTS idx_announcements_placement ON announcements(placement);
CREATE INDEX IF NOT EXISTS idx_announcements_active ON announcements(is_active, starts_at) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_announcements_priority ON announcements(priority DESC);

-- =====================================================
-- 4. TRIGGERS: Auto-update flash_sale status
-- =====================================================
CREATE OR REPLACE FUNCTION update_flash_sale_status()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.ends_at < NOW() AND NEW.status = 'active' THEN
        NEW.status = 'ended';
    END IF;
    IF NEW.quantity_limit > 0 AND NEW.quantity_sold >= NEW.quantity_limit AND NEW.status = 'active' THEN
        NEW.status = 'ended';
    END IF;
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_flash_sale_status
    BEFORE UPDATE ON flash_sales
    FOR EACH ROW
    EXECUTE FUNCTION update_flash_sale_status();

CREATE OR REPLACE FUNCTION increment_flash_sale_quantity()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE flash_sales
    SET quantity_sold = quantity_sold + NEW.quantity,
        updated_at = NOW()
    WHERE id = NEW.flash_sale_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_flash_sale_purchase
    AFTER INSERT ON flash_sale_purchases
    FOR EACH ROW
    EXECUTE FUNCTION increment_flash_sale_quantity();

-- =====================================================
-- 5. DISABLE RLS (if not using auth)
-- =====================================================
ALTER TABLE flash_sales DISABLE ROW LEVEL SECURITY;
ALTER TABLE flash_sale_purchases DISABLE ROW LEVEL SECURITY;
ALTER TABLE announcements DISABLE ROW LEVEL SECURITY;
