-- ============================================
-- MeuQR - Seed Data
-- ============================================
-- This migration inserts demo data for testing.
-- Run only in development/staging environments.

-- ============================================
-- Template Sections & Items
-- ============================================

-- Restaurant template sections
INSERT INTO template_sections (template_id, name, slug, sort_order)
SELECT id, 'Cardápio', 'cardapio', 0 FROM templates WHERE slug = 'restaurante'
UNION ALL
SELECT id, 'Bebidas', 'bebidas', 1 FROM templates WHERE slug = 'restaurante'
UNION ALL
SELECT id, 'Promoções', 'promocoes', 2 FROM templates WHERE slug = 'restaurante'
UNION ALL
SELECT id, 'Pedido WhatsApp', 'pedido-whatsapp', 3 FROM templates WHERE slug = 'restaurante';

-- Restaurant template items
INSERT INTO template_items (section_id, name, description, price, sort_order)
SELECT ts.id, 'Prato Feito', 'Arroz, feijão, carne, salada e batata frita', 29.90, 0
FROM template_sections ts JOIN templates t ON t.id = ts.template_id
WHERE t.slug = 'restaurante' AND ts.slug = 'cardapio'
UNION ALL
SELECT ts.id, 'Hambúrguer Artesanal', '200g de carne, queijo, alface, tomate e molho especial', 34.90, 1
FROM template_sections ts JOIN templates t ON t.id = ts.template_id
WHERE t.slug = 'restaurante' AND ts.slug = 'cardapio'
UNION ALL
SELECT ts.id, 'Pizza Margherita', 'Molho de tomate, mussarela e manjericão', 49.90, 2
FROM template_sections ts JOIN templates t ON t.id = ts.template_id
WHERE t.slug = 'restaurante' AND ts.slug = 'cardapio'
UNION ALL
SELECT ts.id, 'Refrigerante Lata', 'Coca-Cola, Guaraná, Fanta', 6.00, 0
FROM template_sections ts JOIN templates t ON t.id = ts.template_id
WHERE t.slug = 'restaurante' AND ts.slug = 'bebidas'
UNION ALL
SELECT ts.id, 'Suco Natural', 'Laranja, limão, maracujá', 8.00, 1
FROM template_sections ts JOIN templates t ON t.id = ts.template_id
WHERE t.slug = 'restaurante' AND ts.slug = 'bebidas'
UNION ALL
SELECT ts.id, 'Combo Executivo', 'Prato feito + Bebida', 34.90, 0
FROM template_sections ts JOIN templates t ON t.id = ts.template_id
WHERE t.slug = 'restaurante' AND ts.slug = 'promocoes';

-- Construction Materials template sections
INSERT INTO template_sections (template_id, name, slug, sort_order)
SELECT id, 'Cimento', 'cimento', 0 FROM templates WHERE slug = 'material-construcao'
UNION ALL
SELECT id, 'Areia e Pedra', 'areia-pedra', 1 FROM templates WHERE slug = 'material-construcao'
UNION ALL
SELECT id, 'Tijolos e Blocos', 'tijolos-blocos', 2 FROM templates WHERE slug = 'material-construcao'
UNION ALL
SELECT id, 'Tintas', 'tintas', 3 FROM templates WHERE slug = 'material-construcao'
UNION ALL
SELECT id, 'Elétrica', 'eletrica', 4 FROM templates WHERE slug = 'material-construcao'
UNION ALL
SELECT id, 'Cotação WhatsApp', 'cotacao-whatsapp', 5 FROM templates WHERE slug = 'material-construcao';

-- Salon template sections
INSERT INTO template_sections (template_id, name, slug, sort_order)
SELECT id, 'Serviços', 'servicos', 0 FROM templates WHERE slug = 'salao-barbearia'
UNION ALL
SELECT id, 'Portfólio', 'portfolio', 1 FROM templates WHERE slug = 'salao-barbearia'
UNION ALL
SELECT id, 'Agendamento', 'agendamento', 2 FROM templates WHERE slug = 'salao-barbearia';

-- Hotel template sections
INSERT INTO template_sections (template_id, name, slug, sort_order)
SELECT id, 'Guia do Quarto', 'guia-quarto', 0 FROM templates WHERE slug = 'hotel'
UNION ALL
SELECT id, 'Wi-Fi', 'wifi', 1 FROM templates WHERE slug = 'hotel'
UNION ALL
SELECT id, 'Serviço de Quarto', 'room-service', 2 FROM templates WHERE slug = 'hotel'
UNION ALL
SELECT id, 'Regras', 'regras', 3 FROM templates WHERE slug = 'hotel'
UNION ALL
SELECT id, 'Recepção WhatsApp', 'recepcao-whatsapp', 4 FROM templates WHERE slug = 'hotel';

-- ============================================
-- Pet Shop template sections
-- ============================================
INSERT INTO template_sections (template_id, name, slug, sort_order)
SELECT id, 'Serviços', 'servicos', 0 FROM templates WHERE slug = 'pet-shop'
UNION ALL
SELECT id, 'Produtos', 'produtos', 1 FROM templates WHERE slug = 'pet-shop'
UNION ALL
SELECT id, 'Agendamento', 'agendamento', 2 FROM templates WHERE slug = 'pet-shop';

-- ============================================
-- Real Estate template sections
-- ============================================
INSERT INTO template_sections (template_id, name, slug, sort_order)
SELECT id, 'Imóveis', 'imoveis', 0 FROM templates WHERE slug = 'imobiliaria'
UNION ALL
SELECT id, 'Galeria', 'galeria', 1 FROM templates WHERE slug = 'imobiliaria'
UNION ALL
SELECT id, 'Agendar Visita', 'agendar-visita', 2 FROM templates WHERE slug = 'imobiliaria';

-- ============================================
-- Event template sections
-- ============================================
INSERT INTO template_sections (template_id, name, slug, sort_order)
SELECT id, 'Convite', 'convite', 0 FROM templates WHERE slug = 'evento'
UNION ALL
SELECT id, 'Programação', 'programacao', 1 FROM templates WHERE slug = 'evento'
UNION ALL
SELECT id, 'Localização', 'localizacao', 2 FROM templates WHERE slug = 'evento'
UNION ALL
SELECT id, 'Confirmar Presença', 'rsvp', 3 FROM templates WHERE slug = 'evento';

-- ============================================
-- Clinic template sections
-- ============================================
INSERT INTO template_sections (template_id, name, slug, sort_order)
SELECT id, 'Serviços', 'servicos', 0 FROM templates WHERE slug = 'clinica'
UNION ALL
SELECT id, 'Médicos', 'medicos', 1 FROM templates WHERE slug = 'clinica'
UNION ALL
SELECT id, 'Agendamento', 'agendamento', 2 FROM templates WHERE slug = 'clinica';

-- ============================================
-- Gym template sections
-- ============================================
INSERT INTO template_sections (template_id, name, slug, sort_order)
SELECT id, 'Planos', 'planos', 0 FROM templates WHERE slug = 'academia'
UNION ALL
SELECT id, 'Horários', 'horarios', 1 FROM templates WHERE slug = 'academia'
UNION ALL
SELECT id, 'Aulas', 'aulas', 2 FROM templates WHERE slug = 'academia'
UNION ALL
SELECT id, 'Matrícula WhatsApp', 'matricula-whatsapp', 3 FROM templates WHERE slug = 'academia';

-- ============================================
-- Mechanic template sections
-- ============================================
INSERT INTO template_sections (template_id, name, slug, sort_order)
SELECT id, 'Serviços', 'servicos', 0 FROM templates WHERE slug = 'mecanico'
UNION ALL
SELECT id, 'Orçamento', 'orcamento', 1 FROM templates WHERE slug = 'mecanico'
UNION ALL
SELECT id, 'Contato WhatsApp', 'contato-whatsapp', 2 FROM templates WHERE slug = 'mecanico';

-- ============================================
-- Freelancer template sections
-- ============================================
INSERT INTO template_sections (template_id, name, slug, sort_order)
SELECT id, 'Serviços', 'servicos', 0 FROM templates WHERE slug = 'freelancer'
UNION ALL
SELECT id, 'Portfólio', 'portfolio', 1 FROM templates WHERE slug = 'freelancer'
UNION ALL
SELECT id, 'Orçamento Rápido', 'orcamento-rapido', 2 FROM templates WHERE slug = 'freelancer';

-- ============================================
-- Church template sections
-- ============================================
INSERT INTO template_sections (template_id, name, slug, sort_order)
SELECT id, 'Programação', 'programacao', 0 FROM templates WHERE slug = 'igreja'
UNION ALL
SELECT id, 'Eventos', 'eventos', 1 FROM templates WHERE slug = 'igreja'
UNION ALL
SELECT id, 'Contribuições', 'contribuicoes', 2 FROM templates WHERE slug = 'igreja'
UNION ALL
SELECT id, 'Contato WhatsApp', 'contato-whatsapp', 3 FROM templates WHERE slug = 'igreja';

-- ============================================
-- Product Shelf template sections
-- ============================================
INSERT INTO template_sections (template_id, name, slug, sort_order)
SELECT id, 'Informações do Produto', 'info-produto', 0 FROM templates WHERE slug = 'prateleira-produto'
UNION ALL
SELECT id, 'Preço', 'preco', 1 FROM templates WHERE slug = 'prateleira-produto'
UNION ALL
SELECT id, 'Como Usar', 'como-usar', 2 FROM templates WHERE slug = 'prateleira-produto'
UNION ALL
SELECT id, 'Fale com o Vendedor', 'fale-vendedor', 3 FROM templates WHERE slug = 'prateleira-produto';

-- ============================================
-- Template Items for Pet Shop
-- ============================================
INSERT INTO template_items (section_id, name, description, price, sort_order)
SELECT ts.id, 'Banho', 'Banho completo para cães até 15kg', 45.00, 0
FROM template_sections ts JOIN templates t ON t.id = ts.template_id
WHERE t.slug = 'pet-shop' AND ts.slug = 'servicos'
UNION ALL
SELECT ts.id, 'Tosa', 'Tosa higiênica ou completa', 55.00, 1
FROM template_sections ts JOIN templates t ON t.id = ts.template_id
WHERE t.slug = 'pet-shop' AND ts.slug = 'servicos'
UNION ALL
SELECT ts.id, 'Banho e Tosa', 'Combo completo', 85.00, 2
FROM template_sections ts JOIN templates t ON t.id = ts.template_id
WHERE t.slug = 'pet-shop' AND ts.slug = 'servicos'
UNION ALL
SELECT ts.id, 'Consulta Veterinária', 'Consulta clínica geral', 120.00, 3
FROM template_sections ts JOIN templates t ON t.id = ts.template_id
WHERE t.slug = 'pet-shop' AND ts.slug = 'servicos'
UNION ALL
SELECT ts.id, 'Ração Premium 15kg', 'Ração para cães adultos', 189.90, 0
FROM template_sections ts JOIN templates t ON t.id = ts.template_id
WHERE t.slug = 'pet-shop' AND ts.slug = 'produtos'
UNION ALL
SELECT ts.id, 'Antipulgas', 'Comprimido oral', 59.90, 1
FROM template_sections ts JOIN templates t ON t.id = ts.template_id
WHERE t.slug = 'pet-shop' AND ts.slug = 'produtos'
UNION ALL
SELECT ts.id, 'Coleira', 'Coleira ajustável', 29.90, 2
FROM template_sections ts JOIN templates t ON t.id = ts.template_id
WHERE t.slug = 'pet-shop' AND ts.slug = 'produtos';

-- ============================================
-- Template Items for Real Estate
-- ============================================
INSERT INTO template_items (section_id, name, description, price, sort_order)
SELECT ts.id, 'Casa à Venda', '3 quartos, 2 suítes, 150m²', 450000.00, 0
FROM template_sections ts JOIN templates t ON t.id = ts.template_id
WHERE t.slug = 'imobiliaria' AND ts.slug = 'imoveis'
UNION ALL
SELECT ts.id, 'Apartamento para Aluguel', '2 quartos, 1 vaga, 80m²', 2500.00, 1
FROM template_sections ts JOIN templates t ON t.id = ts.template_id
WHERE t.slug = 'imobiliaria' AND ts.slug = 'imoveis'
UNION ALL
SELECT ts.id, 'Terreno', '300m², plano, infraestrutura', 180000.00, 2
FROM template_sections ts JOIN templates t ON t.id = ts.template_id
WHERE t.slug = 'imobiliaria' AND ts.slug = 'imoveis';

-- ============================================
-- Template Items for Event
-- ============================================
INSERT INTO template_items (section_id, name, description, price, sort_order)
SELECT ts.id, 'Cerimônia', 'Local e horário da cerimônia', 0, 0
FROM template_sections ts JOIN templates t ON t.id = ts.template_id
WHERE t.slug = 'evento' AND ts.slug = 'convite'
UNION ALL
SELECT ts.id, 'Recepção', 'Local e horário da recepção', 0, 1
FROM template_sections ts JOIN templates t ON t.id = ts.template_id
WHERE t.slug = 'evento' AND ts.slug = 'convite'
UNION ALL
SELECT ts.id, 'Abertura dos portões', '19:00', 0, 0
FROM template_sections ts JOIN templates t ON t.id = ts.template_id
WHERE t.slug = 'evento' AND ts.slug = 'programacao'
UNION ALL
SELECT ts.id, 'Cerimônia', '20:00', 0, 1
FROM template_sections ts JOIN templates t ON t.id = ts.template_id
WHERE t.slug = 'evento' AND ts.slug = 'programacao'
UNION ALL
SELECT ts.id, 'Jantar', '21:00', 0, 2
FROM template_sections ts JOIN templates t ON t.id = ts.template_id
WHERE t.slug = 'evento' AND ts.slug = 'programacao'
UNION ALL
SELECT ts.id, 'Festa', '22:00', 0, 3
FROM template_sections ts JOIN templates t ON t.id = ts.template_id
WHERE t.slug = 'evento' AND ts.slug = 'programacao';

-- ============================================
-- Template Items for Clinic
-- ============================================
INSERT INTO template_items (section_id, name, description, price, sort_order)
SELECT ts.id, 'Consulta Geral', 'Clínico geral', 150.00, 0
FROM template_sections ts JOIN templates t ON t.id = ts.template_id
WHERE t.slug = 'clinica' AND ts.slug = 'servicos'
UNION ALL
SELECT ts.id, 'Exames Laboratoriais', 'Solicitação e coleta', 0, 1
FROM template_sections ts JOIN templates t ON t.id = ts.template_id
WHERE t.slug = 'clinica' AND ts.slug = 'servicos'
UNION ALL
SELECT ts.id, 'Retorno', 'Consulta de retorno', 80.00, 2
FROM template_sections ts JOIN templates t ON t.id = ts.template_id
WHERE t.slug = 'clinica' AND ts.slug = 'servicos'
UNION ALL
SELECT ts.id, 'Teleconsulta', 'Consulta online', 120.00, 3
FROM template_sections ts JOIN templates t ON t.id = ts.template_id
WHERE t.slug = 'clinica' AND ts.slug = 'servicos'
UNION ALL
SELECT ts.id, 'Dr. João Silva', 'Clínico Geral - CRM 12345', 0, 0
FROM template_sections ts JOIN templates t ON t.id = ts.template_id
WHERE t.slug = 'clinica' AND ts.slug = 'medicos'
UNION ALL
SELECT ts.id, 'Dra. Maria Souza', 'Pediatra - CRM 12346', 0, 1
FROM template_sections ts JOIN templates t ON t.id = ts.template_id
WHERE t.slug = 'clinica' AND ts.slug = 'medicos';

-- ============================================
-- Template Items for Gym
-- ============================================
INSERT INTO template_items (section_id, name, description, price, sort_order)
SELECT ts.id, 'Plano Mensal', 'Acesso ilimitado à academia', 89.90, 0
FROM template_sections ts JOIN templates t ON t.id = ts.template_id
WHERE t.slug = 'academia' AND ts.slug = 'planos'
UNION ALL
SELECT ts.id, 'Plano Trimestral', '3 meses com 10% de desconto', 239.90, 1
FROM template_sections ts JOIN templates t ON t.id = ts.template_id
WHERE t.slug = 'academia' AND ts.slug = 'planos'
UNION ALL
SELECT ts.id, 'Plano Anual', '12 meses com 20% de desconto', 859.00, 2
FROM template_sections ts JOIN templates t ON t.id = ts.template_id
WHERE t.slug = 'academia' AND ts.slug = 'planos'
UNION ALL
SELECT ts.id, 'Aula Experimental', 'Primeira aula gratuita', 0, 3
FROM template_sections ts JOIN templates t ON t.id = ts.template_id
WHERE t.slug = 'academia' AND ts.slug = 'planos'
UNION ALL
SELECT ts.id, 'Segunda a Sexta', '06:00 - 22:00', 0, 0
FROM template_sections ts JOIN templates t ON t.id = ts.template_id
WHERE t.slug = 'academia' AND ts.slug = 'horarios'
UNION ALL
SELECT ts.id, 'Sábado', '08:00 - 18:00', 0, 1
FROM template_sections ts JOIN templates t ON t.id = ts.template_id
WHERE t.slug = 'academia' AND ts.slug = 'horarios'
UNION ALL
SELECT ts.id, 'Domingo', '09:00 - 13:00', 0, 2
FROM template_sections ts JOIN templates t ON t.id = ts.template_id
WHERE t.slug = 'academia' AND ts.slug = 'horarios'
UNION ALL
SELECT ts.id, 'Musculação', 'Acompanhamento profissional', 0, 0
FROM template_sections ts JOIN templates t ON t.id = ts.template_id
WHERE t.slug = 'academia' AND ts.slug = 'aulas'
UNION ALL
SELECT ts.id, 'CrossFit', 'Treino funcional intenso', 0, 1
FROM template_sections ts JOIN templates t ON t.id = ts.template_id
WHERE t.slug = 'academia' AND ts.slug = 'aulas'
UNION ALL
SELECT ts.id, 'Pilates', 'Alongamento e fortalecimento', 0, 2
FROM template_sections ts JOIN templates t ON t.id = ts.template_id
WHERE t.slug = 'academia' AND ts.slug = 'aulas'
UNION ALL
SELECT ts.id, 'Spinning', 'Aula de bike indoor', 0, 3
FROM template_sections ts JOIN templates t ON t.id = ts.template_id
WHERE t.slug = 'academia' AND ts.slug = 'aulas';

-- ============================================
-- Template Items for Mechanic
-- ============================================
INSERT INTO template_items (section_id, name, description, price, sort_order)
SELECT ts.id, 'Revisão Completa', 'Troca de óleo, filtros, velas e correias', 199.90, 0
FROM template_sections ts JOIN templates t ON t.id = ts.template_id
WHERE t.slug = 'mecanico' AND ts.slug = 'servicos'
UNION ALL
SELECT ts.id, 'Troca de Óleo', 'Óleo + filtro + mão de obra', 89.90, 1
FROM template_sections ts JOIN templates t ON t.id = ts.template_id
WHERE t.slug = 'mecanico' AND ts.slug = 'servicos'
UNION ALL
SELECT ts.id, 'Alinhamento e Balanceamento', '4 rodas', 79.90, 2
FROM template_sections ts JOIN templates t ON t.id = ts.template_id
WHERE t.slug = 'mecanico' AND ts.slug = 'servicos'
UNION ALL
SELECT ts.id, 'Troca de Pneus', 'Mão de obra para 4 pneus', 60.00, 3
FROM template_sections ts JOIN templates t ON t.id = ts.template_id
WHERE t.slug = 'mecanico' AND ts.slug = 'servicos'
UNION ALL
SELECT ts.id, 'Freios', 'Troca de pastilhas e discos', 149.90, 4
FROM template_sections ts JOIN templates t ON t.id = ts.template_id
WHERE t.slug = 'mecanico' AND ts.slug = 'servicos'
UNION ALL
SELECT ts.id, 'Ar Condicionado', 'Recarga e limpeza', 129.90, 5
FROM template_sections ts JOIN templates t ON t.id = ts.template_id
WHERE t.slug = 'mecanico' AND ts.slug = 'servicos';

-- ============================================
-- Template Items for Freelancer
-- ============================================
INSERT INTO template_items (section_id, name, description, price, sort_order)
SELECT ts.id, 'Projeto Básico', 'Até 3 entregas', 150.00, 0
FROM template_sections ts JOIN templates t ON t.id = ts.template_id
WHERE t.slug = 'freelancer' AND ts.slug = 'servicos'
UNION ALL
SELECT ts.id, 'Projeto Padrão', 'Até 10 entregas', 500.00, 1
FROM template_sections ts JOIN templates t ON t.id = ts.template_id
WHERE t.slug = 'freelancer' AND ts.slug = 'servicos'
UNION ALL
SELECT ts.id, 'Projeto Premium', 'Entregas ilimitadas', 1200.00, 2
FROM template_sections ts JOIN templates t ON t.id = ts.template_id
WHERE t.slug = 'freelancer' AND ts.slug = 'servicos'
UNION ALL
SELECT ts.id, 'Consultoria', 'Por hora', 100.00, 3
FROM template_sections ts JOIN templates t ON t.id = ts.template_id
WHERE t.slug = 'freelancer' AND ts.slug = 'servicos';

-- ============================================
-- Template Items for Church
-- ============================================
INSERT INTO template_items (section_id, name, description, price, sort_order)
SELECT ts.id, 'Culto Dominical', 'Domingo 09:00 e 19:00', 0, 0
FROM template_sections ts JOIN templates t ON t.id = ts.template_id
WHERE t.slug = 'igreja' AND ts.slug = 'programacao'
UNION ALL
SELECT ts.id, 'Culto de Oração', 'Quarta-feira 19:00', 0, 1
FROM template_sections ts JOIN templates t ON t.id = ts.template_id
WHERE t.slug = 'igreja' AND ts.slug = 'programacao'
UNION ALL
SELECT ts.id, 'Grupo Jovem', 'Sábado 18:00', 0, 2
FROM template_sections ts JOIN templates t ON t.id = ts.template_id
WHERE t.slug = 'igreja' AND ts.slug = 'programacao'
UNION ALL
SELECT ts.id, 'Escola Bíblica', 'Domingo 08:00', 0, 3
FROM template_sections ts JOIN templates t ON t.id = ts.template_id
WHERE t.slug = 'igreja' AND ts.slug = 'programacao'
UNION ALL
SELECT ts.id, 'Próximo Evento', 'Confira nosso calendário', 0, 0
FROM template_sections ts JOIN templates t ON t.id = ts.template_id
WHERE t.slug = 'igreja' AND ts.slug = 'eventos'
UNION ALL
SELECT ts.id, 'Dízimo', 'Contribua com seu dízimo', 0, 0
FROM template_sections ts JOIN templates t ON t.id = ts.template_id
WHERE t.slug = 'igreja' AND ts.slug = 'contribuicoes'
UNION ALL
SELECT ts.id, 'Ofertas', 'Ofertas voluntárias', 0, 1
FROM template_sections ts JOIN templates t ON t.id = ts.template_id
WHERE t.slug = 'igreja' AND ts.slug = 'contribuicoes';

-- ============================================
-- Template Items for Product Shelf
-- ============================================
INSERT INTO template_items (section_id, name, description, price, sort_order)
SELECT ts.id, 'Nome do Produto', 'Insira o nome do produto', 0, 0
FROM template_sections ts JOIN templates t ON t.id = ts.template_id
WHERE t.slug = 'prateleira-produto' AND ts.slug = 'info-produto'
UNION ALL
SELECT ts.id, 'Descrição', 'Descrição detalhada do produto', 0, 1
FROM template_sections ts JOIN templates t ON t.id = ts.template_id
WHERE t.slug = 'prateleira-produto' AND ts.slug = 'info-produto'
UNION ALL
SELECT ts.id, 'Especificações Técnicas', 'Dimensões, peso, material', 0, 2
FROM template_sections ts JOIN templates t ON t.id = ts.template_id
WHERE t.slug = 'prateleira-produto' AND ts.slug = 'info-produto'
UNION ALL
SELECT ts.id, 'Preço à Vista', 'Consulte nosso preço especial', 0, 0
FROM template_sections ts JOIN templates t ON t.id = ts.template_id
WHERE t.slug = 'prateleira-produto' AND ts.slug = 'preco'
UNION ALL
SELECT ts.id, 'Preço Parcelado', 'Consulte condições', 0, 1
FROM template_sections ts JOIN templates t ON t.id = ts.template_id
WHERE t.slug = 'prateleira-produto' AND ts.slug = 'preco'
UNION ALL
SELECT ts.id, 'Manual do Produto', 'Clique para baixar o manual', 0, 0
FROM template_sections ts JOIN templates t ON t.id = ts.template_id
WHERE t.slug = 'prateleira-produto' AND ts.slug = 'como-usar'
UNION ALL
SELECT ts.id, 'Vídeo Tutorial', 'Assista ao vídeo explicativo', 0, 1
FROM template_sections ts JOIN templates t ON t.id = ts.template_id
WHERE t.slug = 'prateleira-produto' AND ts.slug = 'como-usar';

-- ============================================
-- Demo Profiles (only insert if not exists)
-- Note: In production, profiles are created via the trigger on auth.users
-- These are for local development only
-- ============================================

-- ============================================
-- Demo Businesses
-- Note: These require a real user to be created first
-- Add placeholder rows that can be used after auth setup
-- ============================================

-- These seed templates and their sections/items are enough for the template system.
-- Demo businesses are created by users through the app UI after registration.

-- ============================================
-- Create Template Counts View
-- ============================================
CREATE OR REPLACE VIEW template_summary AS
SELECT
  t.id,
  t.name,
  t.slug,
  t.category,
  t.description,
  t.preview_url,
  COUNT(DISTINCT ts.id) AS section_count,
  COUNT(DISTINCT ti.id) AS item_count
FROM templates t
LEFT JOIN template_sections ts ON ts.template_id = t.id
LEFT JOIN template_items ti ON ti.section_id = ts.id
WHERE t.is_active = true
GROUP BY t.id, t.name, t.slug, t.category, t.description, t.preview_url
ORDER BY t.name;
