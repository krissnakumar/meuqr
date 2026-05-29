-- ============================================
-- MeuQR - Complete Database Schema
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. TABLES
-- ============================================

-- 1.1 Profiles (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 1.2 Businesses
CREATE TABLE businesses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  cover_url TEXT,
  phone TEXT,
  whatsapp TEXT,
  pix_key TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  instagram TEXT,
  website TEXT,
  opening_hours JSONB,
  subscription_tier TEXT NOT NULL DEFAULT 'free',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(slug)
);

-- 1.3 Business Members
CREATE TABLE business_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'staff')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(business_id, user_id)
);

-- 1.4 Templates
CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  description TEXT,
  preview_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 1.5 Template Sections
CREATE TABLE template_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 1.6 Template Items
CREATE TABLE template_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section_id UUID NOT NULL REFERENCES template_sections(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price DOUBLE PRECISION,
  image_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 1.7 Pages
CREATE TABLE pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  template_id UUID REFERENCES templates(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  is_published BOOLEAN NOT NULL DEFAULT false,
  custom_css TEXT,
  custom_js TEXT,
  seo_title TEXT,
  seo_description TEXT,
  seo_image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(business_id, slug)
);

-- 1.8 Sections (on pages)
CREATE TABLE sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_id UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  section_type TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 1.9 Items (in sections)
CREATE TABLE items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section_id UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price DOUBLE PRECISION,
  original_price DOUBLE PRECISION,
  image_url TEXT,
  item_type TEXT NOT NULL DEFAULT 'product' CHECK (item_type IN ('product', 'service', 'combo')),
  is_available BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 1.10 QR Codes
CREATE TABLE qr_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  page_id UUID REFERENCES pages(id) ON DELETE SET NULL,
  short_code TEXT NOT NULL UNIQUE,
  title TEXT,
  destination_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  scan_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 1.11 QR Styles
CREATE TABLE qr_styles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  qr_code_id UUID NOT NULL REFERENCES qr_codes(id) ON DELETE CASCADE,
  dot_style TEXT NOT NULL DEFAULT 'rounded',
  corner_style TEXT NOT NULL DEFAULT 'rounded',
  foreground_color TEXT NOT NULL DEFAULT '#111827',
  background_color TEXT NOT NULL DEFAULT '#FFFFFF',
  gradient BOOLEAN NOT NULL DEFAULT false,
  gradient_color TEXT,
  logo_url TEXT,
  margin INTEGER NOT NULL DEFAULT 10,
  error_correction_level TEXT NOT NULL DEFAULT 'M',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(qr_code_id)
);

-- 1.12 Scans
CREATE TABLE scans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  qr_code_id UUID NOT NULL REFERENCES qr_codes(id) ON DELETE CASCADE,
  page_id UUID REFERENCES pages(id) ON DELETE SET NULL,
  ip_address TEXT,
  user_agent TEXT,
  device_type TEXT,
  browser TEXT,
  country TEXT,
  city TEXT,
  referrer TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 1.13 Clicks
CREATE TABLE clicks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scan_id UUID REFERENCES scans(id) ON DELETE SET NULL,
  qr_code_id UUID REFERENCES qr_codes(id) ON DELETE SET NULL,
  page_id UUID REFERENCES pages(id) ON DELETE SET NULL,
  click_type TEXT NOT NULL CHECK (click_type IN ('whatsapp', 'pix', 'phone', 'instagram', 'website', 'maps', 'share', 'quote', 'order')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 1.14 Leads
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  page_id UUID REFERENCES pages(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  message TEXT,
  source TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 1.15 Quote Requests
CREATE TABLE quote_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  page_id UUID REFERENCES pages(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  items JSONB NOT NULL,
  message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 1.16 Orders
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  page_id UUID REFERENCES pages(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  items JSONB NOT NULL,
  total DOUBLE PRECISION NOT NULL,
  payment_method TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 1.17 Subscriptions
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  tier TEXT NOT NULL CHECK (tier IN ('free', 'pro', 'business')),
  provider TEXT NOT NULL CHECK (provider IN ('mercado_pago', 'stripe')),
  provider_subscription_id TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'past_due', 'trialing')),
  current_period_start TIMESTAMPTZ NOT NULL DEFAULT now(),
  current_period_end TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 1.18 Payments
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
  amount DOUBLE PRECISION NOT NULL,
  currency TEXT NOT NULL DEFAULT 'BRL',
  provider TEXT NOT NULL CHECK (provider IN ('mercado_pago', 'stripe')),
  provider_payment_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'refunded')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 1.19 Storage Files (metadata)
CREATE TABLE storage_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  storage_path TEXT NOT NULL,
  public_url TEXT NOT NULL,
  uploaded_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- 2. INDEXES
-- ============================================

CREATE INDEX idx_businesses_owner_id ON businesses(owner_id);
CREATE INDEX idx_businesses_slug ON businesses(slug);
CREATE INDEX idx_businesses_category ON businesses(category);
CREATE INDEX idx_business_members_business_id ON business_members(business_id);
CREATE INDEX idx_business_members_user_id ON business_members(user_id);
CREATE INDEX idx_pages_business_id ON pages(business_id);
CREATE INDEX idx_pages_slug ON pages(slug);
CREATE INDEX idx_sections_page_id ON sections(page_id);
CREATE INDEX idx_items_section_id ON items(section_id);
CREATE INDEX idx_qr_codes_business_id ON qr_codes(business_id);
CREATE INDEX idx_qr_codes_short_code ON qr_codes(short_code);
CREATE INDEX idx_scans_qr_code_id ON scans(qr_code_id);
CREATE INDEX idx_scans_created_at ON scans(created_at);
CREATE INDEX idx_clicks_qr_code_id ON clicks(qr_code_id);
CREATE INDEX idx_clicks_click_type ON clicks(click_type);
CREATE INDEX idx_leads_business_id ON leads(business_id);
CREATE INDEX idx_quote_requests_business_id ON quote_requests(business_id);
CREATE INDEX idx_orders_business_id ON orders(business_id);
CREATE INDEX idx_templates_category ON templates(category);
CREATE INDEX idx_template_sections_template_id ON template_sections(template_id);
CREATE INDEX idx_template_items_section_id ON template_items(section_id);
CREATE INDEX idx_subscriptions_business_id ON subscriptions(business_id);
CREATE INDEX idx_storage_files_business_id ON storage_files(business_id);

-- ============================================
-- 3. ROW LEVEL SECURITY
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_styles ENABLE ROW LEVEL SECURITY;
ALTER TABLE scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage_files ENABLE ROW LEVEL SECURITY;

-- 3.1 Profiles: users can read/update their own profile
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 3.2 Businesses: owners can CRUD, staff can read, public can read active
CREATE POLICY "Public can read active businesses"
  ON businesses FOR SELECT
  USING (is_active = true);

CREATE POLICY "Owners can manage businesses"
  ON businesses FOR ALL
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Staff can view assigned businesses"
  ON businesses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM business_members
      WHERE business_members.business_id = businesses.id
      AND business_members.user_id = auth.uid()
    )
  );

-- 3.3 Business Members: owners/admins can manage, staff can view
CREATE POLICY "Owners can manage members"
  ON business_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = business_members.business_id
      AND businesses.owner_id = auth.uid()
    )
  );

CREATE POLICY "Members can view own memberships"
  ON business_members FOR SELECT
  USING (user_id = auth.uid());

-- 3.4 Templates: public read
CREATE POLICY "Anyone can read templates"
  ON templates FOR SELECT
  USING (true);

CREATE POLICY "Anyone can read template sections"
  ON template_sections FOR SELECT
  USING (true);

CREATE POLICY "Anyone can read template items"
  ON template_items FOR SELECT
  USING (true);

-- 3.5 Pages: public can read published, owners/staff can manage
CREATE POLICY "Public can read published pages"
  ON pages FOR SELECT
  USING (is_published = true);

CREATE POLICY "Owners can manage pages"
  ON pages FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = pages.business_id
      AND businesses.owner_id = auth.uid()
    )
  );

CREATE POLICY "Staff can manage pages"
  ON pages FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM business_members
      WHERE business_members.business_id = pages.business_id
      AND business_members.user_id = auth.uid()
      AND business_members.role IN ('admin', 'staff')
    )
  );

-- 3.6 Sections & Items: same as pages
CREATE POLICY "Public can read visible sections"
  ON sections FOR SELECT
  USING (
    is_visible = true AND EXISTS (
      SELECT 1 FROM pages WHERE pages.id = sections.page_id AND pages.is_published = true
    )
  );

CREATE POLICY "Owners can manage sections"
  ON sections FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM pages
      JOIN businesses ON businesses.id = pages.business_id
      WHERE pages.id = sections.page_id
      AND businesses.owner_id = auth.uid()
    )
  );

CREATE POLICY "Staff can manage sections"
  ON sections FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM pages
      JOIN business_members ON business_members.business_id = pages.business_id
      WHERE pages.id = sections.page_id
      AND business_members.user_id = auth.uid()
      AND business_members.role IN ('admin', 'staff')
    )
  );

CREATE POLICY "Public can read available items"
  ON items FOR SELECT
  USING (
    is_available = true AND EXISTS (
      SELECT 1 FROM sections
      JOIN pages ON pages.id = sections.page_id
      WHERE sections.id = items.section_id
      AND sections.is_visible = true
      AND pages.is_published = true
    )
  );

CREATE POLICY "Owners can manage items"
  ON items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM sections
      JOIN pages ON pages.id = sections.page_id
      JOIN businesses ON businesses.id = pages.business_id
      WHERE sections.id = items.section_id
      AND businesses.owner_id = auth.uid()
    )
  );

CREATE POLICY "Staff can manage items"
  ON items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM sections
      JOIN pages ON pages.id = sections.page_id
      JOIN business_members ON business_members.business_id = pages.business_id
      WHERE sections.id = items.section_id
      AND business_members.user_id = auth.uid()
      AND business_members.role IN ('admin', 'staff')
    )
  );

-- 3.7 QR Codes
CREATE POLICY "Public can read active QR codes"
  ON qr_codes FOR SELECT
  USING (is_active = true);

CREATE POLICY "Owners can manage QR codes"
  ON qr_codes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = qr_codes.business_id
      AND businesses.owner_id = auth.uid()
    )
  );

CREATE POLICY "Staff can manage QR codes"
  ON qr_codes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM business_members
      WHERE business_members.business_id = qr_codes.business_id
      AND business_members.user_id = auth.uid()
      AND business_members.role IN ('admin', 'staff')
    )
  );

-- 3.8 QR Styles
CREATE POLICY "Public can read QR styles"
  ON qr_styles FOR SELECT
  USING (true);

CREATE POLICY "Owners can manage QR styles"
  ON qr_styles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM qr_codes
      JOIN businesses ON businesses.id = qr_codes.business_id
      WHERE qr_codes.id = qr_styles.qr_code_id
      AND businesses.owner_id = auth.uid()
    )
  );

CREATE POLICY "Staff can manage QR styles"
  ON qr_styles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM qr_codes
      JOIN business_members ON business_members.business_id = qr_codes.business_id
      WHERE qr_codes.id = qr_styles.qr_code_id
      AND business_members.user_id = auth.uid()
      AND business_members.role IN ('admin', 'staff')
    )
  );

-- 3.9 Scans: anyone can insert, owners/staff can read
CREATE POLICY "Anyone can insert scans"
  ON scans FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM qr_codes WHERE qr_codes.id = scans.qr_code_id
    )
  );

CREATE POLICY "Owners can read scans"
  ON scans FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM qr_codes
      JOIN businesses ON businesses.id = qr_codes.business_id
      WHERE qr_codes.id = scans.qr_code_id
      AND (businesses.owner_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM business_members
          WHERE business_members.business_id = businesses.id
          AND business_members.user_id = auth.uid()
        )
      )
    )
  );

-- 3.10 Clicks: anyone can insert, owners/staff can read
CREATE POLICY "Anyone can insert clicks"
  ON clicks FOR INSERT
  WITH CHECK (
    (qr_code_id IS NULL OR EXISTS (SELECT 1 FROM qr_codes WHERE qr_codes.id = clicks.qr_code_id))
  );

CREATE POLICY "Owners can read clicks"
  ON clicks FOR SELECT
  USING (
    (qr_code_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM qr_codes
      JOIN businesses ON businesses.id = qr_codes.business_id
      WHERE qr_codes.id = clicks.qr_code_id
      AND (businesses.owner_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM business_members
          WHERE business_members.business_id = businesses.id
          AND business_members.user_id = auth.uid()
        )
      )
    )) OR
    (page_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM pages
      JOIN businesses ON businesses.id = pages.business_id
      WHERE pages.id = clicks.page_id
      AND (businesses.owner_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM business_members
          WHERE business_members.business_id = businesses.id
          AND business_members.user_id = auth.uid()
        )
      )
    ))
  );

-- 3.11 Leads: owners/staff read, public insert
CREATE POLICY "Public can insert leads"
  ON leads FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM businesses WHERE businesses.id = leads.business_id
    )
  );

CREATE POLICY "Owners can read leads"
  ON leads FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = leads.business_id
      AND (businesses.owner_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM business_members
          WHERE business_members.business_id = businesses.id
          AND business_members.user_id = auth.uid()
        )
      )
    )
  );

-- 3.12 Quote Requests
CREATE POLICY "Public can insert quote requests"
  ON quote_requests FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM businesses WHERE businesses.id = quote_requests.business_id)
  );

CREATE POLICY "Owners can read quote requests"
  ON quote_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = quote_requests.business_id
      AND (businesses.owner_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM business_members
          WHERE business_members.business_id = businesses.id
          AND business_members.user_id = auth.uid()
        )
      )
    )
  );

-- 3.13 Orders: public insert, owners read
CREATE POLICY "Public can insert orders"
  ON orders FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM businesses WHERE businesses.id = orders.business_id)
  );

CREATE POLICY "Owners can read orders"
  ON orders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = orders.business_id
      AND (businesses.owner_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM business_members
          WHERE business_members.business_id = businesses.id
          AND business_members.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Owners can update orders"
  ON orders FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = orders.business_id
      AND (businesses.owner_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM business_members
          WHERE business_members.business_id = businesses.id
          AND business_members.user_id = auth.uid()
        )
      )
    )
  );

-- 3.14 Payments: owners read
CREATE POLICY "Owners can read payments"
  ON payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = payments.business_id
      AND businesses.owner_id = auth.uid()
    )
  );

-- 3.15 Subscriptions: owners read
CREATE POLICY "Owners can read subscriptions"
  ON subscriptions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = subscriptions.business_id
      AND businesses.owner_id = auth.uid()
    )
  );

-- 3.16 Storage Files: owners/staff CRUD
CREATE POLICY "Owners can manage storage files"
  ON storage_files FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = storage_files.business_id
      AND (businesses.owner_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM business_members
          WHERE business_members.business_id = businesses.id
          AND business_members.user_id = auth.uid()
          AND business_members.role IN ('admin', 'staff')
        )
      )
    )
  );

-- ============================================
-- 4. TRIGGERS
-- ============================================

-- 4.1 Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_businesses_updated_at
  BEFORE UPDATE ON businesses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_pages_updated_at
  BEFORE UPDATE ON pages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_sections_updated_at
  BEFORE UPDATE ON sections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_items_updated_at
  BEFORE UPDATE ON items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_qr_codes_updated_at
  BEFORE UPDATE ON qr_codes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_qr_styles_updated_at
  BEFORE UPDATE ON qr_styles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 4.2 Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 4.3 Auto-create free subscription when business created
CREATE OR REPLACE FUNCTION handle_new_business()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.subscriptions (business_id, tier, provider, status, current_period_start, current_period_end)
  VALUES (
    NEW.id,
    'free',
    'mercado_pago',
    'active',
    now(),
    now() + INTERVAL '100 years'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_business_created
  AFTER INSERT ON businesses
  FOR EACH ROW EXECUTE FUNCTION handle_new_business();

-- 4.4 Function to increment scan count
CREATE OR REPLACE FUNCTION increment_scan_count(qr_code_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE qr_codes SET scan_count = scan_count + 1 WHERE id = qr_code_id;
END;
$$;

-- Grant execute permission to anon and authenticated roles
GRANT EXECUTE ON FUNCTION increment_scan_count TO anon, authenticated;

-- ============================================
-- 5. SEED TEMPLATES
-- ============================================

-- Insert all predefined templates
INSERT INTO templates (id, name, slug, category, description) VALUES
  ('a0000001-0000-0000-0000-000000000001', 'Restaurante', 'restaurante', 'restaurant', 'Cardápio digital completo com WhatsApp e pedidos'),
  ('a0000001-0000-0000-0000-000000000002', 'Material de Construção', 'material-construcao', 'construction_materials', 'Catálogo completo de materiais com cotação via WhatsApp'),
  ('a0000001-0000-0000-0000-000000000003', 'Salão / Barbearia', 'salao-barbearia', 'salon', 'Portfólio de serviços e agendamento'),
  ('a0000001-0000-0000-0000-000000000004', 'Pet Shop', 'pet-shop', 'pet_shop', 'Serviços e produtos para seu pet'),
  ('a0000001-0000-0000-0000-000000000005', 'Hotel', 'hotel', 'hotel', 'Guia do hóspede digital interativo'),
  ('a0000001-0000-0000-0000-000000000006', 'Imobiliária', 'imobiliaria', 'real_estate', 'Vitrine de imóveis com tour virtual'),
  ('a0000001-0000-0000-0000-000000000007', 'Evento', 'evento', 'event', 'Página interativa para eventos e confraternizações'),
  ('a0000001-0000-0000-0000-000000000008', 'Clínica', 'clinica', 'clinic', 'Serviços médicos e agendamento online'),
  ('a0000001-0000-0000-0000-000000000009', 'Prateleira de Produto', 'prateleira-produto', 'product_shelf', 'Ficha técnica interativa para produtos físicos em lojas'),
  ('a0000001-0000-0000-0000-000000000010', 'Academia', 'academia', 'gym', 'Planos, horários e agenda de aulas'),
  ('a0000001-0000-0000-0000-000000000011', 'Mecânico', 'mecanico', 'mechanic', 'Serviços automotivos e orçamento online'),
  ('a0000001-0000-0000-0000-000000000012', 'Freelancer', 'freelancer', 'freelancer', 'Portfólio profissional e orçamento rápido'),
  ('a0000001-0000-0000-0000-000000000013', 'Igreja', 'igreja', 'church', 'Programação, eventos e doações')
ON CONFLICT (id) DO NOTHING;
