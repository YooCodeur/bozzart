-- ═══════════════════════════════════════════════
-- PHASE 17 — ARTWORK STORIES (Visual Stories)
-- ═══════════════════════════════════════════════

-- Table : une story visuelle (slides Instagram-like) par oeuvre
CREATE TABLE IF NOT EXISTS artwork_stories (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artwork_id   UUID NOT NULL REFERENCES artworks(id) ON DELETE CASCADE,
  slides       JSONB NOT NULL DEFAULT '[]'::jsonb,
  -- Chaque slide : { id, type: 'image'|'text'|'video'|'before_after'|'palette',
  --                  content, caption, bg_color, text_color, before_url, after_url, colors }
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT artwork_stories_artwork_unique UNIQUE (artwork_id)
);

CREATE INDEX IF NOT EXISTS idx_artwork_stories_artwork ON artwork_stories(artwork_id);
CREATE INDEX IF NOT EXISTS idx_artwork_stories_published ON artwork_stories(is_published) WHERE is_published = true;

-- Trigger updated_at
CREATE OR REPLACE FUNCTION set_artwork_stories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_artwork_stories_updated_at ON artwork_stories;
CREATE TRIGGER trg_artwork_stories_updated_at
  BEFORE UPDATE ON artwork_stories
  FOR EACH ROW EXECUTE FUNCTION set_artwork_stories_updated_at();

-- ═══════════════════════════════════════════════
-- RLS
-- ═══════════════════════════════════════════════

ALTER TABLE artwork_stories ENABLE ROW LEVEL SECURITY;

-- SELECT : public si published ; proprietaire (artiste) peut toujours lire
CREATE POLICY "artwork_stories_select" ON artwork_stories
  FOR SELECT USING (
    is_published = true
    OR artwork_id IN (
      SELECT a.id FROM artworks a
      JOIN artist_profiles ap ON ap.id = a.artist_id
      WHERE ap.user_id = auth.uid()
    )
  );

CREATE POLICY "artwork_stories_insert_own" ON artwork_stories
  FOR INSERT WITH CHECK (
    artwork_id IN (
      SELECT a.id FROM artworks a
      JOIN artist_profiles ap ON ap.id = a.artist_id
      WHERE ap.user_id = auth.uid()
    )
  );

CREATE POLICY "artwork_stories_update_own" ON artwork_stories
  FOR UPDATE USING (
    artwork_id IN (
      SELECT a.id FROM artworks a
      JOIN artist_profiles ap ON ap.id = a.artist_id
      WHERE ap.user_id = auth.uid()
    )
  );

CREATE POLICY "artwork_stories_delete_own" ON artwork_stories
  FOR DELETE USING (
    artwork_id IN (
      SELECT a.id FROM artworks a
      JOIN artist_profiles ap ON ap.id = a.artist_id
      WHERE ap.user_id = auth.uid()
    )
  );

-- ═══════════════════════════════════════════════
-- STORAGE BUCKET `stories`
-- ═══════════════════════════════════════════════

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'stories',
  'stories',
  true,
  52428800, -- 50 MB (supporte videos courtes)
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/quicktime']
)
ON CONFLICT (id) DO NOTHING;

-- Policies storage : lecture publique, ecriture par artiste authentifie
CREATE POLICY "stories_storage_select_public" ON storage.objects
  FOR SELECT USING (bucket_id = 'stories');

CREATE POLICY "stories_storage_insert_auth" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'stories'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "stories_storage_update_own" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'stories'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "stories_storage_delete_own" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'stories'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
