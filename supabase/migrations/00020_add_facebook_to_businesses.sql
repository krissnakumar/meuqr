-- Add facebook column to businesses table
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS facebook TEXT;
