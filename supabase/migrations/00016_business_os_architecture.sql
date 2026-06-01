-- ============================================
-- MeuQR Business OS — Core Architecture
-- ============================================

-- ============================================
-- 1. BUSINESS VERTICALS
-- ============================================

CREATE TABLE IF NOT EXISTS business_verticals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT NOT NULL DEFAULT 'Store',
  status TEXT NOT NULL DEFAULT 'active',
  default_modules JSONB NOT NULL DEFAULT '[]'::jsonb,
  default_pages JSONB NOT NULL DEFAULT '[]'::jsonb,
  default_navigation JSONB NOT NULL DEFAULT '[]'::jsonb,
  recommended_modules JSONB NOT NULL DEFAULT '[]'::jsonb,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS business_subverticals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vertical_id UUID NOT NULL REFERENCES business_verticals(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  default_modules JSONB NOT NULL DEFAULT '[]'::jsonb,
  default_pages JSONB NOT NULL DEFAULT '[]'::jsonb,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(vertical_id, slug)
);

-- ============================================
-- 2. MODULES
-- ============================================

CREATE TABLE IF NOT EXISTS modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT NOT NULL DEFAULT 'Package',
  category TEXT NOT NULL DEFAULT 'optional',
  is_core BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'active',
  required_plan TEXT NOT NULL DEFAULT 'free',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS business_enabled_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  enabled BOOLEAN NOT NULL DEFAULT true,
  source TEXT NOT NULL DEFAULT 'default_vertical' CHECK (source IN ('default_vertical', 'user_enabled', 'admin_enabled', 'plan_enabled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(business_id, module_id)
);

-- ============================================
-- 3. CUSTOMERS / CRM (BEFORE inbox_items!)
-- ============================================

CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  notes TEXT,
  tags TEXT[] DEFAULT '{}',
  source TEXT NOT NULL DEFAULT 'manual',
  last_interaction_at TIMESTAMPTZ,
  total_visits INTEGER NOT NULL DEFAULT 0,
  total_spent DOUBLE PRECISION NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_customers_business_id ON customers(business_id);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);

-- ============================================
-- 4. INBOX — Universal customer inbox
-- ============================================

CREATE TABLE IF NOT EXISTS inbox_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  source_type TEXT NOT NULL, -- 'contact_form', 'appointment', 'quote_request', 'booking', 'product_inquiry', 'whatsapp_click', 'review', 'document_request'
  source_id TEXT,
  title TEXT NOT NULL,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'open', 'waiting', 'resolved', 'archived')),
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  assigned_to UUID REFERENCES business_members(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- 5. ANALYTICS EVENTS (unified)
-- ============================================

CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  page_id UUID REFERENCES pages(id) ON DELETE SET NULL,
  qr_code_id UUID REFERENCES qr_codes(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL, -- 'page_view', 'qr_scan', 'whatsapp_click', 'product_click', 'appointment_started', 'appointment_submitted', 'quote_submitted', 'form_submitted'
  metadata JSONB DEFAULT '{}'::jsonb,
  visitor_id TEXT,
  device TEXT,
  referrer TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_analytics_events_business_id ON analytics_events(business_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at);

-- ============================================
-- 6. RLS POLICIES
-- ============================================

-- Business Verticals (public read)
ALTER TABLE business_verticals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read verticals" ON business_verticals FOR SELECT USING (true);

-- Business Subverticals (public read)
ALTER TABLE business_subverticals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read subverticals" ON business_subverticals FOR SELECT USING (true);

-- Modules (public read)
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read modules" ON modules FOR SELECT USING (true);

-- Business Enabled Modules
ALTER TABLE business_enabled_modules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can manage enabled modules" ON business_enabled_modules
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM businesses WHERE businesses.id = business_enabled_modules.business_id AND businesses.owner_id = auth.uid()
    )
  );

CREATE POLICY "Staff can read enabled modules" ON business_enabled_modules
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM business_members WHERE business_members.business_id = business_enabled_modules.business_id AND business_members.user_id = auth.uid()
    )
  );

-- Customers
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert customers" ON customers
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM businesses WHERE businesses.id = customers.business_id AND businesses.is_active = true)
  );

CREATE POLICY "Owners and staff can manage customers" ON customers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM businesses WHERE businesses.id = customers.business_id AND (businesses.owner_id = auth.uid() OR
        EXISTS (SELECT 1 FROM business_members WHERE business_members.business_id = customers.business_id AND business_members.user_id = auth.uid())
      )
    )
  );

-- Inbox Items
ALTER TABLE inbox_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert inbox items" ON inbox_items
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM businesses WHERE businesses.id = inbox_items.business_id AND businesses.is_active = true)
  );

CREATE POLICY "Owners and staff can manage inbox" ON inbox_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM businesses WHERE businesses.id = inbox_items.business_id AND (businesses.owner_id = auth.uid() OR
        EXISTS (SELECT 1 FROM business_members WHERE business_members.business_id = inbox_items.business_id AND business_members.user_id = auth.uid())
      )
    )
  );

-- Analytics Events
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert analytics events" ON analytics_events
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM businesses WHERE businesses.id = analytics_events.business_id)
  );

CREATE POLICY "Owners and staff can read analytics" ON analytics_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM businesses WHERE businesses.id = analytics_events.business_id AND (businesses.owner_id = auth.uid() OR
        EXISTS (SELECT 1 FROM business_members WHERE business_members.business_id = analytics_events.business_id AND business_members.user_id = auth.uid())
      )
    )
  );

-- ============================================
-- 7. TRIGGERS
-- ============================================

CREATE TRIGGER update_business_verticals_updated_at
  BEFORE UPDATE ON business_verticals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_business_subverticals_updated_at
  BEFORE UPDATE ON business_subverticals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_modules_updated_at
  BEFORE UPDATE ON modules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_business_enabled_modules_updated_at
  BEFORE UPDATE ON business_enabled_modules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_inbox_items_updated_at
  BEFORE UPDATE ON inbox_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- 8. HELPER FUNCTIONS
-- ============================================

-- Get enabled modules for a business
CREATE OR REPLACE FUNCTION get_enabled_modules_for_business(p_business_id UUID)
RETURNS TABLE (
  module_id UUID,
  module_slug TEXT,
  module_name TEXT,
  module_icon TEXT,
  module_category TEXT,
  is_core BOOLEAN,
  source TEXT,
  enabled BOOLEAN
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT
    m.id,
    m.slug,
    m.name,
    m.icon,
    m.category,
    m.is_core,
    bem.source,
    bem.enabled
  FROM modules m
  JOIN business_enabled_modules bem ON bem.module_id = m.id
  WHERE bem.business_id = p_business_id AND bem.enabled = true
  ORDER BY m.sort_order, m.name;
END;
$$;

-- Auto-enable modules from vertical on business creation
CREATE OR REPLACE FUNCTION auto_enable_modules_for_business()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_default_modules JSONB;
  v_module_slug TEXT;
  v_module_id UUID;
BEGIN
  -- Get default modules from vertical (check vertical_id first, then fallback to category)
  IF NEW.vertical_id IS NOT NULL THEN
    SELECT default_modules INTO v_default_modules
    FROM business_verticals
    WHERE id = NEW.vertical_id;
  ELSE
    -- Try to match by slug
    SELECT default_modules INTO v_default_modules
    FROM business_verticals
    WHERE slug = NEW.category;
  END IF;

  -- If no vertical modules found, use sensible defaults
  IF v_default_modules IS NULL OR jsonb_array_length(v_default_modules) = 0 THEN
    v_default_modules := '["pages", "inbox", "customers", "analytics", "settings"]'::jsonb;
  END IF;

  -- Add core modules (always)
  v_default_modules := v_default_modules || '["overview", "pages", "qr_codes", "inbox", "customers", "analytics", "whatsapp_actions", "notifications", "settings"]'::jsonb;

  -- Remove duplicates
  v_default_modules := (
    SELECT jsonb_agg(DISTINCT value)
    FROM jsonb_array_elements_text(v_default_modules)
  );

  -- Insert each module
  FOR v_module_slug IN SELECT jsonb_array_elements_text(v_default_modules)
  LOOP
    SELECT id INTO v_module_id FROM modules WHERE slug = v_module_slug;
    IF v_module_id IS NOT NULL THEN
      INSERT INTO business_enabled_modules (business_id, module_id, enabled, source)
      VALUES (NEW.id, v_module_id, true, 'default_vertical')
      ON CONFLICT (business_id, module_id) DO NOTHING;
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$;

-- ============================================
-- 9. UPDATE EXISTING TABLES
-- ============================================

-- Add vertical/subvertical references to businesses
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS vertical_id UUID REFERENCES business_verticals(id) ON DELETE SET NULL;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS subvertical_id UUID REFERENCES business_subverticals(id) ON DELETE SET NULL;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS setup_step INTEGER NOT NULL DEFAULT 0;
