-- Add is_superadmin to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_superadmin BOOLEAN DEFAULT false;

-- System Settings Table
CREATE TABLE system_settings (
  id TEXT PRIMARY KEY,
  maintenance_mode BOOLEAN DEFAULT false,
  allow_signups BOOLEAN DEFAULT true,
  trial_days INTEGER DEFAULT 14,
  max_upload_size_mb INTEGER DEFAULT 50,
  max_businesses_per_user INTEGER DEFAULT 1,
  allowed_domains TEXT DEFAULT '*',
  updated_at TIMESTAMPTZ DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Insert default row (id = 'global')
INSERT INTO system_settings (id) VALUES ('global') ON CONFLICT (id) DO NOTHING;

-- RLS
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Only superadmins can read/write system_settings
CREATE POLICY "Superadmins can read system_settings"
  ON system_settings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() AND profiles.is_superadmin = true
    )
  );

CREATE POLICY "Superadmins can update system_settings"
  ON system_settings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() AND profiles.is_superadmin = true
    )
  );
