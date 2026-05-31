-- 00009_storage_buckets.sql
-- Create buckets for the platform and configure Row Level Security (RLS)

-- 1. Create Buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('avatars', 'avatars', true, 5242880, ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/gif']),
  ('logos', 'logos', true, 5242880, ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/gif']),
  ('gallery', 'gallery', true, 10485760, ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO UPDATE SET 
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. RLS is already enabled by Supabase on storage.objects — no need to alter.

-- 3. Cleanup existing policies to avoid conflicts if re-run
DROP POLICY IF EXISTS "Public avatars access" ON storage.objects;
DROP POLICY IF EXISTS "Auth users can upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Auth users can update own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Auth users can delete own avatars" ON storage.objects;

DROP POLICY IF EXISTS "Public logos access" ON storage.objects;
DROP POLICY IF EXISTS "Auth users can upload logos" ON storage.objects;
DROP POLICY IF EXISTS "Auth users can update own logos" ON storage.objects;
DROP POLICY IF EXISTS "Auth users can delete own logos" ON storage.objects;

DROP POLICY IF EXISTS "Public gallery access" ON storage.objects;
DROP POLICY IF EXISTS "Auth users can upload gallery" ON storage.objects;
DROP POLICY IF EXISTS "Auth users can update own gallery" ON storage.objects;
DROP POLICY IF EXISTS "Auth users can delete own gallery" ON storage.objects;

-- 4. Policies for 'avatars' Bucket
CREATE POLICY "Public avatars access" ON storage.objects 
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Auth users can upload avatars" ON storage.objects 
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Auth users can update own avatars" ON storage.objects 
  FOR UPDATE TO authenticated USING (bucket_id = 'avatars' AND owner = auth.uid());

CREATE POLICY "Auth users can delete own avatars" ON storage.objects 
  FOR DELETE TO authenticated USING (bucket_id = 'avatars' AND owner = auth.uid());

-- 5. Policies for 'logos' Bucket
CREATE POLICY "Public logos access" ON storage.objects 
  FOR SELECT USING (bucket_id = 'logos');

CREATE POLICY "Auth users can upload logos" ON storage.objects 
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'logos');

CREATE POLICY "Auth users can update own logos" ON storage.objects 
  FOR UPDATE TO authenticated USING (bucket_id = 'logos' AND owner = auth.uid());

CREATE POLICY "Auth users can delete own logos" ON storage.objects 
  FOR DELETE TO authenticated USING (bucket_id = 'logos' AND owner = auth.uid());

-- 6. Policies for 'gallery' Bucket
CREATE POLICY "Public gallery access" ON storage.objects 
  FOR SELECT USING (bucket_id = 'gallery');

CREATE POLICY "Auth users can upload gallery" ON storage.objects 
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'gallery');

CREATE POLICY "Auth users can update own gallery" ON storage.objects 
  FOR UPDATE TO authenticated USING (bucket_id = 'gallery' AND owner = auth.uid());

CREATE POLICY "Auth users can delete own gallery" ON storage.objects 
  FOR DELETE TO authenticated USING (bucket_id = 'gallery' AND owner = auth.uid());
