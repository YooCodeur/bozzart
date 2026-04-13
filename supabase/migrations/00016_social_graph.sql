-- ═══════════════════════════════════════════════
-- PHASE 15 — GRAPH SOCIAL ETENDU
-- Acheteur suit Acheteur, Collections Publiques,
-- Suggestions de Connexions
-- ═══════════════════════════════════════════════

-- ─────────────────────────────────────────────
-- 1. FOLLOWS : autoriser suivre n'importe quel profile
-- ─────────────────────────────────────────────
-- Le schema existant lie follows.artist_id -> artist_profiles(id).
-- On ajoute une colonne following_id -> profiles(id) pour permettre
-- de suivre un acheteur (profile) ou un artiste (via son profile user).
-- L'ancienne colonne artist_id est conservee pour compatibilite mais
-- devient nullable.

ALTER TABLE follows
  ADD COLUMN IF NOT EXISTS following_id UUID REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE follows
  ALTER COLUMN artist_id DROP NOT NULL;

-- Contrainte : au moins une des deux cibles doit etre renseignee
ALTER TABLE follows
  DROP CONSTRAINT IF EXISTS follows_target_not_null;
ALTER TABLE follows
  ADD CONSTRAINT follows_target_not_null
  CHECK (artist_id IS NOT NULL OR following_id IS NOT NULL);

-- Eviter les doublons sur (follower, following_profile)
CREATE UNIQUE INDEX IF NOT EXISTS uniq_follows_follower_following
  ON follows(follower_id, following_id)
  WHERE following_id IS NOT NULL;

-- Index
CREATE INDEX IF NOT EXISTS idx_follows_following ON follows(following_id);

-- ─────────────────────────────────────────────
-- 2. PROFILES : collection publique + bio + follower_count
-- ─────────────────────────────────────────────
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS is_collection_public BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS collector_bio TEXT;
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS follower_count INTEGER DEFAULT 0;

-- ─────────────────────────────────────────────
-- 3. TRIGGER : compter les followers au niveau profiles
-- (complementaire au trigger artist_profiles.follower_count existant)
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_profile_follower_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.following_id IS NOT NULL THEN
      UPDATE profiles
        SET follower_count = follower_count + 1
        WHERE id = NEW.following_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.following_id IS NOT NULL THEN
      UPDATE profiles
        SET follower_count = GREATEST(follower_count - 1, 0)
        WHERE id = OLD.following_id;
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_profile_follower_count ON follows;
CREATE TRIGGER trigger_profile_follower_count
  AFTER INSERT OR DELETE ON follows
  FOR EACH ROW EXECUTE FUNCTION update_profile_follower_count();

-- ─────────────────────────────────────────────
-- 4. RLS : adapter follows pour autoriser suivre un profile
-- ─────────────────────────────────────────────
-- Les policies existantes se basent deja sur follower_id = auth.uid()
-- pour l'insertion/suppression, ce qui fonctionne aussi bien pour
-- following_id que pour artist_id. On les recree pour etre explicite.

DROP POLICY IF EXISTS "follows_insert_own" ON follows;
CREATE POLICY "follows_insert_own" ON follows
  FOR INSERT WITH CHECK (
    auth.uid() = follower_id
    AND (
      artist_id IS NOT NULL
      OR following_id IS NOT NULL
    )
    -- empecher de se suivre soi-meme
    AND (following_id IS NULL OR following_id <> auth.uid())
  );

DROP POLICY IF EXISTS "follows_delete_own" ON follows;
CREATE POLICY "follows_delete_own" ON follows
  FOR DELETE USING (auth.uid() = follower_id);

-- SELECT reste public (deja en place via follows_select_public)

-- ─────────────────────────────────────────────
-- 5. RPC stub : suggestions de connexions (2nd degree)
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION suggest_connections(p_user_id UUID, p_limit INTEGER DEFAULT 3)
RETURNS TABLE (
  artist_profile_id UUID,
  full_name TEXT,
  slug TEXT,
  avatar_url TEXT,
  reason TEXT
) AS $$
  -- Artistes suivis par les gens que je suis (2nd degree),
  -- que je ne suis pas deja.
  SELECT DISTINCT
    ap.id AS artist_profile_id,
    ap.full_name,
    ap.slug,
    p.avatar_url,
    'Suivi par des artistes que vous suivez'::TEXT AS reason
  FROM follows f1
  JOIN follows f2 ON f2.follower_id = f1.artist_id
  JOIN artist_profiles ap ON ap.id = f2.artist_id
  LEFT JOIN profiles p ON p.id = ap.user_id
  WHERE f1.follower_id = p_user_id
    AND f2.artist_id IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM follows fx
      WHERE fx.follower_id = p_user_id AND fx.artist_id = ap.id
    )
  LIMIT p_limit;
$$ LANGUAGE SQL STABLE;

COMMENT ON FUNCTION suggest_connections IS
  'Phase 15.4 — retourne jusqu a p_limit artistes suggeres (2nd degree). TODO: etendre avec medium + geo proximity.';
