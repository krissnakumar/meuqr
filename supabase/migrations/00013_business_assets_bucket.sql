-- 00013_business_assets_bucket.sql
-- Create the 'business-assets' bucket used by the /api/upload route

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('business-assets', 'business-assets', true, 10485760, ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO UPDATE SET 
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Cleanup existing policies
DROP POLICY IF EXISTS "Public business-assets access" ON storage.objects;
DROP POLICY IF EXISTS "Auth users can upload business-assets" ON storage.objects;
DROP POLICY IF EXISTS "Auth users can update own business-assets" ON storage.objects;
DROP POLICY IF EXISTS "Auth users can delete own business-assets" ON storage.objects;

-- Policies for 'business-assets' Bucket
CREATE POLICY "Public business-assets access" ON storage.objects 
  FOR SELECT USING (bucket_id = 'business-assets');

CREATE POLICY "Auth users can upload business-assets" ON storage.objects 
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'business-assets');

CREATE POLICY "Auth users can update own business-assets" ON storage.objects 
  FOR UPDATE TO authenticated USING (bucket_id = 'business-assets' AND owner = auth.uid());

CREATE POLICY "Auth users can delete own business-assets" ON storage.objects 
  FOR DELETE TO authenticated USING (bucket_id = 'business-assets' AND owner = auth.uid());
