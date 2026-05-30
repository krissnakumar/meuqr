-- ============================================
-- Migration 00003: Add language preference columns
-- ============================================

-- 1. Add language to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'pt-BR' 
CHECK (language IN ('pt-BR', 'en', 'es'));

-- 2. Add default_language to businesses
ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS default_language TEXT DEFAULT 'pt-BR' 
CHECK (default_language IN ('pt-BR', 'en', 'es'));

-- 3. Update existing profiles and businesses (if any) to have 'pt-BR'
UPDATE profiles SET language = 'pt-BR' WHERE language IS NULL;
UPDATE businesses SET default_language = 'pt-BR' WHERE default_language IS NULL;
