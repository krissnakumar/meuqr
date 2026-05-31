-- ============================================
-- Migration 00014: Dynamic form schemas + custom fields
-- ============================================

-- Store per-business form schemas (appointments/leads/quotes)
ALTER TABLE businesses
ADD COLUMN IF NOT EXISTS form_schema JSONB NOT NULL DEFAULT '{
  "appointments": [],
  "leads": [],
  "quotes": []
}'::jsonb;

-- Store submitted values for custom fields (key/value pairs)
ALTER TABLE appointments
ADD COLUMN IF NOT EXISTS custom_fields JSONB NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE leads
ADD COLUMN IF NOT EXISTS custom_fields JSONB NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE quote_requests
ADD COLUMN IF NOT EXISTS custom_fields JSONB NOT NULL DEFAULT '{}'::jsonb;

