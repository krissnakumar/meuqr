-- ============================================
-- MeuQR - Demo Seed Data
-- ============================================
-- This seed file creates demo data for local development testing.
-- Run via: supabase db reset (with [db.seed] enabled in config.toml)

-- ============================================
-- Demo Auth User
-- ============================================
-- Insert a demo user into auth.users (local dev only!)
-- Password for this user: demo123456
INSERT INTO auth.users (
  id, instance_id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'demo@meuqr.com.br',
  -- bcrypt hash of 'demo123456'
  '$2b$10$V2HBaAU0u/zUiCU4zSur1unL4AjJvJ4.9e9S.LsukqUq8p.A.S78C',
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Maria Silva"}',
  now(),
  now(),
  '', '', '', ''
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- Demo Profile
-- (Auto-created by handle_new_user trigger, but update in case it was already seeded)
-- ============================================
INSERT INTO public.profiles (id, email, full_name, phone)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'demo@meuqr.com.br',
  'Maria Silva',
  '(11) 99999-8888'
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  phone = EXCLUDED.phone;

-- ============================================
-- Demo Businesses
-- ============================================

-- 1. Sabor & Arte - Restaurant
INSERT INTO public.businesses (id, owner_id, name, slug, category, description, phone, whatsapp, pix_key, address, city, state, instagram, website, opening_hours)
VALUES (
  'a0000001-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  'Sabor & Arte',
  'sabor-e-arte',
  'restaurant',
  'Restaurante caseiro com pratos artesanais e ambiente acolhedor. Especializado em culinária brasileira contemporânea.',
  '(11) 3333-4444',
  '5511999998888',
  'sabor.arte@pix.com',
  'Rua Augusta, 1500',
  'São Paulo',
  'SP',
  '@saborearte',
  'https://saborearte.com.br',
  '{"seg": "11:30-15:00,18:00-23:00", "ter": "11:30-15:00,18:00-23:00", "qua": "11:30-15:00,18:00-23:00", "qui": "11:30-15:00,18:00-23:00", "sex": "11:30-15:00,18:00-00:00", "sab": "12:00-00:00", "dom": "12:00-22:00"}'
)
ON CONFLICT (id) DO NOTHING;

-- 2. Studio Beleza - Salon
INSERT INTO public.businesses (id, owner_id, name, slug, category, description, phone, whatsapp, instagram, opening_hours)
VALUES (
  'a0000002-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  'Studio Beleza',
  'studio-beleza',
  'salon',
  'Salão de beleza completo com serviços de cabelo, unhas, maquiagem e estética facial.',
  '(11) 4444-5555',
  '5511999997777',
  '@studiobeleza',
  '{"seg": "09:00-19:00", "ter": "09:00-19:00", "qua": "09:00-19:00", "qui": "09:00-20:00", "sex": "09:00-20:00", "sab": "09:00-18:00", "dom": ""}'
)
ON CONFLICT (id) DO NOTHING;

-- 3. Pet Feliz - Pet Shop
INSERT INTO public.businesses (id, owner_id, name, slug, category, description, phone, whatsapp, instagram)
VALUES (
  'a0000003-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  'Pet Feliz',
  'pet-feliz',
  'pet_shop',
  'Tudo para seu pet: banho e tosa, rações, acessórios e brinquedos.',
  '(11) 5555-6666',
  '5511999996666',
  '@petfeliz'
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- Pages (from templates)
-- ============================================

-- Restaurant main page
INSERT INTO public.pages (id, business_id, template_id, title, slug, is_published, seo_title, seo_description)
VALUES (
  'b0000001-0000-0000-0000-000000000001',
  'a0000001-0000-0000-0000-000000000001',
  'a0000001-0000-0000-0000-000000000001',
  'Cardápio Digital',
  'cardapio',
  true,
  'Sabor & Arte - Cardápio Digital',
  'Confira nosso cardápio completo com pratos artesanais, bebidas e promoções especiais.'
)
ON CONFLICT (id) DO NOTHING;

-- Salon main page
INSERT INTO public.pages (id, business_id, template_id, title, slug, is_published, seo_title, seo_description)
VALUES (
  'b0000002-0000-0000-0000-000000000001',
  'a0000002-0000-0000-0000-000000000001',
  'a0000001-0000-0000-0000-000000000003',
  'Serviços de Beleza',
  'servicos',
  true,
  'Studio Beleza - Serviços',
  'Confira todos os serviços do Studio Beleza: cabelo, unhas, maquiagem e mais.'
)
ON CONFLICT (id) DO NOTHING;

-- Pet Shop main page
INSERT INTO public.pages (id, business_id, template_id, title, slug, is_published, seo_title, seo_description)
VALUES (
  'b0000003-0000-0000-0000-000000000001',
  'a0000003-0000-0000-0000-000000000001',
  'a0000001-0000-0000-0000-000000000004',
  'Pet Shop Digital',
  'servicos',
  true,
  'Pet Feliz - Serviços e Produtos',
  'Banho e tosa, rações, acessórios e muito mais para seu pet.'
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- Sections
-- ============================================

INSERT INTO public.sections (id, page_id, name, slug, section_type, sort_order, is_visible)
VALUES
  ('c0000001-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000001', 'Pratos Principais', 'pratos-principais', 'menu', 0, true),
  ('c0000002-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000001', 'Bebidas', 'bebidas', 'menu', 1, true),
  ('c0000003-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000001', 'Promoções', 'promocoes', 'menu', 2, true),
  ('c0000004-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000001', 'Faça seu Pedido', 'faca-seu-pedido', 'whatsapp', 3, true),
  ('c0000005-0000-0000-0000-000000000001', 'b0000002-0000-0000-0000-000000000001', 'Nossos Serviços', 'nossos-servicos', 'services', 0, true),
  ('c0000006-0000-0000-0000-000000000001', 'b0000002-0000-0000-0000-000000000001', 'Agende seu Horário', 'agende-seu-horario', 'whatsapp', 1, true),
  ('c0000007-0000-0000-0000-000000000001', 'b0000003-0000-0000-0000-000000000001', 'Serviços', 'servicos', 'services', 0, true),
  ('c0000008-0000-0000-0000-000000000001', 'b0000003-0000-0000-0000-000000000001', 'Produtos', 'produtos', 'products', 1, true)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- Items
-- ============================================

INSERT INTO public.items (id, section_id, name, description, price, original_price, item_type, is_available, sort_order)
VALUES
  -- Restaurant: Pratos Principais
  ('d0000001-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000001', 'Filé Mignon ao Molho Madeira', 'Filé mignon grelhado, molho madeira, arroz de brócolis e batata gratinada', 89.90, NULL, 'product', true, 0),
  ('d0000002-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000001', 'Moqueca de Peixe', 'Moqueca de peixe fresco com leite de coco, dendê, arroz e pirão', 69.90, NULL, 'product', true, 1),
  ('d0000003-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000001', 'Risoto de Cogumelos', 'Risoto cremoso com cogumelos shitake, shimeji e parmesão', 59.90, NULL, 'product', true, 2),
  ('d0000004-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000001', 'Prato Executivo', 'Arroz, feijão, bife acebolado, ovo, batata frita e salada', 34.90, 39.90, 'combo', true, 3),
  -- Restaurant: Bebidas
  ('d0000005-0000-0000-0000-000000000001', 'c0000002-0000-0000-0000-000000000001', 'Coca-Cola Lata', 'Lata 350ml', 6.00, NULL, 'product', true, 0),
  ('d0000006-0000-0000-0000-000000000001', 'c0000002-0000-0000-0000-000000000001', 'Suco Natural de Laranja', 'Copo 500ml - laranja lima fresca', 10.00, NULL, 'product', true, 1),
  ('d0000007-0000-0000-0000-000000000001', 'c0000002-0000-0000-0000-000000000001', 'Cerveja Artesanal IPA', 'Garrafa 600ml - lupulada e refrescante', 18.00, NULL, 'product', true, 2),
  ('d0000008-0000-0000-0000-000000000001', 'c0000002-0000-0000-0000-000000000001', 'Água Mineral', 'Garrafa 500ml - com ou sem gás', 4.00, NULL, 'product', true, 3),
  -- Restaurant: Promoções
  ('d0000009-0000-0000-0000-000000000001', 'c0000003-0000-0000-0000-000000000001', 'Combo Casal', '2 pratos executivos + 2 bebidas + sobremesa', 79.90, 99.80, 'combo', true, 0),
  ('d0000010-0000-0000-0000-000000000001', 'c0000003-0000-0000-0000-000000000001', 'Happy Hour', 'Cerveja artesanal + porção de batata frita com cheddar e bacon', 29.90, 36.00, 'combo', true, 1),
  -- Salon: Serviços
  ('d0000011-0000-0000-0000-000000000001', 'c0000005-0000-0000-0000-000000000001', 'Corte Feminino', 'Corte personalizado com lavagem e finalização', 89.00, NULL, 'service', true, 0),
  ('d0000012-0000-0000-0000-000000000001', 'c0000005-0000-0000-0000-000000000001', 'Corte Masculino', 'Corte moderno com lavagem e styling', 59.00, NULL, 'service', true, 1),
  ('d0000013-0000-0000-0000-000000000001', 'c0000005-0000-0000-0000-000000000001', 'Manicure e Pedicure', 'Alongamento, esmaltação e cuticulagem', 75.00, NULL, 'service', true, 2),
  ('d0000014-0000-0000-0000-000000000001', 'c0000005-0000-0000-0000-000000000001', 'Escova Progressiva', 'Escova progressiva com queratina e proteção térmica', 180.00, NULL, 'service', true, 3),
  ('d0000015-0000-0000-0000-000000000001', 'c0000005-0000-0000-0000-000000000001', 'Maquiagem Social', 'Maquiagem profissional para eventos e festas', 120.00, NULL, 'service', true, 4),
  -- Pet Shop: Serviços
  ('d0000016-0000-0000-0000-000000000001', 'c0000007-0000-0000-0000-000000000001', 'Banho e Tosa (Pequeno)', 'Para cães até 10kg - banho, tosa, unhas e perfume', 65.00, NULL, 'service', true, 0),
  ('d0000017-0000-0000-0000-000000000001', 'c0000007-0000-0000-0000-000000000001', 'Banho e Tosa (Grande)', 'Para cães acima de 10kg - banho, tosa, unhas e perfume', 95.00, NULL, 'service', true, 1),
  ('d0000018-0000-0000-0000-000000000001', 'c0000007-0000-0000-0000-000000000001', 'Tosa Higiênica', 'Tosa higiênica focada em áreas específicas', 45.00, 55.00, 'service', true, 2),
  -- Pet Shop: Produtos
  ('d0000019-0000-0000-0000-000000000001', 'c0000008-0000-0000-0000-000000000001', 'Ração Premium 15kg', 'Ração super premium para cães adultos', 189.90, NULL, 'product', true, 0),
  ('d0000020-0000-0000-0000-000000000001', 'c0000008-0000-0000-0000-000000000001', 'Coleira Antipulgas', 'Proteção por 3 meses contra pulgas e carrapatos', 89.90, NULL, 'product', true, 1),
  ('d0000021-0000-0000-0000-000000000001', 'c0000008-0000-0000-0000-000000000001', 'Cama Ortopédica', 'Cama ortopédica para cães de porte médio', 149.90, NULL, 'product', true, 2)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- QR Codes
-- ============================================

INSERT INTO public.qr_codes (id, business_id, page_id, short_code, title, is_active, scan_count)
VALUES
  ('e0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000001', 'sabore1', 'Cardápio - Salão Principal', true, 127),
  ('e0000002-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000001', 'sabore2', 'Cardápio - Retirada', true, 45),
  ('e0000003-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000001', 'sabore3', 'Promoção Verão (Encerrada)', false, 230),
  ('e0000004-0000-0000-0000-000000000001', 'a0000002-0000-0000-0000-000000000001', 'b0000002-0000-0000-0000-000000000001', 'belez1', 'Serviços - Recepção', true, 89),
  ('e0000005-0000-0000-0000-000000000001', 'a0000003-0000-0000-0000-000000000001', 'b0000003-0000-0000-0000-000000000001', 'petf1', 'Serviços Pet', true, 56)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- QR Styles
-- ============================================
INSERT INTO public.qr_styles (qr_code_id, dot_style, corner_style, foreground_color, background_color, error_correction_level)
VALUES
  ('e0000001-0000-0000-0000-000000000001', 'rounded', 'rounded', '#8B4513', '#FFF8F0', 'M'),
  ('e0000002-0000-0000-0000-000000000001', 'rounded', 'rounded', '#8B4513', '#FFF8F0', 'M'),
  ('e0000003-0000-0000-0000-000000000001', 'rounded', 'square', '#DC2626', '#FFFFFF', 'H'),
  ('e0000004-0000-0000-0000-000000000001', 'dots', 'rounded', '#E91E8C', '#FFF5F9', 'M'),
  ('e0000005-0000-0000-0000-000000000001', 'rounded', 'rounded', '#2196F3', '#F0F8FF', 'M')
ON CONFLICT (qr_code_id) DO NOTHING;

-- ============================================
-- New Demo Businesses (Additional Categories)
-- ============================================

-- 4. Casa & Obra - Construction Materials
INSERT INTO public.businesses (id, owner_id, name, slug, category, description, phone, whatsapp, address, city, state, instagram, opening_hours)
VALUES (
  'a0000004-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  'Casa & Obra',
  'casa-e-obra',
  'construction_materials',
  'Materiais de construção, acabamento e ferramentas para sua obra. Preços especiais para profissionais.',
  '(11) 6666-7777',
  '5511999995555',
  'Av. Paulista, 2000',
  'São Paulo',
  'SP',
  '@casaeobra',
  '{"seg": "07:00-18:00", "ter": "07:00-18:00", "qua": "07:00-18:00", "qui": "07:00-18:00", "sex": "07:00-18:00", "sab": "08:00-13:00", "dom": ""}'
)
ON CONFLICT (id) DO NOTHING;

-- 5. Hotel Recanto - Hotel
INSERT INTO public.businesses (id, owner_id, name, slug, category, description, phone, whatsapp, address, city, state, instagram, website, opening_hours)
VALUES (
  'a0000005-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  'Hotel Recanto',
  'hotel-recanto',
  'hotel',
  'Hotel boutique com 40 suítes, piscina, spa e gastronomia premiada. Perfeito para lazer e negócios.',
  '(11) 7777-8888',
  '5511999994444',
  'Av. Atlântica, 500',
  'Santos',
  'SP',
  '@hotelrecanto',
  'https://hotelrecanto.com.br',
  '{"seg": "24h", "ter": "24h", "qua": "24h", "qui": "24h", "sex": "24h", "sab": "24h", "dom": "24h"}'
)
ON CONFLICT (id) DO NOTHING;

-- 6. Imobiliária Prime - Real Estate
INSERT INTO public.businesses (id, owner_id, name, slug, category, description, phone, whatsapp, instagram, website, opening_hours)
VALUES (
  'a0000006-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  'Imobiliária Prime',
  'imobiliaria-prime',
  'real_estate',
  'Imobiliária especializada em imóveis residenciais e comerciais de alto padrão. Mais de 500 imóveis em carteira.',
  '(11) 8888-9999',
  '5511999993333',
  '@imobiliariaprime',
  'https://imobiliariaprime.com.br',
  '{"seg": "09:00-19:00", "ter": "09:00-19:00", "qua": "09:00-19:00", "qui": "09:00-19:00", "sex": "09:00-18:00", "sab": "09:00-13:00", "dom": ""}'
)
ON CONFLICT (id) DO NOTHING;

-- 7. Eventos Festa Perfeita - Event
INSERT INTO public.businesses (id, owner_id, name, slug, category, description, phone, whatsapp, instagram)
VALUES (
  'a0000007-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  'Eventos Festa Perfeita',
  'eventos-festa-perfeita',
  'event',
  'Realizamos eventos corporativos e sociais com excelência. Casamentos, formaturas, confraternizações e festas infantis.',
  '(11) 9999-0000',
  '5511999992222',
  '@festaperfeita'
)
ON CONFLICT (id) DO NOTHING;

-- 8. Clínica Vita - Clinic
INSERT INTO public.businesses (id, owner_id, name, slug, category, description, phone, whatsapp, pix_key, address, city, state, instagram, opening_hours)
VALUES (
  'a0000008-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  'Clínica Vita',
  'clinica-vita',
  'clinic',
  'Clínica médica multidisciplinar com atendimento humanizado. Clínico geral, pediatria, cardiologia e mais.',
  '(11) 1111-2222',
  '5511999991111',
  'vita.clinica@pix.com',
  'Rua Oscar Freire, 500',
  'São Paulo',
  'SP',
  '@clinicavita',
  '{"seg": "07:00-20:00", "ter": "07:00-20:00", "qua": "07:00-20:00", "qui": "07:00-20:00", "sex": "07:00-19:00", "sab": "08:00-13:00", "dom": ""}'
)
ON CONFLICT (id) DO NOTHING;

-- 9. Academia Força Total - Gym
INSERT INTO public.businesses (id, owner_id, name, slug, category, description, phone, whatsapp, instagram, opening_hours)
VALUES (
  'a0000009-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  'Academia Força Total',
  'forca-total',
  'gym',
  'Academia completa com musculação, crossfit, pilates e spinning. Equipe de profissionais certificados.',
  '(11) 2222-3333',
  '5511999990000',
  '@forcatotal',
  '{"seg": "06:00-22:00", "ter": "06:00-22:00", "qua": "06:00-22:00", "qui": "06:00-22:00", "sex": "06:00-21:00", "sab": "08:00-18:00", "dom": "09:00-13:00"}'
)
ON CONFLICT (id) DO NOTHING;

-- 10. Oficina do Zé - Mechanic
INSERT INTO public.businesses (id, owner_id, name, slug, category, description, phone, whatsapp, address, city, state, opening_hours)
VALUES (
  'a0000010-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  'Oficina do Zé',
  'oficina-do-ze',
  'mechanic',
  'Mecânica geral com 20 anos de experiência. Especializada em veículos nacionais e importados.',
  '(11) 3333-4444',
  '5511999999990',
  'Rua das Oficinas, 100',
  'São Bernardo do Campo',
  'SP',
  '{"seg": "07:00-18:00", "ter": "07:00-18:00", "qua": "07:00-18:00", "qui": "07:00-18:00", "sex": "07:00-18:00", "sab": "07:00-12:00", "dom": ""}'
)
ON CONFLICT (id) DO NOTHING;

-- 11. DesignStudio by Ana - Freelancer
INSERT INTO public.businesses (id, owner_id, name, slug, category, description, phone, whatsapp, instagram, website)
VALUES (
  'a0000011-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  'DesignStudio by Ana',
  'designstudio-ana',
  'freelancer',
  'Design gráfico, identidade visual e social media. Transformo suas ideias em arte digital.',
  '(11) 4444-5555',
  '5511999998889',
  '@designstudio.ana',
  'https://designstudioana.com.br'
)
ON CONFLICT (id) DO NOTHING;

-- 12. Igreja Esperança - Church
INSERT INTO public.businesses (id, owner_id, name, slug, category, description, phone, whatsapp, address, city, state, instagram)
VALUES (
  'a0000012-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  'Igreja Esperança',
  'igreja-esperanca',
  'church',
  'Igreja cristã com cultos aos domingos, grupos de estudo e ações sociais. Todos são bem-vindos.',
  '(11) 5555-6666',
  '5511999997778',
  'Rua da Paz, 300',
  'São Paulo',
  'SP',
  '@igrejaesperanca'
)
ON CONFLICT (id) DO NOTHING;

-- 13. Supermercado Preço Bom - Product Shelf (supermarket using shelf QR for products)
INSERT INTO public.businesses (id, owner_id, name, slug, category, description, phone, whatsapp, pix_key, address, city, state, instagram, opening_hours)
VALUES (
  'a0000013-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  'Supermercado Preço Bom',
  'preco-bom',
  'product_shelf',
  'Supermercado com preços baixos todos os dias! Hortifrúti, açougue, padaria e mercearia de qualidade.',
  '(11) 6666-7777',
  '5511999996668',
  'preco.bom@pix.com',
  'Rua Comércio, 500',
  'São Paulo',
  'SP',
  '@precobom',
  '{"seg": "07:00-21:00", "ter": "07:00-21:00", "qua": "07:00-21:00", "qui": "07:00-21:00", "sex": "07:00-22:00", "sab": "07:00-22:00", "dom": "08:00-13:00"}'
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- New Pages (from templates)
-- ============================================

-- Construction Materials page
INSERT INTO public.pages (id, business_id, template_id, title, slug, is_published, seo_title, seo_description)
VALUES (
  'b0000004-0000-0000-0000-000000000001',
  'a0000004-0000-0000-0000-000000000001',
  'a0000001-0000-0000-0000-000000000002',
  'Catálogo de Materiais',
  'catalogo',
  true,
  'Casa & Obra - Catálogo de Materiais',
  'Confira nosso catálogo completo com cimento, areia, tijolos, tintas, elétrica e hidráulica.'
)
ON CONFLICT (id) DO NOTHING;

-- Hotel page
INSERT INTO public.pages (id, business_id, template_id, title, slug, is_published, seo_title, seo_description)
VALUES (
  'b0000005-0000-0000-0000-000000000001',
  'a0000005-0000-0000-0000-000000000001',
  'a0000001-0000-0000-0000-000000000005',
  'Guia do Hóspede',
  'guia-hospede',
  true,
  'Hotel Recanto - Guia do Hóspede',
  'Tudo que você precisa saber durante sua estadia: serviços, horários e contato.'
)
ON CONFLICT (id) DO NOTHING;

-- Real Estate page
INSERT INTO public.pages (id, business_id, template_id, title, slug, is_published, seo_title, seo_description)
VALUES (
  'b0000006-0000-0000-0000-000000000001',
  'a0000006-0000-0000-0000-000000000001',
  'a0000001-0000-0000-0000-000000000006',
  'Imóveis Disponíveis',
  'imoveis',
  true,
  'Imobiliária Prime - Imóveis',
  'Confira nossa seleção de imóveis residenciais e comerciais.'
)
ON CONFLICT (id) DO NOTHING;

-- Event page
INSERT INTO public.pages (id, business_id, template_id, title, slug, is_published, seo_title, seo_description)
VALUES (
  'b0000007-0000-0000-0000-000000000001',
  'a0000007-0000-0000-0000-000000000001',
  'a0000001-0000-0000-0000-000000000007',
  'Convite Digital - Festa de Final de Ano',
  'convite',
  true,
  'Festa de Final de Ano - Confirme sua Presença',
  'Venha celebrar conosco! Confira a programação e confirme sua presença.'
)
ON CONFLICT (id) DO NOTHING;

-- Clinic page
INSERT INTO public.pages (id, business_id, template_id, title, slug, is_published, seo_title, seo_description)
VALUES (
  'b0000008-0000-0000-0000-000000000001',
  'a0000008-0000-0000-0000-000000000001',
  'a0000001-0000-0000-0000-000000000008',
  'Nossos Serviços',
  'servicos',
  true,
  'Clínica Vita - Serviços Médicos',
  'Conheça nossos serviços: consultas, exames e teleconsulta com profissionais qualificados.'
)
ON CONFLICT (id) DO NOTHING;

-- Gym page
INSERT INTO public.pages (id, business_id, template_id, title, slug, is_published, seo_title, seo_description)
VALUES (
  'b0000009-0000-0000-0000-000000000001',
  'a0000009-0000-0000-0000-000000000001',
  'a0000001-0000-0000-0000-000000000010',
  'Planos e Horários',
  'planos',
  true,
  'Academia Força Total - Planos e Horários',
  'Conheça nossos planos e grade de aulas. Matrícula online pelo WhatsApp.'
)
ON CONFLICT (id) DO NOTHING;

-- Mechanic page
INSERT INTO public.pages (id, business_id, template_id, title, slug, is_published, seo_title, seo_description)
VALUES (
  'b0000010-0000-0000-0000-000000000001',
  'a0000010-0000-0000-0000-000000000001',
  'a0000001-0000-0000-0000-000000000011',
  'Serviços Automotivos',
  'servicos',
  true,
  'Oficina do Zé - Serviços',
  'Revisão completa, troca de óleo, freios, ar condicionado e mais. Solicite seu orçamento.'
)
ON CONFLICT (id) DO NOTHING;

-- Freelancer page
INSERT INTO public.pages (id, business_id, template_id, title, slug, is_published, seo_title, seo_description)
VALUES (
  'b0000011-0000-0000-0000-000000000001',
  'a0000011-0000-0000-0000-000000000001',
  'a0000001-0000-0000-0000-000000000012',
  'Portfólio',
  'portfolio',
  true,
  'DesignStudio by Ana - Portfólio',
  'Projetos de design gráfico, identidade visual e social media.'
)
ON CONFLICT (id) DO NOTHING;

-- Church page
INSERT INTO public.pages (id, business_id, template_id, title, slug, is_published, seo_title, seo_description)
VALUES (
  'b0000012-0000-0000-0000-000000000001',
  'a0000012-0000-0000-0000-000000000001',
  'a0000001-0000-0000-0000-000000000013',
  'Programação',
  'programacao',
  true,
  'Igreja Esperança - Programação',
  'Cultos, eventos e contribuições. Confira nossa programação completa.'
)
ON CONFLICT (id) DO NOTHING;

-- Supermarket page (Product Shelf template)
INSERT INTO public.pages (id, business_id, template_id, title, slug, is_published, seo_title, seo_description)
VALUES (
  'b0000013-0000-0000-0000-000000000001',
  'a0000013-0000-0000-0000-000000000001',
  'a0000001-0000-0000-0000-000000000009',
  'Ofertas do Mês',
  'ofertas',
  true,
  'Supermercado Preço Bom - Ofertas',
  'Confira nossas ofertas especiais do mês com preços imperdíveis.'
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- New Sections (for businesses 4-13)
-- ============================================

INSERT INTO public.sections (id, page_id, name, slug, section_type, sort_order, is_visible)
VALUES
  -- Casa & Obra (construction_materials)
  ('c0000009-0000-0000-0000-000000000001', 'b0000004-0000-0000-0000-000000000001', 'Cimento', 'cimento', 'products', 0, true),
  ('c0000010-0000-0000-0000-000000000001', 'b0000004-0000-0000-0000-000000000001', 'Areia e Pedra', 'areia-pedra', 'products', 1, true),
  ('c0000011-0000-0000-0000-000000000001', 'b0000004-0000-0000-0000-000000000001', 'Tijolos e Blocos', 'tijolos-blocos', 'products', 2, true),
  ('c0000012-0000-0000-0000-000000000001', 'b0000004-0000-0000-0000-000000000001', 'Tintas', 'tintas', 'products', 3, true),
  ('c0000013-0000-0000-0000-000000000001', 'b0000004-0000-0000-0000-000000000001', 'Elétrica', 'eletrica', 'products', 4, true),
  ('c0000014-0000-0000-0000-000000000001', 'b0000004-0000-0000-0000-000000000001', 'Cotação WhatsApp', 'cotacao-whatsapp', 'whatsapp', 5, true),
  -- Hotel Recanto
  ('c0000015-0000-0000-0000-000000000001', 'b0000005-0000-0000-0000-000000000001', 'Guia do Quarto', 'guia-quarto', 'info', 0, true),
  ('c0000016-0000-0000-0000-000000000001', 'b0000005-0000-0000-0000-000000000001', 'Wi-Fi', 'wifi', 'info', 1, true),
  ('c0000017-0000-0000-0000-000000000001', 'b0000005-0000-0000-0000-000000000001', 'Serviço de Quarto', 'room-service', 'menu', 2, true),
  ('c0000018-0000-0000-0000-000000000001', 'b0000005-0000-0000-0000-000000000001', 'Recepção WhatsApp', 'recepcao-whatsapp', 'whatsapp', 3, true),
  -- Imobiliária Prime
  ('c0000019-0000-0000-0000-000000000001', 'b0000006-0000-0000-0000-000000000001', 'Imóveis', 'imoveis', 'products', 0, true),
  ('c0000020-0000-0000-0000-000000000001', 'b0000006-0000-0000-0000-000000000001', 'Agendar Visita', 'agendar-visita', 'whatsapp', 1, true),
  -- Eventos Festa Perfeita
  ('c0000021-0000-0000-0000-000000000001', 'b0000007-0000-0000-0000-000000000001', 'Convite', 'convite', 'info', 0, true),
  ('c0000022-0000-0000-0000-000000000001', 'b0000007-0000-0000-0000-000000000001', 'Programação', 'programacao', 'schedule', 1, true),
  ('c0000023-0000-0000-0000-000000000001', 'b0000007-0000-0000-0000-000000000001', 'Localização', 'localizacao', 'info', 2, true),
  ('c0000024-0000-0000-0000-000000000001', 'b0000007-0000-0000-0000-000000000001', 'Confirmar Presença', 'rsvp', 'whatsapp', 3, true),
  -- Clínica Vita
  ('c0000025-0000-0000-0000-000000000001', 'b0000008-0000-0000-0000-000000000001', 'Serviços', 'servicos', 'services', 0, true),
  ('c0000026-0000-0000-0000-000000000001', 'b0000008-0000-0000-0000-000000000001', 'Médicos', 'medicos', 'info', 1, true),
  ('c0000027-0000-0000-0000-000000000001', 'b0000008-0000-0000-0000-000000000001', 'Agendamento', 'agendamento', 'whatsapp', 2, true),
  -- Academia Força Total
  ('c0000028-0000-0000-0000-000000000001', 'b0000009-0000-0000-0000-000000000001', 'Planos', 'planos', 'products', 0, true),
  ('c0000029-0000-0000-0000-000000000001', 'b0000009-0000-0000-0000-000000000001', 'Horários', 'horarios', 'schedule', 1, true),
  ('c0000030-0000-0000-0000-000000000001', 'b0000009-0000-0000-0000-000000000001', 'Aulas', 'aulas', 'info', 2, true),
  ('c0000031-0000-0000-0000-000000000001', 'b0000009-0000-0000-0000-000000000001', 'Matrícula WhatsApp', 'matricula-whatsapp', 'whatsapp', 3, true),
  -- Oficina do Zé
  ('c0000032-0000-0000-0000-000000000001', 'b0000010-0000-0000-0000-000000000001', 'Serviços', 'servicos', 'services', 0, true),
  ('c0000033-0000-0000-0000-000000000001', 'b0000010-0000-0000-0000-000000000001', 'Orçamento', 'orcamento', 'whatsapp', 1, true),
  -- DesignStudio by Ana
  ('c0000034-0000-0000-0000-000000000001', 'b0000011-0000-0000-0000-000000000001', 'Serviços', 'servicos', 'services', 0, true),
  ('c0000035-0000-0000-0000-000000000001', 'b0000011-0000-0000-0000-000000000001', 'Portfólio', 'portfolio', 'gallery', 1, true),
  ('c0000036-0000-0000-0000-000000000001', 'b0000011-0000-0000-0000-000000000001', 'Orçamento Rápido', 'orcamento-rapido', 'whatsapp', 2, true),
  -- Igreja Esperança
  ('c0000037-0000-0000-0000-000000000001', 'b0000012-0000-0000-0000-000000000001', 'Programação', 'programacao', 'schedule', 0, true),
  ('c0000038-0000-0000-0000-000000000001', 'b0000012-0000-0000-0000-000000000001', 'Eventos', 'eventos', 'events', 1, true),
  ('c0000039-0000-0000-0000-000000000001', 'b0000012-0000-0000-0000-000000000001', 'Contribuições', 'contribuicoes', 'info', 2, true),
  ('c0000040-0000-0000-0000-000000000001', 'b0000012-0000-0000-0000-000000000001', 'Contato WhatsApp', 'contato-whatsapp', 'whatsapp', 3, true),
  -- Supermercado Preço Bom
  ('c0000041-0000-0000-0000-000000000001', 'b0000013-0000-0000-0000-000000000001', 'Informações do Produto', 'info-produto', 'info', 0, true),
  ('c0000042-0000-0000-0000-000000000001', 'b0000013-0000-0000-0000-000000000001', 'Preço', 'preco', 'info', 1, true),
  ('c0000043-0000-0000-0000-000000000001', 'b0000013-0000-0000-0000-000000000001', 'Como Usar', 'como-usar', 'info', 2, true),
  ('c0000044-0000-0000-0000-000000000001', 'b0000013-0000-0000-0000-000000000001', 'Fale com o Vendedor', 'fale-vendedor', 'whatsapp', 3, true)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- New Items
-- ============================================

INSERT INTO public.items (id, section_id, name, description, price, original_price, item_type, is_available, sort_order)
VALUES
  -- Casa & Obra: Cimento
  ('d0000022-0000-0000-0000-000000000001', 'c0000009-0000-0000-0000-000000000001', 'Cimento CP II 50kg', 'Cimento Portland CP II-E 32', 29.90, NULL, 'product', true, 0),
  ('d0000023-0000-0000-0000-000000000001', 'c0000009-0000-0000-0000-000000000001', 'Cimento CP IV 50kg', 'Cimento Pozolânico', 27.90, NULL, 'product', true, 1),
  -- Casa & Obra: Areia e Pedra
  ('d0000024-0000-0000-0000-000000000001', 'c0000010-0000-0000-0000-000000000001', 'Areia Média m³', 'Areia lavada média', 85.00, NULL, 'product', true, 0),
  ('d0000025-0000-0000-0000-000000000001', 'c0000010-0000-0000-0000-000000000001', 'Brita 1 m³', 'Pedra britada nº 1', 95.00, NULL, 'product', true, 1),
  -- Casa & Obra: Tijolos e Blocos
  ('d0000026-0000-0000-0000-000000000001', 'c0000011-0000-0000-0000-000000000001', 'Tijolo Baiano', 'Tijolo cerâmico 8 furos', 1.20, NULL, 'product', true, 0),
  ('d0000027-0000-0000-0000-000000000001', 'c0000011-0000-0000-0000-000000000001', 'Bloco de Concreto', 'Bloco estrutural 14x19x39', 3.50, NULL, 'product', true, 1),
  -- Casa & Obra: Tintas
  ('d0000028-0000-0000-0000-000000000001', 'c0000012-0000-0000-0000-000000000001', 'Tinta Acrílica 18L', 'Branco neve', 189.90, NULL, 'product', true, 0),
  ('d0000029-0000-0000-0000-000000000001', 'c0000012-0000-0000-0000-000000000001', 'Esmalte Sintético', 'Brilhante 3.6L', 89.90, NULL, 'product', true, 1),
  -- Casa & Obra: Elétrica
  ('d0000030-0000-0000-0000-000000000001', 'c0000013-0000-0000-0000-000000000001', 'Fio 2.5mm 100m', 'Cabo elétrico 2.5mm²', 149.90, NULL, 'product', true, 0),
  ('d0000031-0000-0000-0000-000000000001', 'c0000013-0000-0000-0000-000000000001', 'Disjuntor 16A', 'Disjuntor monopolizar 16A', 12.90, NULL, 'product', true, 1),
  -- Hotel: Guia do Quarto
  ('d0000032-0000-0000-0000-000000000001', 'c0000015-0000-0000-0000-000000000001', 'Café da Manhã', 'Servido das 6h às 10h no restaurante', 0, NULL, 'product', true, 0),
  ('d0000033-0000-0000-0000-000000000001', 'c0000015-0000-0000-0000-000000000001', 'Check-out', 'Horário: até 12h', 0, NULL, 'product', true, 1),
  ('d0000034-0000-0000-0000-000000000001', 'c0000015-0000-0000-0000-000000000001', 'Late Check-out', 'Disponível mediante disponibilidade', 50.00, NULL, 'product', true, 2),
  -- Hotel: Wi-Fi
  ('d0000035-0000-0000-0000-000000000001', 'c0000016-0000-0000-0000-000000000001', 'Rede: Hotel Recanto', 'Senha disponível na recepção', 0, NULL, 'product', true, 0),
  -- Hotel: Room Service
  ('d0000036-0000-0000-0000-000000000001', 'c0000017-0000-0000-0000-000000000001', 'Água Mineral', 'Garrafa 500ml', 5.00, NULL, 'product', true, 0),
  ('d0000037-0000-0000-0000-000000000001', 'c0000017-0000-0000-0000-000000000001', 'Refrigerante', 'Lata 350ml', 8.00, NULL, 'product', true, 1),
  ('d0000038-0000-0000-0000-000000000001', 'c0000017-0000-0000-0000-000000000001', 'Sanduíche Natural', 'Pão integral, frango, alface e tomate', 25.00, NULL, 'product', true, 2),
  -- Imobiliária: Imóveis
  ('d0000039-0000-0000-0000-000000000001', 'c0000019-0000-0000-0000-000000000001', 'Casa Alto Padrão', '4 suítes, piscina, 500m² de terreno', 1200000.00, NULL, 'product', true, 0),
  ('d0000040-0000-0000-0000-000000000001', 'c0000019-0000-0000-0000-000000000001', 'Apartamento Cobertura', '3 suítes, 200m², 2 vagas, vista panorâmica', 850000.00, NULL, 'product', true, 1),
  ('d0000041-0000-0000-0000-000000000001', 'c0000019-0000-0000-0000-000000000001', 'Kitchenette', '1 quarto, 40m², mobiliado', 180000.00, NULL, 'product', true, 2),
  -- Evento: Convite
  ('d0000042-0000-0000-0000-000000000001', 'c0000021-0000-0000-0000-000000000001', 'Cerimônia', 'Salão Principal - 20:00', 0, NULL, 'product', true, 0),
  ('d0000043-0000-0000-0000-000000000001', 'c0000021-0000-0000-0000-000000000001', 'Recepção', 'Salão de Festas - 21:30', 0, NULL, 'product', true, 1),
  -- Evento: Programação
  ('d0000044-0000-0000-0000-000000000001', 'c0000022-0000-0000-0000-000000000001', 'Abertura', '20:00 - Recepção com coquetel', 0, NULL, 'product', true, 0),
  ('d0000045-0000-0000-0000-000000000001', 'c0000022-0000-0000-0000-000000000001', 'Jantar', '21:00 - Buffet completo', 0, NULL, 'product', true, 1),
  ('d0000046-0000-0000-0000-000000000001', 'c0000022-0000-0000-0000-000000000001', 'Show', '22:30 - Banda ao vivo', 0, NULL, 'product', true, 2),
  -- Clínica: Serviços
  ('d0000047-0000-0000-0000-000000000001', 'c0000025-0000-0000-0000-000000000001', 'Consulta Clínico Geral', 'Avaliação médica completa', 150.00, NULL, 'service', true, 0),
  ('d0000048-0000-0000-0000-000000000001', 'c0000025-0000-0000-0000-000000000001', 'Consulta Pediatra', 'Acompanhamento infantil', 160.00, NULL, 'service', true, 1),
  ('d0000049-0000-0000-0000-000000000001', 'c0000025-0000-0000-0000-000000000001', 'Exames Laboratoriais', 'Solicitação e coleta', 0, NULL, 'service', true, 2),
  ('d0000050-0000-0000-0000-000000000001', 'c0000025-0000-0000-0000-000000000001', 'Teleconsulta', 'Consulta online por videochamada', 120.00, NULL, 'service', true, 3),
  -- Clínica: Médicos
  ('d0000051-0000-0000-0000-000000000001', 'c0000026-0000-0000-0000-000000000001', 'Dr. Carlos Mendes', 'Clínico Geral - CRM 78901', 0, NULL, 'product', true, 0),
  ('d0000052-0000-0000-0000-000000000001', 'c0000026-0000-0000-0000-000000000001', 'Dra. Fernanda Lima', 'Pediatra - CRM 78902', 0, NULL, 'product', true, 1),
  ('d0000053-0000-0000-0000-000000000001', 'c0000026-0000-0000-0000-000000000001', 'Dr. Ricardo Torres', 'Cardiologista - CRM 78903', 0, NULL, 'product', true, 2),
  -- Academia: Planos
  ('d0000054-0000-0000-0000-000000000001', 'c0000028-0000-0000-0000-000000000001', 'Plano Mensal', 'Acesso ilimitado à academia', 89.90, NULL, 'product', true, 0),
  ('d0000055-0000-0000-0000-000000000001', 'c0000028-0000-0000-0000-000000000001', 'Plano Trimestral', '3 meses com 10% de desconto', 239.90, NULL, 'product', true, 1),
  ('d0000056-0000-0000-0000-000000000001', 'c0000028-0000-0000-0000-000000000001', 'Aula Experimental Grátis', 'Primeira aula gratuita sem compromisso', 0, NULL, 'product', true, 2),
  -- Academia: Horários
  ('d0000057-0000-0000-0000-000000000001', 'c0000029-0000-0000-0000-000000000001', 'Segunda a Sexta', '06:00 - 22:00', 0, NULL, 'product', true, 0),
  ('d0000058-0000-0000-0000-000000000001', 'c0000029-0000-0000-0000-000000000001', 'Sábado', '08:00 - 18:00', 0, NULL, 'product', true, 1),
  ('d0000059-0000-0000-0000-000000000001', 'c0000029-0000-0000-0000-000000000001', 'Domingo', '09:00 - 13:00', 0, NULL, 'product', true, 2),
  -- Academia: Aulas
  ('d0000060-0000-0000-0000-000000000001', 'c0000030-0000-0000-0000-000000000001', 'Musculação', 'Acompanhamento profissional', 0, NULL, 'service', true, 0),
  ('d0000061-0000-0000-0000-000000000001', 'c0000030-0000-0000-0000-000000000001', 'CrossFit', 'Treino funcional intenso', 0, NULL, 'service', true, 1),
  ('d0000062-0000-0000-0000-000000000001', 'c0000030-0000-0000-0000-000000000001', 'Pilates', 'Alongamento e fortalecimento', 0, NULL, 'service', true, 2),
  ('d0000063-0000-0000-0000-000000000001', 'c0000030-0000-0000-0000-000000000001', 'Spinning', 'Aula de bike indoor', 0, NULL, 'service', true, 3),
  -- Oficina do Zé: Serviços
  ('d0000064-0000-0000-0000-000000000001', 'c0000032-0000-0000-0000-000000000001', 'Revisão Completa', 'Troca de óleo, filtros, velas e correias', 199.90, NULL, 'service', true, 0),
  ('d0000065-0000-0000-0000-000000000001', 'c0000032-0000-0000-0000-000000000001', 'Troca de Óleo', 'Óleo + filtro + mão de obra', 89.90, NULL, 'service', true, 1),
  ('d0000066-0000-0000-0000-000000000001', 'c0000032-0000-0000-0000-000000000001', 'Alinhamento e Balanceamento', '4 rodas', 79.90, NULL, 'service', true, 2),
  ('d0000067-0000-0000-0000-000000000001', 'c0000032-0000-0000-0000-000000000001', 'Troca de Pneus', 'Mão de obra para 4 pneus', 60.00, NULL, 'service', true, 3),
  ('d0000068-0000-0000-0000-000000000001', 'c0000032-0000-0000-0000-000000000001', 'Freios', 'Troca de pastilhas e discos', 149.90, NULL, 'service', true, 4),
  -- DesignStudio: Serviços
  ('d0000069-0000-0000-0000-000000000001', 'c0000034-0000-0000-0000-000000000001', 'Identidade Visual', 'Logo, cores, tipografia e manual da marca', 1500.00, NULL, 'service', true, 0),
  ('d0000070-0000-0000-0000-000000000001', 'c0000034-0000-0000-0000-000000000001', 'Design Social Media', 'Artes para Instagram, Facebook e LinkedIn', 500.00, NULL, 'service', true, 1),
  ('d0000071-0000-0000-0000-000000000001', 'c0000034-0000-0000-0000-000000000001', 'Criação de Site', 'Site institucional ou landing page', 2000.00, NULL, 'service', true, 2),
  ('d0000072-0000-0000-0000-000000000001', 'c0000034-0000-0000-0000-000000000001', 'Consultoria', 'Por hora - mentoria em design', 100.00, NULL, 'service', true, 3),
  -- Igreja: Programação
  ('d0000073-0000-0000-0000-000000000001', 'c0000037-0000-0000-0000-000000000001', 'Culto Dominical', 'Domingo 09:00 e 19:00', 0, NULL, 'product', true, 0),
  ('d0000074-0000-0000-0000-000000000001', 'c0000037-0000-0000-0000-000000000001', 'Culto de Oração', 'Quarta-feira 19:00', 0, NULL, 'product', true, 1),
  ('d0000075-0000-0000-0000-000000000001', 'c0000037-0000-0000-0000-000000000001', 'Grupo Jovem', 'Sábado 18:00', 0, NULL, 'product', true, 2),
  -- Igreja: Contribuições
  ('d0000076-0000-0000-0000-000000000001', 'c0000039-0000-0000-0000-000000000001', 'Dízimo', 'Contribua com seu dízimo via PIX', 0, NULL, 'product', true, 0),
  ('d0000077-0000-0000-0000-000000000001', 'c0000039-0000-0000-0000-000000000001', 'Ofertas', 'Ofertas voluntárias', 0, NULL, 'product', true, 1),
  -- Supermercado: Produto
  ('d0000078-0000-0000-0000-000000000001', 'c0000041-0000-0000-0000-000000000001', 'Arroz Tipo 1 5kg', 'Arroz agulhinha tipo 1', 0, NULL, 'product', true, 0),
  ('d0000079-0000-0000-0000-000000000001', 'c0000041-0000-0000-0000-000000000001', 'Feijão Preto 1kg', 'Feijão preto tipo 1', 0, NULL, 'product', true, 1),
  ('d0000080-0000-0000-0000-000000000001', 'c0000041-0000-0000-0000-000000000001', 'Óleo de Soja 900ml', 'Óleo de soja refinado', 0, NULL, 'product', true, 2),
  -- Supermercado: Preço
  ('d0000081-0000-0000-0000-000000000001', 'c0000042-0000-0000-0000-000000000001', 'Preço à Vista', 'Consulte nosso preço especial no caixa', 0, NULL, 'product', true, 0),
  ('d0000082-0000-0000-0000-000000000001', 'c0000042-0000-0000-0000-000000000001', 'Preço em 3x', 'Parcelamento no cartão de crédito', 0, NULL, 'product', true, 1)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- New QR Codes
-- ============================================

INSERT INTO public.qr_codes (id, business_id, page_id, short_code, title, is_active, scan_count)
VALUES
  ('e0000006-0000-0000-0000-000000000001', 'a0000004-0000-0000-0000-000000000001', 'b0000004-0000-0000-0000-000000000001', 'casaob1', 'Catálogo - Balcão', true, 32),
  ('e0000007-0000-0000-0000-000000000001', 'a0000005-0000-0000-0000-000000000001', 'b0000005-0000-0000-0000-000000000001', 'recanto1', 'Guia do Hóspede - Quartos', true, 78),
  ('e0000008-0000-0000-0000-000000000001', 'a0000005-0000-0000-0000-000000000001', 'b0000005-0000-0000-0000-000000000001', 'recanto2', 'Guia do Hóspede - Recepção', true, 45),
  ('e0000009-0000-0000-0000-000000000001', 'a0000006-0000-0000-0000-000000000001', 'b0000006-0000-0000-0000-000000000001', 'prime1', 'Imóveis - Vitrine', true, 23),
  ('e0000010-0000-0000-0000-000000000001', 'a0000007-0000-0000-0000-000000000001', 'b0000007-0000-0000-0000-000000000001', 'festa1', 'Convite Festa', true, 67),
  ('e0000011-0000-0000-0000-000000000001', 'a0000008-0000-0000-0000-000000000001', 'b0000008-0000-0000-0000-000000000001', 'vitac1', 'Serviços - Recepção', true, 41),
  ('e0000012-0000-0000-0000-000000000001', 'a0000009-0000-0000-0000-000000000001', 'b0000009-0000-0000-0000-000000000001', 'forcat1', 'Planos - Recepção', true, 55),
  ('e0000013-0000-0000-0000-000000000001', 'a0000010-0000-0000-0000-000000000001', 'b0000010-0000-0000-0000-000000000001', 'zeofi1', 'Serviços - Balcão', true, 19),
  ('e0000014-0000-0000-0000-000000000001', 'a0000011-0000-0000-0000-000000000001', 'b0000011-0000-0000-0000-000000000001', 'anads1', 'Portfólio - Cartão', true, 38),
  ('e0000015-0000-0000-0000-000000000001', 'a0000012-0000-0000-0000-000000000001', 'b0000012-0000-0000-0000-000000000001', 'esper1', 'Programação - Aviso', true, 12)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- New QR Styles
-- ============================================
INSERT INTO public.qr_styles (qr_code_id, dot_style, corner_style, foreground_color, background_color, error_correction_level)
VALUES
  ('e0000006-0000-0000-0000-000000000001', 'rounded', 'rounded', '#F59E0B', '#FFFBEB', 'M'),
  ('e0000007-0000-0000-0000-000000000001', 'dots', 'rounded', '#1E3A5F', '#F0F5FA', 'L'),
  ('e0000008-0000-0000-0000-000000000001', 'rounded', 'rounded', '#1E3A5F', '#F0F5FA', 'L'),
  ('e0000009-0000-0000-0000-000000000001', 'square', 'square', '#059669', '#F0FDF4', 'M'),
  ('e0000010-0000-0000-0000-000000000001', 'rounded', 'rounded', '#7C3AED', '#F5F3FF', 'M'),
  ('e0000011-0000-0000-0000-000000000001', 'dots', 'rounded', '#0891B2', '#ECFEFF', 'M'),
  ('e0000012-0000-0000-0000-000000000001', 'rounded', 'rounded', '#DC2626', '#FEF2F2', 'H'),
  ('e0000013-0000-0000-0000-000000000001', 'rounded', 'square', '#1F2937', '#F9FAFB', 'M'),
  ('e0000014-0000-0000-0000-000000000001', 'dots', 'rounded', '#EC4899', '#FDF2F8', 'M'),
  ('e0000015-0000-0000-0000-000000000001', 'rounded', 'rounded', '#D97706', '#FFFBEB', 'H')
ON CONFLICT (qr_code_id) DO NOTHING;

-- ============================================
-- Additional Scans for new QR codes
-- ============================================

-- Scans for Casa & Obra
INSERT INTO public.scans (id, qr_code_id, page_id, ip_address, user_agent, device_type, browser, country, city, referrer, created_at)
SELECT
  gen_random_uuid(),
  'e0000006-0000-0000-0000-000000000001',
  'b0000004-0000-0000-0000-000000000001',
  '10.0.1.' || (10 + floor(random() * 100)::int),
  CASE floor(random() * 3)::int
    WHEN 0 THEN 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    WHEN 1 THEN 'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36'
    ELSE 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15'
  END,
  CASE floor(random() * 2)::int WHEN 0 THEN 'desktop' ELSE 'mobile' END,
  'Chrome',
  'Brasil',
  'São Paulo',
  'google.com',
  now() - (random() * interval '20 days')
FROM generate_series(1, 15);

-- Scans for Hotel Recanto
INSERT INTO public.scans (id, qr_code_id, page_id, ip_address, user_agent, device_type, browser, referrer, created_at)
SELECT
  gen_random_uuid(),
  'e0000007-0000-0000-0000-000000000001',
  'b0000005-0000-0000-0000-000000000001',
  '172.16.0.' || (10 + floor(random() * 50)::int),
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
  'mobile',
  'Safari',
  'google.com',
  now() - (random() * interval '14 days')
FROM generate_series(1, 25);

-- Scans for Imobiliária Prime
INSERT INTO public.scans (id, qr_code_id, page_id, ip_address, user_agent, device_type, browser, referrer, created_at)
SELECT
  gen_random_uuid(),
  'e0000009-0000-0000-0000-000000000001',
  'b0000006-0000-0000-0000-000000000001',
  '192.168.10.' || (10 + floor(random() * 50)::int),
  CASE floor(random() * 2)::int
    WHEN 0 THEN 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    ELSE 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15'
  END,
  CASE floor(random() * 2)::int WHEN 0 THEN 'desktop' ELSE 'mobile' END,
  'Chrome',
  'instagram.com',
  now() - (random() * interval '25 days')
FROM generate_series(1, 10);

-- Scans for Evento Festa Perfeita
INSERT INTO public.scans (id, qr_code_id, page_id, ip_address, user_agent, device_type, browser, created_at)
SELECT
  gen_random_uuid(),
  'e0000010-0000-0000-0000-000000000001',
  'b0000007-0000-0000-0000-000000000001',
  '10.0.2.' || (10 + floor(random() * 80)::int),
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
  'mobile',
  'Safari',
  now() - (random() * interval '10 days')
FROM generate_series(1, 20);

-- Scans for Clínica Vita
INSERT INTO public.scans (id, qr_code_id, page_id, ip_address, user_agent, device_type, browser, referrer, created_at)
SELECT
  gen_random_uuid(),
  'e0000011-0000-0000-0000-000000000001',
  'b0000008-0000-0000-0000-000000000001',
  '192.168.5.' || (10 + floor(random() * 30)::int),
  'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36',
  'mobile',
  'Chrome',
  'google.com',
  now() - (random() * interval '7 days')
FROM generate_series(1, 12);

-- Scans for Academia Força Total
INSERT INTO public.scans (id, qr_code_id, page_id, ip_address, user_agent, device_type, browser, created_at)
SELECT
  gen_random_uuid(),
  'e0000012-0000-0000-0000-000000000001',
  'b0000009-0000-0000-0000-000000000001',
  '10.0.3.' || (10 + floor(random() * 40)::int),
  CASE floor(random() * 2)::int
    WHEN 0 THEN 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)'
    ELSE 'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36'
  END,
  'mobile',
  'Chrome',
  now() - (random() * interval '30 days')
FROM generate_series(1, 18);

-- Scans for Oficina do Zé
INSERT INTO public.scans (id, qr_code_id, page_id, ip_address, user_agent, device_type, browser, referrer, created_at)
SELECT
  gen_random_uuid(),
  'e0000013-0000-0000-0000-000000000001',
  'b0000010-0000-0000-0000-000000000001',
  '10.0.4.' || (10 + floor(random() * 20)::int),
  'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36',
  'mobile',
  'Chrome',
  'google.com',
  now() - (random() * interval '15 days')
FROM generate_series(1, 8);

-- Scans for DesignStudio by Ana
INSERT INTO public.scans (id, qr_code_id, page_id, ip_address, user_agent, device_type, browser, referrer, created_at)
SELECT
  gen_random_uuid(),
  'e0000014-0000-0000-0000-000000000001',
  'b0000011-0000-0000-0000-000000000001',
  '192.168.8.' || (10 + floor(random() * 30)::int),
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
  'desktop',
  'Chrome',
  'instagram.com',
  now() - (random() * interval '20 days')
FROM generate_series(1, 14);

-- Scans for Igreja Esperança
INSERT INTO public.scans (id, qr_code_id, page_id, ip_address, user_agent, device_type, browser, created_at)
SELECT
  gen_random_uuid(),
  'e0000015-0000-0000-0000-000000000001',
  'b0000012-0000-0000-0000-000000000001',
  '172.16.1.' || (10 + floor(random() * 20)::int),
  CASE floor(random() * 2)::int
    WHEN 0 THEN 'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36'
    ELSE 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)'
  END,
  'mobile',
  'Chrome',
  now() - (random() * interval '12 days')
FROM generate_series(1, 6);

-- ============================================
-- Additional Clicks for new scans
-- ============================================
INSERT INTO public.clicks (id, scan_id, qr_code_id, page_id, click_type, created_at)
SELECT
  gen_random_uuid(),
  s.id,
  s.qr_code_id,
  s.page_id,
  CASE floor(random() * 4)::int
    WHEN 0 THEN 'whatsapp'
    WHEN 1 THEN 'website'
    WHEN 2 THEN 'instagram'
    ELSE 'phone'
  END,
  s.created_at + interval '20 seconds' + (random() * interval '3 minutes')
FROM public.scans s
WHERE s.qr_code_id IN (
  'e0000006-0000-0000-0000-000000000001',
  'e0000007-0000-0000-0000-000000000001',
  'e0000010-0000-0000-0000-000000000001',
  'e0000011-0000-0000-0000-000000000001',
  'e0000012-0000-0000-0000-000000000001',
  'e0000014-0000-0000-0000-000000000001'
)
AND random() < 0.3
LIMIT 35;

-- ============================================
-- Scans (last 30 days) - Original
-- ============================================
INSERT INTO public.scans (id, qr_code_id, page_id, ip_address, user_agent, device_type, browser, country, city, referrer, created_at)
SELECT
  gen_random_uuid(),
  'e0000001-0000-0000-0000-000000000001',
  'b0000001-0000-0000-0000-000000000001',
  '192.168.1.' || (10 + floor(random() * 240)::int),
  CASE floor(random() * 4)::int
    WHEN 0 THEN 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15'
    WHEN 1 THEN 'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36'
    WHEN 2 THEN 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    ELSE 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
  END,
  CASE floor(random() * 3)::int
    WHEN 0 THEN 'mobile'
    WHEN 1 THEN 'mobile'
    ELSE 'desktop'
  END,
  CASE floor(random() * 3)::int
    WHEN 0 THEN 'Safari'
    WHEN 1 THEN 'Chrome'
    ELSE 'Chrome'
  END,
  'Brasil',
  CASE floor(random() * 5)::int
    WHEN 0 THEN 'São Paulo'
    WHEN 1 THEN 'São Paulo'
    WHEN 2 THEN 'São Paulo'
    WHEN 3 THEN 'Campinas'
    ELSE 'Osasco'
  END,
  CASE floor(random() * 3)::int
    WHEN 0 THEN 'instagram.com'
    WHEN 1 THEN 'google.com'
    ELSE NULL
  END,
  now() - (random() * interval '30 days')
FROM generate_series(1, 50);

-- Scans for QR 2 (takeout)
INSERT INTO public.scans (id, qr_code_id, page_id, ip_address, user_agent, device_type, browser, referrer, created_at)
SELECT
  gen_random_uuid(),
  'e0000002-0000-0000-0000-000000000001',
  'b0000001-0000-0000-0000-000000000001',
  '192.168.2.' || (10 + floor(random() * 200)::int),
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
  'mobile',
  'Safari',
  NULL,
  now() - (random() * interval '20 days')
FROM generate_series(1, 20);

-- Scans for QR 3 (inactive promo - older scans)
INSERT INTO public.scans (id, qr_code_id, page_id, ip_address, user_agent, device_type, browser, country, city, created_at)
SELECT
  gen_random_uuid(),
  'e0000003-0000-0000-0000-000000000001',
  'b0000001-0000-0000-0000-000000000001',
  '192.168.3.' || (10 + floor(random() * 100)::int),
  'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36',
  'mobile',
  'Chrome',
  'Brasil',
  'São Paulo',
  now() - interval '60 days' - (random() * interval '90 days')
FROM generate_series(1, 30);

-- Scans for Salon
INSERT INTO public.scans (id, qr_code_id, page_id, ip_address, user_agent, device_type, browser, referrer, created_at)
SELECT
  gen_random_uuid(),
  'e0000004-0000-0000-0000-000000000001',
  'b0000002-0000-0000-0000-000000000001',
  '192.168.4.' || (10 + floor(random() * 150)::int),
  CASE floor(random() * 2)::int
    WHEN 0 THEN 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)'
    ELSE 'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36'
  END,
  'mobile',
  'Chrome',
  CASE floor(random() * 2)::int WHEN 0 THEN 'instagram.com' ELSE NULL END,
  now() - (random() * interval '25 days')
FROM generate_series(1, 30);

-- Scans for Pet Shop
INSERT INTO public.scans (id, qr_code_id, page_id, ip_address, user_agent, device_type, browser, created_at)
SELECT
  gen_random_uuid(),
  'e0000005-0000-0000-0000-000000000001',
  'b0000003-0000-0000-0000-000000000001',
  '10.0.0.' || (10 + floor(random() * 100)::int),
  'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36',
  'mobile',
  'Chrome',
  now() - (random() * interval '15 days')
FROM generate_series(1, 15);

-- ============================================
-- Clicks (derived from scans)
-- ============================================
INSERT INTO public.clicks (id, scan_id, qr_code_id, page_id, click_type, created_at)
SELECT
  gen_random_uuid(),
  s.id,
  s.qr_code_id,
  s.page_id,
  CASE floor(random() * 5)::int
    WHEN 0 THEN 'whatsapp'
    WHEN 1 THEN 'instagram'
    WHEN 2 THEN 'phone'
    WHEN 3 THEN 'maps'
    ELSE 'website'
  END,
  s.created_at + interval '30 seconds' + (random() * interval '5 minutes')
FROM public.scans s
WHERE s.qr_code_id IN (
  'e0000001-0000-0000-0000-000000000001',
  'e0000004-0000-0000-0000-000000000001',
  'e0000005-0000-0000-0000-000000000001'
)
AND random() < 0.35
LIMIT 40;
