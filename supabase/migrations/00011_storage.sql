-- ═══════════════════════════════════════════════
-- STORAGE BUCKETS
-- ═══════════════════════════════════════════════

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('artworks', 'artworks', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic']),
  ('posts', 'posts', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/quicktime', 'audio/mpeg', 'audio/wav']),
  ('certificates', 'certificates', false, 10485760, ARRAY['application/pdf']);

-- ═══════════════════════════════════════════════
-- STORAGE POLICIES
-- ═══════════════════════════════════════════════

-- Avatars : lecture publique, upload/update/delete par proprietaire
CREATE POLICY "avatars_select_public" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "avatars_insert_own" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "avatars_update_own" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "avatars_delete_own" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Artworks : lecture publique, upload par artiste authentifie
CREATE POLICY "artworks_storage_select_public" ON storage.objects
  FOR SELECT USING (bucket_id = 'artworks');

CREATE POLICY "artworks_storage_insert_auth" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'artworks'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "artworks_storage_update_own" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'artworks'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "artworks_storage_delete_own" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'artworks'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Posts : lecture publique, upload par artiste authentifie
CREATE POLICY "posts_storage_select_public" ON storage.objects
  FOR SELECT USING (bucket_id = 'posts');

CREATE POLICY "posts_storage_insert_auth" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'posts'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "posts_storage_delete_own" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'posts'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Certificates : lecture par proprietaire uniquement (bucket prive)
CREATE POLICY "certificates_storage_select_own" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'certificates'
    AND auth.role() = 'authenticated'
  );
