CREATE TABLE template_status (
  id TEXT PRIMARY KEY,
  is_active BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

-- RLS
ALTER TABLE template_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read template_status"
  ON template_status FOR SELECT
  USING (true);

CREATE POLICY "Superadmins can update template_status"
  ON template_status FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() AND profiles.is_superadmin = true
    )
  );
