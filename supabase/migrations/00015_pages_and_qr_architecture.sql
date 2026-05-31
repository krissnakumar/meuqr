-- ============================================
-- MeuQR - Business -> Pages -> QR Architecture
-- ============================================

-- 1. ALTER EXISTING TABLES TO ADD COLUMNS

-- 1.1 Alter businesses
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS template_id UUID;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS cover_image_url TEXT;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS brand_color TEXT DEFAULT '#4F46E5';
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- 1.2 Alter pages
ALTER TABLE pages ADD COLUMN IF NOT EXISTS page_type TEXT DEFAULT 'custom';
ALTER TABLE pages ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE pages ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft';
ALTER TABLE pages ADD COLUMN IF NOT EXISTS layout_type TEXT DEFAULT 'simple';
ALTER TABLE pages ADD COLUMN IF NOT EXISTS show_in_navigation BOOLEAN DEFAULT true;
ALTER TABLE pages ADD COLUMN IF NOT EXISTS navigation_label TEXT;
ALTER TABLE pages ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;
ALTER TABLE pages ADD COLUMN IF NOT EXISTS qr_code_id UUID;

-- 1.3 Alter qr_codes
ALTER TABLE qr_codes ADD COLUMN IF NOT EXISTS qr_type TEXT DEFAULT 'page';
ALTER TABLE qr_codes ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- 2. CREATE NEW TABLES

-- 2.1 Page Sections (polymorphic blocks)
CREATE TABLE IF NOT EXISTS page_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_id UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  section_type TEXT NOT NULL, -- 'hero', 'text', 'image', 'button', 'product', 'service', 'gallery', 'contact', 'hours', 'whatsapp'
  title TEXT,
  content TEXT,
  image_url TEXT,
  button_label TEXT,
  button_action TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  settings_json JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.2 Navigation Menus
CREATE TABLE IF NOT EXISTS navigation_menus (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  menu_type TEXT DEFAULT 'tabs', -- 'tabs', 'drawer', 'navbar'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.3 Navigation Menu Items
CREATE TABLE IF NOT EXISTS navigation_menu_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  menu_id UUID NOT NULL REFERENCES navigation_menus(id) ON DELETE CASCADE,
  page_id UUID REFERENCES pages(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  icon TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  visible BOOLEAN NOT NULL DEFAULT true
);

-- 2.4 Page Templates (predefined configurations)
CREATE TABLE IF NOT EXISTS page_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_category TEXT NOT NULL, -- 'restaurant', 'clinic', 'construction', 'salon', 'hotel', 'generic'
  page_type TEXT NOT NULL, -- 'home', 'menu', 'products', 'services', 'appointments', 'quote', 'contact', 'custom'
  name TEXT NOT NULL,
  description TEXT,
  default_sections JSONB NOT NULL DEFAULT '[]'::jsonb,
  recommended_for TEXT,
  preview_image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.5 Page Analytics
CREATE TABLE IF NOT EXISTS page_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  page_id UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  qr_code_id UUID REFERENCES qr_codes(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL, -- 'view', 'click_whatsapp', 'click_button', 'scan'
  visitor_id TEXT,
  device TEXT,
  referrer TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. INDEXES
CREATE INDEX IF NOT EXISTS idx_page_sections_page_id ON page_sections(page_id);
CREATE INDEX IF NOT EXISTS idx_navigation_menus_business_id ON navigation_menus(business_id);
CREATE INDEX IF NOT EXISTS idx_navigation_menu_items_menu_id ON navigation_menu_items(menu_id);
CREATE INDEX IF NOT EXISTS idx_page_templates_category ON page_templates(business_category);
CREATE INDEX IF NOT EXISTS idx_page_analytics_page_id ON page_analytics(page_id);
CREATE INDEX IF NOT EXISTS idx_page_analytics_business_id ON page_analytics(business_id);

-- 4. ROW LEVEL SECURITY (RLS)
ALTER TABLE page_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE navigation_menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE navigation_menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_analytics ENABLE ROW LEVEL SECURITY;

-- 4.1 Page sections policies
CREATE POLICY "Public can read visible page sections" ON page_sections
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM pages WHERE pages.id = page_sections.page_id AND (pages.is_published = true OR pages.status = 'published')
    )
  );

CREATE POLICY "Owners can manage page sections" ON page_sections
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM pages
      JOIN businesses ON businesses.id = pages.business_id
      WHERE pages.id = page_sections.page_id AND businesses.owner_id = auth.uid()
    )
  );

CREATE POLICY "Staff can manage page sections" ON page_sections
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM pages
      JOIN business_members ON business_members.business_id = pages.business_id
      WHERE pages.id = page_sections.page_id
      AND business_members.user_id = auth.uid()
      AND business_members.role IN ('admin', 'staff')
    )
  );

-- 4.2 Navigation menus policies
CREATE POLICY "Public can read navigation menus" ON navigation_menus
  FOR SELECT USING (true);

CREATE POLICY "Owners can manage navigation menus" ON navigation_menus
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM businesses WHERE businesses.id = navigation_menus.business_id AND businesses.owner_id = auth.uid()
    )
  );

-- 4.3 Navigation menu items policies
CREATE POLICY "Public can read navigation menu items" ON navigation_menu_items
  FOR SELECT USING (true);

CREATE POLICY "Owners can manage navigation menu items" ON navigation_menu_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM navigation_menus
      JOIN businesses ON businesses.id = navigation_menus.business_id
      WHERE navigation_menus.id = navigation_menu_items.menu_id AND businesses.owner_id = auth.uid()
    )
  );

-- 4.4 Page templates policies
CREATE POLICY "Anyone can read page templates" ON page_templates
  FOR SELECT USING (true);

-- 4.5 Page analytics policies
CREATE POLICY "Anyone can insert page analytics" ON page_analytics
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Owners can view page analytics" ON page_analytics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM businesses WHERE businesses.id = page_analytics.business_id AND businesses.owner_id = auth.uid()
    )
  );

-- 5. TRIGGERS
CREATE TRIGGER update_page_sections_updated_at
  BEFORE UPDATE ON page_sections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_navigation_menus_updated_at
  BEFORE UPDATE ON navigation_menus
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 6. SEED PREDEFINED TEMPLATES

INSERT INTO page_templates (business_category, page_type, name, description, default_sections, recommended_for)
VALUES
  (
    'restaurant',
    'home',
    'Home Page (Restaurante)',
    'Página inicial com descrição, horário, pratos em destaque e contato rápido.',
    '[
      {"section_type": "hero", "title": "Bem-vindo ao nosso Restaurante", "content": "Deliciosas experiências gastronômicas preparadas com carinho.", "button_label": "Ver Cardápio", "button_action": "scroll_to_menu"},
      {"section_type": "hours", "title": "Horário de Funcionamento", "content": "Segunda a Sábado: 11:30 - 23:00\nDomingo: 12:00 - 18:00"},
      {"section_type": "whatsapp", "title": "Fazer Pedido", "button_label": "Pedir via WhatsApp", "button_action": "whatsapp_order"}
    ]'::jsonb,
    'Restaurantes, Pizzarias, Hamburguerias, Cafés'
  ),
  (
    'restaurant',
    'menu',
    'Cardápio Digital',
    'Cardápio completo com categorias de pratos, fotos, preços e integração de pedidos pelo WhatsApp.',
    '[
      {"section_type": "hero", "title": "Nosso Cardápio", "content": "Explore nossas delícias e peça pelo WhatsApp."},
      {"section_type": "product", "title": "Pratos Principais", "content": "Itens do cardápio cadastrados"},
      {"section_type": "whatsapp", "title": "Enviar Pedido", "button_label": "Finalizar Pedido no WhatsApp"}
    ]'::jsonb,
    'Restaurantes, Hamburguerias, Pizzarias'
  ),
  (
    'clinic',
    'home',
    'Home Page (Clínica)',
    'Página de recepção para clínicas ou consultórios com especialidades, equipe e agendamento.',
    '[
      {"section_type": "hero", "title": "Cuidando da Sua Saúde", "content": "Atendimento humanizado e profissionais altamente qualificados.", "button_label": "Agendar Consulta", "button_action": "book_appointment"},
      {"section_type": "service", "title": "Nossos Tratamentos", "content": "Especialidades que oferecemos"},
      {"section_type": "contact", "title": "Fale Conosco", "content": "WhatsApp: (11) 99999-9999\nEndereço: Av. Principal, 1000 - Centro"}
    ]'::jsonb,
    'Consultórios Médicos, Clínicas de Estética, Dentistas, Fisioterapeutas'
  ),
  (
    'clinic',
    'appointments',
    'Agendamento de Consultas',
    'Página integrada para seleção de especialidades, profissionais e datas disponíveis.',
    '[
      {"section_type": "hero", "title": "Marque seu Horário", "content": "Escolha o melhor dia e horário para seu atendimento."},
      {"section_type": "service", "title": "Especialidades Disponíveis", "content": "Selecione o serviço para agendar"}
    ]'::jsonb,
    'Clínicas, Salões de Beleza, Dentistas'
  ),
  (
    'construction',
    'products',
    'Catálogo de Materiais',
    'Exibição de produtos por prateleiras com fotos, descrição, estoque e botão para orçamento.',
    '[
      {"section_type": "hero", "title": "Catálogo de Produtos", "content": "Materiais de qualidade para sua obra ou reforma."},
      {"section_type": "product", "title": "Itens em Destaque"},
      {"section_type": "button", "title": "Solicitar Orçamento", "button_label": "Pedir Orçamento Completo", "button_action": "request_quote"}
    ]'::jsonb,
    'Depósitos de Materiais de Construção, Lojas de Tintas, Ferragens'
  ),
  (
    'construction',
    'quote',
    'Solicitação de Orçamento',
    'Formulário simples para o cliente enviar uma lista de materiais que precisa cotar diretamente no WhatsApp.',
    '[
      {"section_type": "hero", "title": "Solicite um Orçamento", "content": "Envie sua lista de materiais e responderemos rapidamente."},
      {"section_type": "contact", "title": "Contato Direto", "content": "WhatsApp Comercial: (11) 98888-8888"}
    ]'::jsonb,
    'Prestadores de Serviços, Lojas de Materiais'
  )
ON CONFLICT DO NOTHING;
