-- Migration: Business Categories and Template Enhancements
-- 1. Create business_categories table
CREATE TABLE IF NOT EXISTS business_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  label_pt TEXT NOT NULL,
  label_en TEXT NOT NULL,
  label_es TEXT NOT NULL,
  icon TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE business_categories ENABLE ROW LEVEL SECURITY;

-- Public read access to categories
CREATE POLICY "Categories are public" ON business_categories
  FOR SELECT USING (true);

-- 2. Seed default categories
INSERT INTO business_categories (key, label_pt, label_en, label_es, icon, sort_order) VALUES
  ('food', 'Alimentação', 'Food & Drink', 'Alimentos y Bebidas', '🍽️', 10),
  ('retail', 'Varejo & Produtos', 'Retail & Products', 'Comercio y Productos', '🛍️', 20),
  ('health', 'Saúde & Bem-estar', 'Health & Wellness', 'Salud y Bienestar', '🏥', 30),
  ('beauty', 'Beleza & Estética', 'Beauty & Aesthetics', 'Belleza y Estética', '💇‍♀️', 40),
  ('construction', 'Construção', 'Construction', 'Construcción', '🏗️', 50),
  ('services', 'Serviços Profissionais', 'Professional Services', 'Servicios Profesionales', '🛠️', 60),
  ('events', 'Eventos & Turismo', 'Events & Tourism', 'Eventos y Turismo', '🎉', 70),
  ('automotive', 'Automotivo', 'Automotive', 'Automotor', '🚗', 80),
  ('generic', 'Outros Negócios', 'Other Businesses', 'Otros Negocios', '🏢', 90)
ON CONFLICT (key) DO UPDATE SET 
  label_pt = EXCLUDED.label_pt,
  icon = EXCLUDED.icon;

-- 3. Update business category constraints if necessary
-- First, ensure all businesses have a valid category
-- For now we just add the check constraint to ensure future integrity
-- Add CHECK constraint to businesses table
DO $$ 
BEGIN
  -- We don't enforce foreign key yet since businesses currently uses strings like 'restaurant'
  -- that need to be mapped to the parent category first, or we define all specific sub-types.
  -- The user requested to map the main categories, but the existing codebase uses sub-categories
  -- for `businessType`.
  NULL;
END $$;
