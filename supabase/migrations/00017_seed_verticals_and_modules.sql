-- ============================================
-- MeuQR Business OS — Seed Verticals & Modules
-- ============================================

-- ============================================
-- 1. SEED MODULES (all modules registry)
-- ============================================

INSERT INTO modules (slug, name, description, icon, category, is_core, required_plan, sort_order) VALUES
  -- Core Modules (always available)
  ('overview', 'Overview', 'Dashboard overview with key metrics', 'LayoutDashboard', 'core', true, 'free', 1),
  ('pages', 'Pages', 'Create and manage your digital pages', 'FileText', 'core', true, 'free', 2),
  ('qr_codes', 'QR Codes', 'Generate and manage QR codes for your pages', 'QrCode', 'core', true, 'free', 3),
  ('media_library', 'Media Library', 'Upload and manage images and files', 'Image', 'core', true, 'free', 4),
  ('inbox', 'Inbox', 'Universal inbox for all customer messages', 'MessageSquare', 'core', true, 'free', 5),
  ('customers', 'Customers', 'Manage your customer relationships', 'Users', 'core', true, 'free', 6),
  ('analytics', 'Analytics', 'Track page views, scans, and customer actions', 'BarChart3', 'core', true, 'free', 7),
  ('whatsapp_actions', 'WhatsApp Actions', 'Configure WhatsApp buttons and message templates', 'MessageCircle', 'core', true, 'free', 8),
  ('reviews', 'Reviews', 'Collect and manage customer reviews', 'Star', 'core', true, 'free', 9),
  ('notifications', 'Notifications', 'Manage push and email notifications', 'Bell', 'core', true, 'free', 10),
  ('settings', 'Settings', 'Configure your business settings', 'Settings', 'core', true, 'free', 11),
  ('billing', 'Billing', 'Manage your subscription and invoices', 'CreditCard', 'core', true, 'free', 12),

  -- Health modules
  ('products', 'Products', 'Manage your product catalog with prices and images', 'Package', 'sell_online', false, 'pro', 20),
  ('services', 'Services', 'Manage your service catalog with durations and pricing', 'Briefcase', 'bookings', false, 'pro', 21),
  ('appointments', 'Appointments', 'Accept and manage customer appointments online', 'Calendar', 'bookings', false, 'pro', 22),
  ('orders', 'Orders', 'Receive and manage customer orders', 'ShoppingCart', 'sell_online', false, 'pro', 23),
  ('reservations', 'Reservations', 'Manage table and room reservations', 'CalendarCheck', 'bookings', false, 'pro', 24),

  -- Communication / Leads
  ('quote_requests', 'Quote Requests', 'Let customers request quotes for products and services', 'ClipboardList', 'leads', false, 'pro', 30),
  ('forms', 'Forms', 'Create custom forms to capture leads and feedback', 'FileSpreadsheet', 'leads', false, 'pro', 31),
  ('campaigns', 'Campaigns', 'Create and manage promotional campaigns', 'Megaphone', 'marketing', false, 'business', 32),

  -- Customer Management
  ('loyalty', 'Loyalty', 'Create loyalty programs and reward customers', 'Gift', 'customer_mgmt', false, 'pro', 40),
  ('coupons', 'Coupons', 'Create discount coupons and promotions', 'TicketPercent', 'marketing', false, 'pro', 41),
  ('documents', 'Documents', 'Upload and share documents with customers', 'FileText', 'customer_mgmt', false, 'business', 42),

  -- Staff
  ('staff', 'Staff', 'Manage your team members and their roles', 'UsersRound', 'staff', false, 'business', 50),
  ('professionals', 'Professionals', 'Manage professionals, their schedules and profiles', 'UserCheck', 'staff', false, 'pro', 51),

  -- Health-specific
  ('patients', 'Patients', 'Manage patient records and medical history', 'HeartPulse', 'health', false, 'pro', 60),
  ('treatments', 'Treatments', 'Manage treatment plans and procedures', 'Stethoscope', 'health', false, 'pro', 61),

  -- Food & Beverage
  ('menu', 'Menu', 'Create and manage your digital menu with categories', 'UtensilsCrossed', 'sell_online', false, 'pro', 70),
  ('tables', 'Tables', 'Manage table reservations for your restaurant', 'Table2', 'bookings', false, 'pro', 71),

  -- Construction
  ('delivery_requests', 'Delivery Requests', 'Manage delivery scheduling and tracking', 'Truck', 'operations', false, 'pro', 80),
  ('bulk_pricing', 'Bulk Pricing', 'Set special prices for bulk orders', 'Percent', 'sell_online', false, 'business', 81),

  -- Real Estate
  ('properties', 'Properties', 'Manage property listings with photos and details', 'Home', 'real_estate', false, 'pro', 90),
  ('leads', 'Leads', 'Track and manage customer leads', 'UserPlus', 'leads', false, 'free', 92),

  -- Hotels
  ('guest_portal', 'Guest Portal', 'Digital guest portal with room service and info', 'Hotel', 'hospitality', false, 'business', 100),
  ('room_service', 'Room Service', 'In-room dining and service requests', 'RoomService', 'hospitality', false, 'business', 101),
  ('concierge', 'Concierge', 'Digital concierge for guest requests', 'ConciergeBell', 'hospitality', false, 'business', 102),

  -- Education
  ('courses', 'Courses', 'Manage your course catalog and enrollments', 'BookOpen', 'education', false, 'pro', 110),
  ('enrollments', 'Enrollments', 'Handle student enrollments and registrations', 'GraduationCap', 'education', false, 'pro', 111),
  ('teachers', 'Teachers', 'Manage teacher profiles and schedules', 'ChalkboardTeacher', 'education', false, 'pro', 112),

  -- Automotive
  ('vehicle_records', 'Vehicle Records', 'Track customer vehicle history and services', 'Car', 'automotive', false, 'pro', 120),
  ('service_orders', 'Service Orders', 'Manage automotive service orders', 'Wrench', 'automotive', false, 'pro', 121),

  -- Events
  ('packages', 'Packages', 'Create service packages and bundles', 'Package', 'sell_online', false, 'pro', 130),
  ('bookings', 'Bookings', 'Manage event bookings and reservations', 'CalendarDays', 'bookings', false, 'pro', 131),
  ('portfolio', 'Portfolio', 'Showcase your work with a visual portfolio', 'Image', 'marketing', false, 'free', 132),

  -- Proposals & Quotes
  ('proposals', 'Proposals', 'Create and send professional proposals', 'FileSignature', 'leads', false, 'business', 140)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  category = EXCLUDED.category,
  is_core = EXCLUDED.is_core,
  required_plan = EXCLUDED.required_plan,
  sort_order = EXCLUDED.sort_order;

-- ============================================
-- 2. SEED BUSINESS VERTICALS
-- ============================================

-- 2.1 Health
INSERT INTO business_verticals (slug, name, description, icon, sort_order, default_modules, default_pages, default_navigation) VALUES
(
  'health',
  'Saúde',
  'Clínicas, consultórios e profissionais de saúde',
  'HeartPulse',
  1,
  '["appointments","services","professionals","patients","forms","documents","whatsapp_actions","reviews"]'::jsonb,
  '[
    {"title":"Início","slug":"home","page_type":"home","show_in_navigation":true},
    {"title":"Serviços","slug":"services","page_type":"services","show_in_navigation":true},
    {"title":"Profissionais","slug":"profissionais","page_type":"professionals","show_in_navigation":true},
    {"title":"Agendar Consulta","slug":"agendar","page_type":"appointment_booking","show_in_navigation":true},
    {"title":"Contato","slug":"contato","page_type":"contact","show_in_navigation":true}
  ]'::jsonb,
  '["overview","pages","appointments","professionals","patients","inbox","qr_codes","analytics","settings"]'::jsonb
);

-- 2.2 Beauty & Wellness
INSERT INTO business_verticals (slug, name, description, icon, sort_order, default_modules, default_pages, default_navigation) VALUES
(
  'beauty_wellness',
  'Beleza & Bem-Estar',
  'Salões, barbearias, spas e estúdios de beleza',
  'Sparkles',
  2,
  '["appointments","services","professionals","packages","loyalty","reviews","whatsapp_actions"]'::jsonb,
  '[
    {"title":"Início","slug":"home","page_type":"home","show_in_navigation":true},
    {"title":"Serviços","slug":"servicos","page_type":"services","show_in_navigation":true},
    {"title":"Profissionais","slug":"profissionais","page_type":"professionals","show_in_navigation":true},
    {"title":"Agendar Horário","slug":"agendar","page_type":"appointment_booking","show_in_navigation":true},
    {"title":"Galeria","slug":"galeria","page_type":"gallery","show_in_navigation":false},
    {"title":"Promoções","slug":"promocoes","page_type":"promotions","show_in_navigation":true},
    {"title":"Contato","slug":"contato","page_type":"contact","show_in_navigation":true}
  ]'::jsonb,
  '["overview","pages","appointments","services","loyalty","inbox","qr_codes","analytics","settings"]'::jsonb
);

-- 2.3 Food & Beverage
INSERT INTO business_verticals (slug, name, description, icon, sort_order, default_modules, default_pages, default_navigation) VALUES
(
  'food_beverage',
  'Alimentação & Bebidas',
  'Restaurantes, cafés, padarias, bares e food trucks',
  'UtensilsCrossed',
  3,
  '["menu","products","orders","reservations","tables","promotions","reviews","whatsapp_actions"]'::jsonb,
  '[
    {"title":"Início","slug":"home","page_type":"home","show_in_navigation":true},
    {"title":"Cardápio","slug":"cardapio","page_type":"menu","show_in_navigation":true},
    {"title":"Promoções","slug":"promocoes","page_type":"promotions","show_in_navigation":true},
    {"title":"Reservas","slug":"reservas","page_type":"reservations","show_in_navigation":true},
    {"title":"Contato","slug":"contato","page_type":"contact","show_in_navigation":true},
    {"title":"Horários","slug":"horarios","page_type":"opening_hours","show_in_navigation":true}
  ]'::jsonb,
  '["overview","pages","menu","orders","reservations","inbox","qr_codes","analytics","settings"]'::jsonb
);

-- 2.4 Construction & Home Improvement
INSERT INTO business_verticals (slug, name, description, icon, sort_order, default_modules, default_pages, default_navigation) VALUES
(
  'construction',
  'Construção & Reforma',
  'Lojas de materiais, ferragens, tintas e acabamentos',
  'Building2',
  4,
  '["products","quote_requests","documents","delivery_requests","bulk_pricing","whatsapp_actions"]'::jsonb,
  '[
    {"title":"Início","slug":"home","page_type":"home","show_in_navigation":true},
    {"title":"Catálogo","slug":"catalogo","page_type":"product_catalog","show_in_navigation":true},
    {"title":"Solicitar Orçamento","slug":"orcamento","page_type":"quote_request","show_in_navigation":true},
    {"title":"Entregas","slug":"entregas","page_type":"delivery_info","show_in_navigation":true},
    {"title":"Marcas","slug":"marcas","page_type":"brands","show_in_navigation":false},
    {"title":"Contato","slug":"contato","page_type":"contact","show_in_navigation":true}
  ]'::jsonb,
  '["overview","pages","products","quote_requests","inbox","qr_codes","analytics","settings"]'::jsonb
);

-- 2.5 Retail
INSERT INTO business_verticals (slug, name, description, icon, sort_order, default_modules, default_pages, default_navigation) VALUES
(
  'retail',
  'Varejo & Lojas',
  'Lojas de roupas, calçados, eletrônicos, móveis e mais',
  'ShoppingBag',
  5,
  '["products","catalog","orders","offers","coupons","loyalty","whatsapp_actions"]'::jsonb,
  '[
    {"title":"Início","slug":"home","page_type":"home","show_in_navigation":true},
    {"title":"Produtos","slug":"produtos","page_type":"product_catalog","show_in_navigation":true},
    {"title":"Ofertas","slug":"ofertas","page_type":"promotions","show_in_navigation":true},
    {"title":"Contato","slug":"contato","page_type":"contact","show_in_navigation":true}
  ]'::jsonb,
  '["overview","pages","products","orders","inbox","qr_codes","analytics","settings"]'::jsonb
);

-- 2.6 Automotive
INSERT INTO business_verticals (slug, name, description, icon, sort_order, default_modules, default_pages, default_navigation) VALUES
(
  'automotive',
  'Automotivo',
  'Oficinas, lava-rápidos, auto peças e serviços automotivos',
  'Car',
  6,
  '["appointments","services","quote_requests","service_orders","customers","vehicle_records","whatsapp_actions"]'::jsonb,
  '[
    {"title":"Início","slug":"home","page_type":"home","show_in_navigation":true},
    {"title":"Serviços","slug":"servicos","page_type":"services","show_in_navigation":true},
    {"title":"Agendar","slug":"agendar","page_type":"appointment_booking","show_in_navigation":true},
    {"title":"Solicitar Orçamento","slug":"orcamento","page_type":"quote_request","show_in_navigation":true},
    {"title":"Contato","slug":"contato","page_type":"contact","show_in_navigation":true}
  ]'::jsonb,
  '["overview","pages","appointments","services","quote_requests","inbox","qr_codes","analytics","settings"]'::jsonb
);

-- 2.7 Real Estate
INSERT INTO business_verticals (slug, name, description, icon, sort_order, default_modules, default_pages, default_navigation) VALUES
(
  'real_estate',
  'Imobiliário',
  'Imobiliárias, corretores e administradoras de imóveis',
  'Home',
  7,
  '["properties","leads","appointments","forms","documents","whatsapp_actions"]'::jsonb,
  '[
    {"title":"Início","slug":"home","page_type":"home","show_in_navigation":true},
    {"title":"Imóveis","slug":"imoveis","page_type":"properties","show_in_navigation":true},
    {"title":"Corretores","slug":"corretores","page_type":"agents","show_in_navigation":true},
    {"title":"Agendar Visita","slug":"visita","page_type":"schedule_visit","show_in_navigation":true},
    {"title":"Contato","slug":"contato","page_type":"contact","show_in_navigation":true}
  ]'::jsonb,
  '["overview","pages","properties","leads","inbox","qr_codes","analytics","settings"]'::jsonb
);

-- 2.8 Hotels & Tourism
INSERT INTO business_verticals (slug, name, description, icon, sort_order, default_modules, default_pages, default_navigation) VALUES
(
  'hotels_tourism',
  'Hotéis & Turismo',
  'Hotéis, pousadas, agências de viagem e guias turísticos',
  'Hotel',
  8,
  '["guest_portal","bookings","room_service","documents","reviews","whatsapp_actions"]'::jsonb,
  '[
    {"title":"Início","slug":"home","page_type":"home","show_in_navigation":true},
    {"title":"Quartos","slug":"quartos","page_type":"rooms","show_in_navigation":true},
    {"title":"Serviços","slug":"servicos","page_type":"guest_services","show_in_navigation":true},
    {"title":"Guia Local","slug":"guia","page_type":"local_guide","show_in_navigation":true},
    {"title":"Contato","slug":"contato","page_type":"contact","show_in_navigation":true}
  ]'::jsonb,
  '["overview","pages","bookings","guest_portal","inbox","qr_codes","analytics","settings"]'::jsonb
);

-- 2.9 Education
INSERT INTO business_verticals (slug, name, description, icon, sort_order, default_modules, default_pages, default_navigation) VALUES
(
  'education',
  'Educação',
  'Escolas, cursos e centros de treinamento',
  'BookOpen',
  9,
  '["courses","enrollments","teachers","events","documents","leads","whatsapp_actions"]'::jsonb,
  '[
    {"title":"Início","slug":"home","page_type":"home","show_in_navigation":true},
    {"title":"Cursos","slug":"cursos","page_type":"courses","show_in_navigation":true},
    {"title":"Professores","slug":"professores","page_type":"teachers","show_in_navigation":true},
    {"title":"Matrícula","slug":"matricula","page_type":"enrollment","show_in_navigation":true},
    {"title":"Eventos","slug":"eventos","page_type":"events","show_in_navigation":true},
    {"title":"Contato","slug":"contato","page_type":"contact","show_in_navigation":true}
  ]'::jsonb,
  '["overview","pages","courses","enrollments","inbox","qr_codes","analytics","settings"]'::jsonb
);

-- 2.10 Professional Services
INSERT INTO business_verticals (slug, name, description, icon, sort_order, default_modules, default_pages, default_navigation) VALUES
(
  'professional_services',
  'Serviços Profissionais',
  'Advogados, contadores, consultores, arquitetos e engenheiros',
  'Briefcase',
  10,
  '["appointments","services","forms","documents","leads","proposals","whatsapp_actions"]'::jsonb,
  '[
    {"title":"Início","slug":"home","page_type":"home","show_in_navigation":true},
    {"title":"Serviços","slug":"servicos","page_type":"services","show_in_navigation":true},
    {"title":"Agendar Consulta","slug":"agendar","page_type":"appointment_booking","show_in_navigation":true},
    {"title":"Documentos","slug":"documentos","page_type":"documents","show_in_navigation":true},
    {"title":"Contato","slug":"contato","page_type":"contact","show_in_navigation":true}
  ]'::jsonb,
  '["overview","pages","appointments","services","leads","inbox","qr_codes","analytics","settings"]'::jsonb
);

-- 2.11 Events
INSERT INTO business_verticals (slug, name, description, icon, sort_order, default_modules, default_pages, default_navigation) VALUES
(
  'events',
  'Eventos',
  'Organizadores, buffets, fotógrafos e espaços para eventos',
  'Calendar',
  11,
  '["packages","bookings","portfolio","quote_requests","reviews","whatsapp_actions"]'::jsonb,
  '[
    {"title":"Início","slug":"home","page_type":"home","show_in_navigation":true},
    {"title":"Pacotes","slug":"pacotes","page_type":"packages","show_in_navigation":true},
    {"title":"Portfólio","slug":"portfolio","page_type":"portfolio","show_in_navigation":true},
    {"title":"Solicitar Orçamento","slug":"orcamento","page_type":"quote_request","show_in_navigation":true},
    {"title":"Contato","slug":"contato","page_type":"contact","show_in_navigation":true}
  ]'::jsonb,
  '["overview","pages","packages","bookings","quote_requests","inbox","qr_codes","analytics","settings"]'::jsonb
);

-- ============================================
-- 3. SEED SUBVERTICALS
-- ============================================

-- 3.1 Health subverticals
WITH health AS (SELECT id FROM business_verticals WHERE slug = 'health')
INSERT INTO business_subverticals (vertical_id, slug, name, description, icon, default_modules, default_pages, sort_order) VALUES
((SELECT id FROM health), 'medical_clinic', 'Clínica Médica', 'Consultas e exames médicos', 'Stethoscope',
  '["appointments","services","professionals","forms","documents"]'::jsonb,
  '[{"title":"Início","slug":"home","page_type":"home"},{"title":"Especialidades","slug":"especialidades","page_type":"services"},{"title":"Médicos","slug":"medicos","page_type":"professionals"},{"title":"Agendar Consulta","slug":"agendar","page_type":"appointment_booking"},{"title":"Contato","slug":"contato","page_type":"contact"}]'::jsonb, 1),
((SELECT id FROM health), 'dental_clinic', 'Clínica Odontológica', 'Tratamentos dentários e estética dental', 'Tooth',
  '["appointments","services","professionals","patients","treatments","forms"]'::jsonb,
  '[{"title":"Início","slug":"home","page_type":"home"},{"title":"Tratamentos","slug":"tratamentos","page_type":"services"},{"title":"Dentistas","slug":"dentistas","page_type":"professionals"},{"title":"Agendar Consulta","slug":"agendar","page_type":"appointment_booking"},{"title":"Contato","slug":"contato","page_type":"contact"}]'::jsonb, 2),
((SELECT id FROM health), 'physiotherapy', 'Fisioterapia', 'Reabilitação e pilates', 'Activity',
  '["appointments","services","professionals","forms","documents"]'::jsonb,
  '[{"title":"Início","slug":"home","page_type":"home"},{"title":"Tratamentos","slug":"tratamentos","page_type":"services"},{"title":"Fisioterapeutas","slug":"fisioterapeutas","page_type":"professionals"},{"title":"Agendar Sessão","slug":"agendar","page_type":"appointment_booking"},{"title":"Contato","slug":"contato","page_type":"contact"}]'::jsonb, 3),
((SELECT id FROM health), 'psychology', 'Consultório de Psicologia', 'Sessões de psicoterapia', 'Brain',
  '["appointments","services","forms","documents"]'::jsonb,
  '[{"title":"Início","slug":"home","page_type":"home"},{"title":"Serviços","slug":"servicos","page_type":"services"},{"title":"Agendar Sessão","slug":"agendar","page_type":"appointment_booking"},{"title":"Contato","slug":"contato","page_type":"contact"}]'::jsonb, 4),
((SELECT id FROM health), 'veterinary', 'Clínica Veterinária', 'Cuidados para animais de estimação', 'Dog',
  '["appointments","services","professionals","products","forms"]'::jsonb,
  '[{"title":"Início","slug":"home","page_type":"home"},{"title":"Serviços","slug":"servicos","page_type":"services"},{"title":"Agendar Consulta","slug":"agendar","page_type":"appointment_booking"},{"title":"Contato","slug":"contato","page_type":"contact"}]'::jsonb, 5),
((SELECT id FROM health), 'nutritionist', 'Nutricionista', 'Consultas e planos alimentares', 'Apple',
  '["appointments","services","forms","documents"]'::jsonb,
  '[{"title":"Início","slug":"home","page_type":"home"},{"title":"Serviços","slug":"servicos","page_type":"services"},{"title":"Agendar Consulta","slug":"agendar","page_type":"appointment_booking"},{"title":"Contato","slug":"contato","page_type":"contact"}]'::jsonb, 6),
((SELECT id FROM health), 'eye_clinic', 'Clínica Oftalmológica', 'Exames e tratamentos oftalmológicos', 'Eye',
  '["appointments","services","professionals","forms"]'::jsonb,
  '[{"title":"Início","slug":"home","page_type":"home"},{"title":"Exames","slug":"exames","page_type":"services"},{"title":"Médicos","slug":"medicos","page_type":"professionals"},{"title":"Agendar Consulta","slug":"agendar","page_type":"appointment_booking"},{"title":"Contato","slug":"contato","page_type":"contact"}]'::jsonb, 7),
((SELECT id FROM health), 'speech_therapy', 'Fonoaudiologia', 'Terapia fonoaudiológica', 'Speech',
  '["appointments","services","professionals","forms"]'::jsonb,
  '[{"title":"Início","slug":"home","page_type":"home"},{"title":"Serviços","slug":"servicos","page_type":"services"},{"title":"Agendar Sessão","slug":"agendar","page_type":"appointment_booking"},{"title":"Contato","slug":"contato","page_type":"contact"}]'::jsonb, 8),
((SELECT id FROM health), 'chiropractic', 'Quiropraxia', 'Ajustes quiropráticos e correção postural', 'Bone',
  '["appointments","services","professionals","forms"]'::jsonb,
  '[{"title":"Início","slug":"home","page_type":"home"},{"title":"Serviços","slug":"servicos","page_type":"services"},{"title":"Agendar Sessão","slug":"agendar","page_type":"appointment_booking"},{"title":"Contato","slug":"contato","page_type":"contact"}]'::jsonb, 9);

-- 3.2 Beauty & Wellness subverticals
WITH beauty AS (SELECT id FROM business_verticals WHERE slug = 'beauty_wellness')
INSERT INTO business_subverticals (vertical_id, slug, name, description, icon, default_modules, default_pages, sort_order) VALUES
((SELECT id FROM beauty), 'beauty_salon', 'Salão de Beleza', 'Corte, coloração, unhas e estética', 'Scissors',
  '["appointments","services","professionals","packages","loyalty","reviews"]'::jsonb,
  '[{"title":"Início","slug":"home","page_type":"home"},{"title":"Serviços","slug":"servicos","page_type":"services"},{"title":"Profissionais","slug":"profissionais","page_type":"professionals"},{"title":"Agendar","slug":"agendar","page_type":"appointment_booking"},{"title":"Galeria","slug":"galeria","page_type":"gallery"},{"title":"Contato","slug":"contato","page_type":"contact"}]'::jsonb, 1),
((SELECT id FROM beauty), 'barber_shop', 'Barbearia', 'Corte masculino, barba e cuidados', 'Beard',
  '["appointments","services","professionals","reviews"]'::jsonb,
  '[{"title":"Início","slug":"home","page_type":"home"},{"title":"Serviços","slug":"servicos","page_type":"services"},{"title":"Agendar","slug":"agendar","page_type":"appointment_booking"},{"title":"Galeria","slug":"galeria","page_type":"gallery"},{"title":"Contato","slug":"contato","page_type":"contact"}]'::jsonb, 2),
((SELECT id FROM beauty), 'nail_studio', 'Estúdio de Unhas', 'Alongamento, nail art e cuidados', 'Hand',
  '["appointments","services","packages","reviews"]'::jsonb,
  '[{"title":"Início","slug":"home","page_type":"home"},{"title":"Serviços","slug":"servicos","page_type":"services"},{"title":"Agendar","slug":"agendar","page_type":"appointment_booking"},{"title":"Galeria","slug":"galeria","page_type":"gallery"},{"title":"Contato","slug":"contato","page_type":"contact"}]'::jsonb, 3),
((SELECT id FROM beauty), 'spa', 'Spa & Massagem', 'Massagens, ofurô e tratamentos relaxantes', 'Flower2',
  '["appointments","services","packages","reviews"]'::jsonb,
  '[{"title":"Início","slug":"home","page_type":"home"},{"title":"Tratamentos","slug":"tratamentos","page_type":"services"},{"title":"Agendar","slug":"agendar","page_type":"appointment_booking"},{"title":"Contato","slug":"contato","page_type":"contact"}]'::jsonb, 4),
((SELECT id FROM beauty), 'massage_therapist', 'Massoterapeuta', 'Massagem relaxante e terapêutica', 'Sparkles',
  '["appointments","services","reviews"]'::jsonb,
  '[{"title":"Início","slug":"home","page_type":"home"},{"title":"Serviços","slug":"servicos","page_type":"services"},{"title":"Agendar","slug":"agendar","page_type":"appointment_booking"},{"title":"Contato","slug":"contato","page_type":"contact"}]'::jsonb, 5),
((SELECT id FROM beauty), 'tattoo_studio', 'Estúdio de Tatuagem', 'Tatuagem e body piercing', 'Palette',
  '["appointments","services","portfolio","reviews"]'::jsonb,
  '[{"title":"Início","slug":"home","page_type":"home"},{"title":"Serviços","slug":"servicos","page_type":"services"},{"title":"Portfólio","slug":"portfolio","page_type":"portfolio"},{"title":"Agendar","slug":"agendar","page_type":"appointment_booking"},{"title":"Contato","slug":"contato","page_type":"contact"}]'::jsonb, 6),
((SELECT id FROM beauty), 'aesthetic_clinic', 'Clínica Estética', 'Procedimentos estéticos e harmonização', 'Wand',
  '["appointments","services","professionals","packages","forms"]'::jsonb,
  '[{"title":"Início","slug":"home","page_type":"home"},{"title":"Procedimentos","slug":"procedimentos","page_type":"services"},{"title":"Agendar","slug":"agendar","page_type":"appointment_booking"},{"title":"Contato","slug":"contato","page_type":"contact"}]'::jsonb, 7),
((SELECT id FROM beauty), 'laser_clinic', 'Clínica de Laser', 'Depilação a laser e tratamentos', 'Zap',
  '["appointments","services","professionals","packages"]'::jsonb,
  '[{"title":"Início","slug":"home","page_type":"home"},{"title":"Tratamentos","slug":"tratamentos","page_type":"services"},{"title":"Agendar","slug":"agendar","page_type":"appointment_booking"},{"title":"Contato","slug":"contato","page_type":"contact"}]'::jsonb, 8);

-- 3.3 Food & Beverage subverticals
WITH food AS (SELECT id FROM business_verticals WHERE slug = 'food_beverage')
INSERT INTO business_subverticals (vertical_id, slug, name, description, icon, default_modules, default_pages, sort_order) VALUES
((SELECT id FROM food), 'restaurant', 'Restaurante', 'Refeições completas e à la carte', 'UtensilsCrossed',
  '["menu","products","orders","reservations","reviews","whatsapp_actions"]'::jsonb,
  '[{"title":"Início","slug":"home","page_type":"home"},{"title":"Cardápio","slug":"cardapio","page_type":"menu"},{"title":"Reservas","slug":"reservas","page_type":"reservations"},{"title":"Contato","slug":"contato","page_type":"contact"}]'::jsonb, 1),
((SELECT id FROM food), 'cafe', 'Cafeteria', 'Cafés especiais e bebidas', 'Coffee',
  '["menu","products","orders","reviews"]'::jsonb,
  '[{"title":"Início","slug":"home","page_type":"home"},{"title":"Cardápio","slug":"cardapio","page_type":"menu"},{"title":"Contato","slug":"contato","page_type":"contact"}]'::jsonb, 2),
((SELECT id FROM food), 'bakery', 'Padaria & Confeitaria', 'Pães, doces e salgados', 'Bread',
  '["products","orders","reviews","whatsapp_actions"]'::jsonb,
  '[{"title":"Início","slug":"home","page_type":"home"},{"title":"Produtos","slug":"produtos","page_type":"product_catalog"},{"title":"Contato","slug":"contato","page_type":"contact"}]'::jsonb, 3),
((SELECT id FROM food), 'pizza_shop', 'Pizzaria', 'Pizza tradicional e especial', 'Pizza',
  '["menu","products","orders","reviews","whatsapp_actions"]'::jsonb,
  '[{"title":"Início","slug":"home","page_type":"home"},{"title":"Cardápio","slug":"cardapio","page_type":"menu"},{"title":"Promoções","slug":"promocoes","page_type":"promotions"},{"title":"Contato","slug":"contato","page_type":"contact"}]'::jsonb, 4),
((SELECT id FROM food), 'burger_shop', 'Hamburgueria', 'Hambúrgueres artesanais e combos', 'Sandwich',
  '["menu","products","orders","reviews","whatsapp_actions"]'::jsonb,
  '[{"title":"Início","slug":"home","page_type":"home"},{"title":"Cardápio","slug":"cardapio","page_type":"menu"},{"title":"Contato","slug":"contato","page_type":"contact"}]'::jsonb, 5),
((SELECT id FROM food), 'food_truck', 'Food Truck', 'Comida sobre rodas', 'Truck',
  '["menu","products","orders","reviews","whatsapp_actions"]'::jsonb,
  '[{"title":"Início","slug":"home","page_type":"home"},{"title":"Cardápio","slug":"cardapio","page_type":"menu"},{"title":"Localização","slug":"localizacao","page_type":"location"},{"title":"Contato","slug":"contato","page_type":"contact"}]'::jsonb, 6),
((SELECT id FROM food), 'ice_cream_shop', 'Sorveteria', 'Sorvetes, açaí e sobremesas geladas', 'IceCream',
  '["products","orders","reviews","whatsapp_actions"]'::jsonb,
  '[{"title":"Início","slug":"home","page_type":"home"},{"title":"Cardápio","slug":"cardapio","page_type":"menu"},{"title":"Contato","slug":"contato","page_type":"contact"}]'::jsonb, 7),
((SELECT id FROM food), 'bar_pub', 'Bar & Pub', 'Bebidas, petiscos e música', 'Wine',
  '["menu","products","orders","reservations","reviews"]'::jsonb,
  '[{"title":"Início","slug":"home","page_type":"home"},{"title":"Cardápio","slug":"cardapio","page_type":"menu"},{"title":"Reservas","slug":"reservas","page_type":"reservations"},{"title":"Contato","slug":"contato","page_type":"contact"}]'::jsonb, 8);

-- 3.4 Construction subverticals
WITH construction AS (SELECT id FROM business_verticals WHERE slug = 'construction')
INSERT INTO business_subverticals (vertical_id, slug, name, description, icon, default_modules, default_pages, sort_order) VALUES
((SELECT id FROM construction), 'construction_materials', 'Material de Construção', 'Cimento, areia, tijolos e acabamentos', 'Building2',
  '["products","quote_requests","delivery_requests","bulk_pricing","documents"]'::jsonb,
  '[{"title":"Início","slug":"home","page_type":"home"},{"title":"Catálogo","slug":"catalogo","page_type":"product_catalog"},{"title":"Orçamento","slug":"orcamento","page_type":"quote_request"},{"title":"Entregas","slug":"entregas","page_type":"delivery_info"},{"title":"Contato","slug":"contato","page_type":"contact"}]'::jsonb, 1),
((SELECT id FROM construction), 'paint_store', 'Loja de Tintas', 'Tintas, vernizes e acessórios', 'PaintBucket',
  '["products","quote_requests","documents"]'::jsonb,
  '[{"title":"Início","slug":"home","page_type":"home"},{"title":"Produtos","slug":"produtos","page_type":"product_catalog"},{"title":"Orçamento","slug":"orcamento","page_type":"quote_request"},{"title":"Contato","slug":"contato","page_type":"contact"}]'::jsonb, 2),
((SELECT id FROM construction), 'electrical_store', 'Loja de Materiais Elétricos', 'Fios, cabos, disjuntores e iluminação', 'Zap',
  '["products","quote_requests","documents"]'::jsonb,
  '[{"title":"Início","slug":"home","page_type":"home"},{"title":"Produtos","slug":"produtos","page_type":"product_catalog"},{"title":"Orçamento","slug":"orcamento","page_type":"quote_request"},{"title":"Contato","slug":"contato","page_type":"contact"}]'::jsonb, 3),
((SELECT id FROM construction), 'plumbing_store', 'Loja de Materiais Hidráulicos', 'Tubos, conexões e louças', 'Droplet',
  '["products","quote_requests","documents"]'::jsonb,
  '[{"title":"Início","slug":"home","page_type":"home"},{"title":"Produtos","slug":"produtos","page_type":"product_catalog"},{"title":"Orçamento","slug":"orcamento","page_type":"quote_request"},{"title":"Contato","slug":"contato","page_type":"contact"}]'::jsonb, 4),
((SELECT id FROM construction), 'hardware_store', 'Loja de Ferragens', 'Ferramentas, fechaduras e parafusos', 'Wrench',
  '["products","quote_requests","documents"]'::jsonb,
  '[{"title":"Início","slug":"home","page_type":"home"},{"title":"Produtos","slug":"produtos","page_type":"product_catalog"},{"title":"Orçamento","slug":"orcamento","page_type":"quote_request"},{"title":"Contato","slug":"contato","page_type":"contact"}]'::jsonb, 5),
((SELECT id FROM construction), 'flooring_store', 'Loja de Pisos', 'Pisos, porcelanatos e revestimentos', 'Grid3x3',
  '["products","quote_requests","documents"]'::jsonb,
  '[{"title":"Início","slug":"home","page_type":"home"},{"title":"Produtos","slug":"produtos","page_type":"product_catalog"},{"title":"Orçamento","slug":"orcamento","page_type":"quote_request"},{"title":"Contato","slug":"contato","page_type":"contact"}]'::jsonb, 6),
((SELECT id FROM construction), 'tool_rental', 'Locadora de Ferramentas', 'Aluguel de ferramentas e equipamentos', 'Drill',
  '["products","quote_requests","delivery_requests"]'::jsonb,
  '[{"title":"Início","slug":"home","page_type":"home"},{"title":"Equipamentos","slug":"equipamentos","page_type":"product_catalog"},{"title":"Orçamento","slug":"orcamento","page_type":"quote_request"},{"title":"Contato","slug":"contato","page_type":"contact"}]'::jsonb, 7);

-- 3.5 Retail subverticals
WITH retail AS (SELECT id FROM business_verticals WHERE slug = 'retail')
INSERT INTO business_subverticals (vertical_id, slug, name, description, icon, default_modules, default_pages, sort_order) VALUES
((SELECT id FROM retail), 'clothing_store', 'Loja de Roupas', 'Moda feminina, masculina e infantil', 'Shirt',
  '["products","orders","coupons","loyalty","whatsapp_actions"]'::jsonb,
  '[{"title":"Início","slug":"home","page_type":"home"},{"title":"Produtos","slug":"produtos","page_type":"product_catalog"},{"title":"Ofertas","slug":"ofertas","page_type":"promotions"},{"title":"Contato","slug":"contato","page_type":"contact"}]'::jsonb, 1),
((SELECT id FROM retail), 'shoe_store', 'Loja de Calçados', 'Sapatos, tênis e sandálias', 'Footprints',
  '["products","orders","coupons","whatsapp_actions"]'::jsonb,
  '[{"title":"Início","slug":"home","page_type":"home"},{"title":"Produtos","slug":"produtos","page_type":"product_catalog"},{"title":"Contato","slug":"contato","page_type":"contact"}]'::jsonb, 2),
((SELECT id FROM retail), 'jewelry_store', 'Joalheria', 'Joias, relógios e semijoias', 'Gem',
  '["products","orders","portfolio","whatsapp_actions"]'::jsonb,
  '[{"title":"Início","slug":"home","page_type":"home"},{"title":"Produtos","slug":"produtos","page_type":"product_catalog"},{"title":"Contato","slug":"contato","page_type":"contact"}]'::jsonb, 3),
((SELECT id FROM retail), 'electronics_store', 'Loja de Eletrônicos', 'Eletrônicos e acessórios', 'Monitor',
  '["products","orders","coupons","whatsapp_actions"]'::jsonb,
  '[{"title":"Início","slug":"home","page_type":"home"},{"title":"Produtos","slug":"produtos","page_type":"product_catalog"},{"title":"Contato","slug":"contato","page_type":"contact"}]'::jsonb, 4),
((SELECT id FROM retail), 'toy_store', 'Loja de Brinquedos', 'Brinquedos e jogos', 'ToyBrick',
  '["products","orders","whatsapp_actions"]'::jsonb,
  '[{"title":"Início","slug":"home","page_type":"home"},{"title":"Produtos","slug":"produtos","page_type":"product_catalog"},{"title":"Contato","slug":"contato","page_type":"contact"}]'::jsonb, 5),
((SELECT id FROM retail), 'pet_store', 'Pet Shop', 'Produtos e acessórios para pets', 'Dog',
  '["products","orders","services","loyalty","whatsapp_actions"]'::jsonb,
  '[{"title":"Início","slug":"home","page_type":"home"},{"title":"Produtos","slug":"produtos","page_type":"product_catalog"},{"title":"Serviços","slug":"servicos","page_type":"services"},{"title":"Contato","slug":"contato","page_type":"contact"}]'::jsonb, 6),
((SELECT id FROM retail), 'gift_shop', 'Loja de Presentes', 'Presentes e lembranças', 'Gift',
  '["products","orders","whatsapp_actions"]'::jsonb,
  '[{"title":"Início","slug":"home","page_type":"home"},{"title":"Produtos","slug":"produtos","page_type":"product_catalog"},{"title":"Contato","slug":"contato","page_type":"contact"}]'::jsonb, 7),
((SELECT id FROM retail), 'furniture_store', 'Loja de Móveis', 'Móveis e decoração', 'Sofa',
  '["products","orders","quote_requests","whatsapp_actions"]'::jsonb,
  '[{"title":"Início","slug":"home","page_type":"home"},{"title":"Produtos","slug":"produtos","page_type":"product_catalog"},{"title":"Contato","slug":"contato","page_type":"contact"}]'::jsonb, 8),
((SELECT id FROM retail), 'supermarket', 'Supermercado', 'Alimentos e itens de mercearia', 'ShoppingCart',
  '["products","orders","coupons","whatsapp_actions"]'::jsonb,
  '[{"title":"Início","slug":"home","page_type":"home"},{"title":"Produtos","slug":"produtos","page_type":"product_catalog"},{"title":"Ofertas","slug":"ofertas","page_type":"promotions"},{"title":"Contato","slug":"contato","page_type":"contact"}]'::jsonb, 9),
((SELECT id FROM retail), 'pharmacy', 'Farmácia', 'Medicamentos e produtos farmacêuticos', 'Pill',
  '["products","orders","whatsapp_actions"]'::jsonb,
  '[{"title":"Início","slug":"home","page_type":"home"},{"title":"Produtos","slug":"produtos","page_type":"product_catalog"},{"title":"Contato","slug":"contato","page_type":"contact"}]'::jsonb, 10);

-- 3.6 Automotive subverticals
WITH auto AS (SELECT id FROM business_verticals WHERE slug = 'automotive')
INSERT INTO business_subverticals (vertical_id, slug, name, description, icon, default_modules, default_pages, sort_order) VALUES
((SELECT id FROM auto), 'auto_repair', 'Oficina Mecânica', 'Manutenção e reparos automotivos', 'Wrench',
  '["appointments","services","quote_requests","service_orders","vehicle_records","customers"]'::jsonb,
  '[{"title":"Início","slug":"home","page_type":"home"},{"title":"Serviços","slug":"servicos","page_type":"services"},{"title":"Agendar","slug":"agendar","page_type":"appointment_booking"},{"title":"Orçamento","slug":"orcamento","page_type":"quote_request"},{"title":"Contato","slug":"contato","page_type":"contact"}]'::jsonb, 1),
((SELECT id FROM auto), 'car_wash', 'Lava Rápido', 'Lavagem e higienização automotiva', 'SprayCan',
  '["appointments","services","products","customers"]'::jsonb,
  '[{"title":"Início","slug":"home","page_type":"home"},{"title":"Serviços","slug":"servicos","page_type":"services"},{"title":"Agendar","slug":"agendar","page_type":"appointment_booking"},{"title":"Contato","slug":"contato","page_type":"contact"}]'::jsonb, 2),
((SELECT id FROM auto), 'tire_shop', 'Borracheiro', 'Pneus e serviços de borracharia', 'CircleDot',
  '["products","services","appointments","quote_requests"]'::jsonb,
  '[{"title":"Início","slug":"home","page_type":"home"},{"title":"Produtos","slug":"produtos","page_type":"product_catalog"},{"title":"Contato","slug":"contato","page_type":"contact"}]'::jsonb, 3),
((SELECT id FROM auto), 'auto_parts', 'Loja de Auto Peças', 'Peças e acessórios automotivos', 'Car',
  '["products","quote_requests","whatsapp_actions"]'::jsonb,
  '[{"title":"Início","slug":"home","page_type":"home"},{"title":"Produtos","slug":"produtos","page_type":"product_catalog"},{"title":"Contato","slug":"contato","page_type":"contact"}]'::jsonb, 4),
((SELECT id FROM auto), 'motorcycle_shop', 'Loja de Motos', 'Venda e manutenção de motocicletas', 'Bike',
  '["products","services","appointments","quote_requests"]'::jsonb,
  '[{"title":"Início","slug":"home","page_type":"home"},{"title":"Serviços","slug":"servicos","page_type":"services"},{"title":"Agendar","slug":"agendar","page_type":"appointment_booking"},{"title":"Contato","slug":"contato","page_type":"contact"}]'::jsonb, 5),
((SELECT id FROM auto), 'detailing_studio', 'Estúdio de Detalhamento', 'Detalhamento automotivo profissional', 'Sparkles',
  '["appointments","services","products","portfolio"]'::jsonb,
  '[{"title":"Início","slug":"home","page_type":"home"},{"title":"Serviços","slug":"servicos","page_type":"services"},{"title":"Galeria","slug":"galeria","page_type":"gallery"},{"title":"Agendar","slug":"agendar","page_type":"appointment_booking"},{"title":"Contato","slug":"contato","page_type":"contact"}]'::jsonb, 6);

-- 3.7 Real Estate subverticals
WITH realestate AS (SELECT id FROM business_verticals WHERE slug = 'real_estate')
INSERT INTO business_subverticals (vertical_id, slug, name, description, icon, default_modules, default_pages, sort_order) VALUES
((SELECT id FROM realestate), 'real_estate_agency', 'Imobiliária', 'Compra, venda e aluguel de imóveis', 'Home',
  '["properties","leads","appointments","forms","documents"]'::jsonb,
  '[{"title":"Início","slug":"home","page_type":"home"},{"title":"Imóveis","slug":"imoveis","page_type":"properties"},{"title":"Agendar Visita","slug":"visita","page_type":"schedule_visit"},{"title":"Contato","slug":"contato","page_type":"contact"}]'::jsonb, 1),
((SELECT id FROM realestate), 'property_broker', 'Corretor Autônomo', 'Corretagem de imóveis', 'User',
  '["properties","leads","appointments","forms"]'::jsonb,
  '[{"title":"Início","slug":"home","page_type":"home"},{"title":"Imóveis","slug":"imoveis","page_type":"properties"},{"title":"Contato","slug":"contato","page_type":"contact"}]'::jsonb, 2),
((SELECT id FROM realestate), 'property_manager', 'Administradora de Imóveis', 'Gestão de aluguéis e condomínios', 'Building2',
  '["properties","leads","forms","documents","customers"]'::jsonb,
  '[{"title":"Início","slug":"home","page_type":"home"},{"title":"Imóveis","slug":"imoveis","page_type":"properties"},{"title":"Contato","slug":"contato","page_type":"contact"}]'::jsonb, 3),
((SELECT id FROM realestate), 'vacation_rentals', 'Aluguel por Temporada', 'Casas e apartamentos para temporada', 'CalendarDays',
  '["properties","bookings","forms","reviews","whatsapp_actions"]'::jsonb,
  '[{"title":"Início","slug":"home","page_type":"home"},{"title":"Imóveis","slug":"imoveis","page_type":"properties"},{"title":"Reservas","slug":"reservas","page_type":"bookings"},{"title":"Contato","slug":"contato","page_type":"contact"}]'::jsonb, 4),
((SELECT id FROM realestate), 'construction_developer', 'Construtora', 'Lançamentos e empreendimentos', 'HardHat',
  '["properties","leads","forms","documents","portfolio"]'::jsonb,
  '[{"title":"Início","slug":"home","page_type":"home"},{"title":"Lançamentos","slug":"lancamentos","page_type":"properties"},{"title":"Portfólio","slug":"portfolio","page_type":"portfolio"},{"title":"Contato","slug":"contato","page_type":"contact"}]'::jsonb, 5);

-- 3.8 Hotels & Tourism subverticals
WITH hotels AS (SELECT id FROM business_verticals WHERE slug = 'hotels_tourism')
INSERT INTO business_subverticals (vertical_id, slug, name, description, icon, default_modules, default_pages, sort_order) VALUES
((SELECT id FROM hotels), 'hotel', 'Hotel', 'Hospedagem completa com serviços', 'Hotel',
  '["guest_portal","bookings","room_service","documents","reviews"]'::jsonb,
  '[{"title":"Início","slug":"home","page_type":"home"},{"title":"Quartos","slug":"quartos","page_type":"rooms"},{"title":"Serviços","slug":"servicos","page_type":"guest_services"},{"title":"Guia Local","slug":"guia","page_type":"local_guide"},{"title":"Contato","slug":"contato","page_type":"contact"}]'::jsonb, 1),
((SELECT id FROM hotels), 'hostel', 'Hostel', 'Hospedagem econômica e compartilhada', 'Backpack',
  '["guest_portal","bookings","reviews"]'::jsonb,
  '[{"title":"Início","slug":"home","page_type":"home"},{"title":"Quartos","slug":"quartos","page_type":"rooms"},{"title":"Contato","slug":"contato","page_type":"contact"}]'::jsonb, 2),
((SELECT id FROM hotels), 'guest_house', 'Pousada', 'Hospedagem acolhedora', 'Home',
  '["guest_portal","bookings","room_service","documents","reviews"]'::jsonb,
  '[{"title":"Início","slug":"home","page_type":"home"},{"title":"Quartos","slug":"quartos","page_type":"rooms"},{"title":"Serviços","slug":"servicos","page_type":"guest_services"},{"title":"Contato","slug":"contato","page_type":"contact"}]'::jsonb, 3),
((SELECT id FROM hotels), 'resort', 'Resort', 'Hospedagem com lazer completo', 'Palmtree',
  '["guest_portal","bookings","room_service","concierge","reviews"]'::jsonb,
  '[{"title":"Início","slug":"home","page_type":"home"},{"title":"Quartos","slug":"quartos","page_type":"rooms"},{"title":"Lazer","slug":"lazer","page_type":"activities"},{"title":"Gastronomia","slug":"gastronomia","page_type":"dining"},{"title":"Contato","slug":"contato","page_type":"contact"}]'::jsonb, 4),
((SELECT id FROM hotels), 'travel_agency', 'Agência de Viagens', 'Pacotes e roteiros turísticos', 'Plane',
  '["packages","bookings","forms","leads","documents"]'::jsonb,
  '[{"title":"Início","slug":"home","page_type":"home"},{"title":"Pacotes","slug":"pacotes","page_type":"packages"},{"title":"Contato","slug":"contato","page_type":"contact"}]'::jsonb, 5),
((SELECT id FROM hotels), 'tour_guide', 'Guia Turístico', 'Passeios e experiências locais', 'Compass',
  '["packages","bookings","portfolio","reviews","whatsapp_actions"]'::jsonb,
  '[{"title":"Início","slug":"home","page_type":"home"},{"title":"Passeios","slug":"passeios","page_type":"packages"},{"title":"Galeria","slug":"galeria","page_type":"gallery"},{"title":"Contato","slug":"contato","page_type":"contact"}]'::jsonb, 6);

-- 3.9 Education subverticals
WITH education AS (SELECT id FROM business_verticals WHERE slug = 'education')
INSERT INTO business_subverticals (vertical_id, slug, name, description, icon, default_modules, default_pages, sort_order) VALUES
((SELECT id FROM education), 'school', 'Escola', 'Ensino fundamental e médio', 'BookOpen',
  '["courses","enrollments","teachers","events","documents","leads"]'::jsonb,
  '[{"title":"Início","slug":"home","page_type":"home"},{"title":"Cursos","slug":"cursos","page_type":"courses"},{"title":"Matrícula","slug":"matricula","page_type":"enrollment"},{"title":"Contato","slug":"contato","page_type":"contact"}]'::jsonb, 1),
((SELECT id FROM education), 'language_school', 'Escola de Idiomas', 'Cursos de idiomas', 'Languages',
  '["courses","enrollments","teachers","events","leads"]'::jsonb,
  '[{"title":"Início","slug":"home","page_type":"home"},{"title":"Cursos","slug":"cursos","page_type":"courses"},{"title":"Matrícula","slug":"matricula","page_type":"enrollment"},{"title":"Contato","slug":"contato","page_type":"contact"}]'::jsonb, 2),
((SELECT id FROM education), 'training_center', 'Centro de Treinamento', 'Cursos profissionalizantes', 'GraduationCap',
  '["courses","enrollments","teachers","events","leads"]'::jsonb,
  '[{"title":"Início","slug":"home","page_type":"home"},{"title":"Cursos","slug":"cursos","page_type":"courses"},{"title":"Matrícula","slug":"matricula","page_type":"enrollment"},{"title":"Contato","slug":"contato","page_type":"contact"}]'::jsonb, 3),
((SELECT id FROM education), 'tutor', 'Professor Particular', 'Aulas particulares e reforço', 'UserCheck',
  '["courses","enrollments","appointments","leads"]'::jsonb,
  '[{"title":"Início","slug":"home","page_type":"home"},{"title":"Serviços","slug":"servicos","page_type":"services"},{"title":"Agendar Aula","slug":"agendar","page_type":"appointment_booking"},{"title":"Contato","slug":"contato","page_type":"contact"}]'::jsonb, 4),
((SELECT id FROM education), 'music_school', 'Escola de Música', 'Aulas de instrumentos e canto', 'Music',
  '["courses","enrollments","teachers","events","portfolio"]'::jsonb,
  '[{"title":"Início","slug":"home","page_type":"home"},{"title":"Cursos","slug":"cursos","page_type":"courses"},{"title":"Professores","slug":"professores","page_type":"teachers"},{"title":"Matrícula","slug":"matricula","page_type":"enrollment"},{"title":"Contato","slug":"contato","page_type":"contact"}]'::jsonb, 5),
((SELECT id FROM education), 'dance_school', 'Escola de Dança', 'Aulas de dança', 'Music4',
  '["courses","enrollments","teachers","events","portfolio"]'::jsonb,
  '[{"title":"Início","slug":"home","page_type":"home"},{"title":"Cursos","slug":"cursos","page_type":"courses"},{"title":"Matrícula","slug":"matricula","page_type":"enrollment"},{"title":"Contato","slug":"contato","page_type":"contact"}]'::jsonb, 6),
((SELECT id FROM education), 'online_course', 'Criador de Cursos Online', 'Cursos e conteúdos digitais', 'Monitor',
  '["courses","enrollments","teachers","documents","leads"]'::jsonb,
  '[{"title":"Início","slug":"home","page_type":"home"},{"title":"Cursos","slug":"cursos","page_type":"courses"},{"title":"Contato","slug":"contato","page_type":"contact"}]'::jsonb, 7);

-- 3.10 Professional Services subverticals
WITH services AS (SELECT id FROM business_verticals WHERE slug = 'professional_services')
INSERT INTO business_subverticals (vertical_id, slug, name, description, icon, default_modules, default_pages, sort_order) VALUES
((SELECT id FROM services), 'lawyer', 'Advocacia', 'Serviços jurídicos', 'Scale',
  '["appointments","services","forms","documents","leads","proposals"]'::jsonb,
  '[{"title":"Início","slug":"home","page_type":"home"},{"title":"Áreas de Atuação","slug":"areas","page_type":"services"},{"title":"Agendar Consulta","slug":"agendar","page_type":"appointment_booking"},{"title":"Contato","slug":"contato","page_type":"contact"}]'::jsonb, 1),
((SELECT id FROM services), 'accountant', 'Contabilidade', 'Serviços contábeis', 'Calculator',
  '["appointments","services","forms","documents","leads"]'::jsonb,
  '[{"title":"Início","slug":"home","page_type":"home"},{"title":"Serviços","slug":"servicos","page_type":"services"},{"title":"Agendar","slug":"agendar","page_type":"appointment_booking"},{"title":"Contato","slug":"contato","page_type":"contact"}]'::jsonb, 2),
((SELECT id FROM services), 'consultant', 'Consultoria', 'Consultoria empresarial e estratégica', 'Lightbulb',
  '["appointments","services","forms","documents","leads","proposals"]'::jsonb,
  '[{"title":"Início","slug":"home","page_type":"home"},{"title":"Serviços","slug":"servicos","page_type":"services"},{"title":"Agendar","slug":"agendar","page_type":"appointment_booking"},{"title":"Contato","slug":"contato","page_type":"contact"}]'::jsonb, 3),
((SELECT id FROM services), 'architect', 'Arquitetura', 'Projetos arquitetônicos e design', 'Ruler',
  '["appointments","services","forms","documents","leads","portfolio","proposals"]'::jsonb,
  '[{"title":"Início","slug":"home","page_type":"home"},{"title":"Serviços","slug":"servicos","page_type":"services"},{"title":"Portfólio","slug":"portfolio","page_type":"portfolio"},{"title":"Contato","slug":"contato","page_type":"contact"}]'::jsonb, 4),
((SELECT id FROM services), 'engineer', 'Engenharia', 'Projetos de engenharia e consultoria', 'HardHat',
  '["appointments","services","forms","documents","leads","proposals"]'::jsonb,
  '[{"title":"Início","slug":"home","page_type":"home"},{"title":"Serviços","slug":"servicos","page_type":"services"},{"title":"Contato","slug":"contato","page_type":"contact"}]'::jsonb, 5),
((SELECT id FROM services), 'insurance_agent', 'Corretor de Seguros', 'Seguros de vida, auto e residencial', 'ShieldCheck',
  '["services","forms","leads","documents","whatsapp_actions"]'::jsonb,
  '[{"title":"Início","slug":"home","page_type":"home"},{"title":"Seguros","slug":"seguros","page_type":"services"},{"title":"Solicitar Cotação","slug":"cotacao","page_type":"quote_request"},{"title":"Contato","slug":"contato","page_type":"contact"}]'::jsonb, 6),
((SELECT id FROM services), 'marketing_agency', 'Agência de Marketing', 'Marketing digital e publicidade', 'Megaphone',
  '["services","portfolio","forms","leads","proposals","campaigns"]'::jsonb,
  '[{"title":"Início","slug":"home","page_type":"home"},{"title":"Serviços","slug":"servicos","page_type":"services"},{"title":"Portfólio","slug":"portfolio","page_type":"portfolio"},{"title":"Contato","slug":"contato","page_type":"contact"}]'::jsonb, 7);

-- 3.11 Events subverticals
WITH events AS (SELECT id FROM business_verticals WHERE slug = 'events')
INSERT INTO business_subverticals (vertical_id, slug, name, description, icon, default_modules, default_pages, sort_order) VALUES
((SELECT id FROM events), 'wedding_planner', 'Cerimonialista', 'Planejamento de casamentos', 'Heart',
  '["packages","bookings","portfolio","quote_requests","reviews"]'::jsonb,
  '[{"title":"Início","slug":"home","page_type":"home"},{"title":"Pacotes","slug":"pacotes","page_type":"packages"},{"title":"Portfólio","slug":"portfolio","page_type":"portfolio"},{"title":"Orçamento","slug":"orcamento","page_type":"quote_request"},{"title":"Contato","slug":"contato","page_type":"contact"}]'::jsonb, 1),
((SELECT id FROM events), 'event_venue', 'Espaço para Eventos', 'Salão e espaço para eventos', 'Building2',
  '["packages","bookings","portfolio","quote_requests","reviews"]'::jsonb,
  '[{"title":"Início","slug":"home","page_type":"home"},{"title":"Espaços","slug":"espacos","page_type":"packages"},{"title":"Galeria","slug":"galeria","page_type":"gallery"},{"title":"Orçamento","slug":"orcamento","page_type":"quote_request"},{"title":"Contato","slug":"contato","page_type":"contact"}]'::jsonb, 2),
((SELECT id FROM events), 'photographer', 'Fotógrafo', 'Fotografia de eventos e ensaios', 'Camera',
  '["packages","bookings","portfolio","quote_requests","reviews"]'::jsonb,
  '[{"title":"Início","slug":"home","page_type":"home"},{"title":"Portfólio","slug":"portfolio","page_type":"portfolio"},{"title":"Pacotes","slug":"pacotes","page_type":"packages"},{"title":"Orçamento","slug":"orcamento","page_type":"quote_request"},{"title":"Contato","slug":"contato","page_type":"contact"}]'::jsonb, 3),
((SELECT id FROM events), 'dj', 'DJ', 'Som e iluminação para eventos', 'Music3',
  '["packages","bookings","portfolio","quote_requests","reviews"]'::jsonb,
  '[{"title":"Início","slug":"home","page_type":"home"},{"title":"Pacotes","slug":"pacotes","page_type":"packages"},{"title":"Portfólio","slug":"portfolio","page_type":"portfolio"},{"title":"Orçamento","slug":"orcamento","page_type":"quote_request"},{"title":"Contato","slug":"contato","page_type":"contact"}]'::jsonb, 4),
((SELECT id FROM events), 'catering', 'Buffet', 'Buffet e alimentação para eventos', 'Utensils',
  '["packages","bookings","menu","quote_requests","reviews"]'::jsonb,
  '[{"title":"Início","slug":"home","page_type":"home"},{"title":"Cardápio","slug":"cardapio","page_type":"menu"},{"title":"Pacotes","slug":"pacotes","page_type":"packages"},{"title":"Orçamento","slug":"orcamento","page_type":"quote_request"},{"title":"Contato","slug":"contato","page_type":"contact"}]'::jsonb, 5),
((SELECT id FROM events), 'party_decorator', 'Decorador de Festas', 'Decoração para eventos', 'Sparkles',
  '["packages","bookings","portfolio","quote_requests","reviews"]'::jsonb,
  '[{"title":"Início","slug":"home","page_type":"home"},{"title":"Portfólio","slug":"portfolio","page_type":"portfolio"},{"title":"Pacotes","slug":"pacotes","page_type":"packages"},{"title":"Orçamento","slug":"orcamento","page_type":"quote_request"},{"title":"Contato","slug":"contato","page_type":"contact"}]'::jsonb, 6),
((SELECT id FROM events), 'event_organizer', 'Organizador de Eventos', 'Organização completa de eventos', 'Calendar',
  '["packages","bookings","portfolio","quote_requests","reviews"]'::jsonb,
  '[{"title":"Início","slug":"home","page_type":"home"},{"title":"Pacotes","slug":"pacotes","page_type":"packages"},{"title":"Portfólio","slug":"portfolio","page_type":"portfolio"},{"title":"Orçamento","slug":"orcamento","page_type":"quote_request"},{"title":"Contato","slug":"contato","page_type":"contact"}]'::jsonb, 7);

-- ============================================
-- 4. CREATE TRIGGER to auto-enable modules
-- ============================================

CREATE TRIGGER on_business_created_auto_modules
  AFTER INSERT ON businesses
  FOR EACH ROW EXECUTE FUNCTION auto_enable_modules_for_business();
