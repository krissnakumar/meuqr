-- ============================================
-- MeuQR — Page Types, Navigation Modes & Section Types
-- ============================================

-- ============================================
-- 1. ADD page_type CHECK CONSTRAINT
-- ============================================

-- First, normalize existing page_type values that match our types
UPDATE pages
SET page_type = 'home'
WHERE page_type IN ('home', 'inicio', 'início', 'main');

UPDATE pages
SET page_type = 'menu'
WHERE page_type IN ('menu', 'cardapio', 'cardápio');

UPDATE pages
SET page_type = 'custom'
WHERE page_type IS NULL OR page_type = '' OR page_type = 'default';

-- Add CHECK constraint for page_type
ALTER TABLE pages DROP CONSTRAINT IF EXISTS pages_page_type_check;
ALTER TABLE pages ADD CONSTRAINT pages_page_type_check
  CHECK (page_type IN (
    'home',
    'menu',
    'product_catalog',
    'services',
    'appointment_booking',
    'quote_request',
    'contact',
    'about',
    'gallery',
    'promotions',
    'faq',
    'custom'
  ));

-- ============================================
-- 2. ADD layout_type CHECK CONSTRAINT
-- ============================================

ALTER TABLE pages DROP CONSTRAINT IF EXISTS pages_layout_type_check;
ALTER TABLE pages ADD CONSTRAINT pages_layout_type_check
  CHECK (layout_type IN ('simple', 'separate', 'hybrid'));

-- ============================================
-- 3. ADD navigation_mode COLUMN
-- ============================================

-- navigation_mode: 'tab' (same menu with tabs), 'separate' (separate link), 'both'
ALTER TABLE pages ADD COLUMN IF NOT EXISTS navigation_mode TEXT
  DEFAULT 'tab'
  CHECK (navigation_mode IN ('tab', 'separate', 'both'));

-- Migrate existing show_in_navigation to navigation_mode
UPDATE pages
SET navigation_mode = CASE
  WHEN show_in_navigation = true AND layout_type = 'separate' THEN 'both'
  WHEN show_in_navigation = true THEN 'tab'
  ELSE 'separate'
END
WHERE navigation_mode IS NULL OR navigation_mode = 'tab';

-- ============================================
-- 4. ADD page_sections RLS FOR navigation_mode
-- ============================================

-- Add index for faster queries by section_type
CREATE INDEX IF NOT EXISTS idx_page_sections_section_type ON page_sections(section_type);

-- ============================================
-- 5. ADD SEED DATA FOR DEFAULT SECTION TYPES
-- ============================================

-- Insert default page templates with section configurations
INSERT INTO page_templates (business_category, page_type, name, description, default_sections, recommended_for)
VALUES
  (
    'generic',
    'home',
    'Home Page Padrão',
    'Página inicial completa com hero, texto, galeria e contato.',
    '[
      {"section_type": "hero", "title": "Bem-vindo!", "content": "Sua descrição aqui", "button_label": "Fale Conosco", "button_action": "whatsapp"},
      {"section_type": "text", "title": "Sobre Nós", "content": "Conte sua história aqui..."},
      {"section_type": "gallery", "title": "Galeria de Fotos", "content": "Suas melhores imagens"},
      {"section_type": "contact", "title": "Contato", "content": "WhatsApp, telefone e endereço"}
    ]'::jsonb,
    'Qualquer negócio'
  ),
  (
    'generic',
    'contact',
    'Página de Contato',
    'Página com formulário de contato, WhatsApp, telefone e endereço.',
    '[
      {"section_type": "hero", "title": "Entre em Contato", "content": "Estamos prontos para atender você!", "button_label": "Fale pelo WhatsApp", "button_action": "whatsapp"},
      {"section_type": "contact", "title": "Informações de Contato"},
      {"section_type": "hours", "title": "Horário de Atendimento"},
      {"section_type": "faq", "title": "Perguntas Frequentes"}
    ]'::jsonb,
    'Qualquer negócio'
  ),
  (
    'generic',
    'about',
    'Sobre Nós',
    'Página institucional com história, missão e valores.',
    '[
      {"section_type": "hero", "title": "Nossa História", "content": "Conheça nossa trajetória"},
      {"section_type": "text", "title": "Nossa Missão", "content": "Descreva sua missão e valores aqui..."},
      {"section_type": "gallery", "title": "Nossa Equipe", "content": "Conheça nosso time"},
      {"section_type": "contact", "title": "Fale Conosco"}
    ]'::jsonb,
    'Qualquer negócio'
  ),
  (
    'generic',
    'promotions',
    'Página de Promoções',
    'Destaque suas ofertas e promoções especiais.',
    '[
      {"section_type": "hero", "title": "Ofertas Especiais", "content": "Aproveite nossas promoções imperdíveis!", "button_label": "Ver Ofertas", "button_action": "scroll"},
      {"section_type": "promotion_banner", "title": "Promoção do Mês", "content": "Descrição da promoção aqui..."},
      {"section_type": "gallery", "title": "Produtos em Oferta"}
    ]'::jsonb,
    'Varejo, Restaurantes, Salões'
  ),
  (
    'generic',
    'gallery',
    'Galeria de Fotos',
    'Portfólio visual com imagens em destaque.',
    '[
      {"section_type": "hero", "title": "Galeria", "content": "Veja nossos melhores trabalhos", "button_label": "Solicitar Orçamento", "button_action": "quote"},
      {"section_type": "gallery", "title": "Nossos Trabalhos"}
    ]'::jsonb,
    'Fotógrafos, Salões, Eventos'
  )
ON CONFLICT DO NOTHING;
