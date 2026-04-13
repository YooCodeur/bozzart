-- ═══════════════════════════════════════════════
-- PHASE 14 — FEED ALGORITHMIQUE
-- Score de pertinence, feed personnalise, signaux
-- ═══════════════════════════════════════════════

-- ───────────────────────────────────────────────
-- MATERIALIZED VIEW : artwork_scores
-- ───────────────────────────────────────────────
-- Note : le roadmap specifie `ap.user_id = a.artist_id`, mais dans le schema
-- reel `artworks.artist_id` reference `artist_profiles.id`. On corrige donc le JOIN.
-- Le roadmap reference aussi `artwork_sold_count` qui n'existe pas : on utilise
-- `total_sales_count` (champ reellement present sur artist_profiles).
-- Enfin, `carnet_posts.artwork_id` n'existe pas : le lien est `linked_artwork_id`.

CREATE MATERIALIZED VIEW artwork_scores AS
SELECT
  a.id,
  a.artist_id,
  a.medium,
  a.price,
  a.created_at,
  ap.location_lat,
  ap.location_lng,

  -- Score de popularite (0-100+)
  (
    COALESCE(a.wishlist_count, 0) * 3 +
    COALESCE(
      (SELECT COUNT(*) FROM reactions r
       JOIN carnet_posts cp ON cp.id = r.post_id
       WHERE cp.linked_artwork_id = a.id), 0
    ) * 2 +
    COALESCE(a.view_count, 0) * 0.1
  ) AS popularity_score,

  -- Fraicheur (decay exponentiel sur 30 jours)
  EXP(-EXTRACT(EPOCH FROM (NOW() - a.created_at)) / (30 * 86400)) * 100
    AS freshness_score,

  -- Score artiste (followers + oeuvres vendues)
  -- TODO : `artwork_sold_count` n'existe pas sur artist_profiles,
  -- on utilise `total_sales_count` a la place.
  COALESCE(ap.follower_count, 0) * 2 +
  COALESCE(ap.total_sales_count, 0) * 5 AS artist_score

FROM artworks a
JOIN artist_profiles ap ON ap.id = a.artist_id
WHERE a.status = 'published';

-- Index unique requis pour REFRESH MATERIALIZED VIEW CONCURRENTLY
CREATE UNIQUE INDEX idx_artwork_scores_id ON artwork_scores(id);

-- Index de tri sur le score combine (ordre DESC)
CREATE INDEX idx_artwork_scores_combined
  ON artwork_scores ((popularity_score + freshness_score + artist_score) DESC);

-- ───────────────────────────────────────────────
-- TABLE : feed_signals
-- ───────────────────────────────────────────────

CREATE TABLE feed_signals (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  artwork_id  UUID NOT NULL REFERENCES artworks(id) ON DELETE CASCADE,
  signal_type TEXT NOT NULL CHECK (signal_type IN ('skip', 'not_interested', 'long_view', 'save')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_feed_signals_user ON feed_signals(user_id, created_at DESC);

-- RLS : lecture/ecriture par proprietaire uniquement
ALTER TABLE feed_signals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "feed_signals_select_own" ON feed_signals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "feed_signals_insert_own" ON feed_signals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "feed_signals_delete_own" ON feed_signals
  FOR DELETE USING (auth.uid() = user_id);

-- ───────────────────────────────────────────────
-- RPC : get_personalized_feed (STUB)
-- ───────────────────────────────────────────────
-- Version initiale : retourne simplement les oeuvres triees par score combine.
-- Les facteurs de personnalisation sont listes en TODO pour iterations futures.

CREATE OR REPLACE FUNCTION get_personalized_feed(
  p_user_id UUID,
  p_limit   INT DEFAULT 20,
  p_offset  INT DEFAULT 0
)
RETURNS TABLE (
  id               UUID,
  artist_id        UUID,
  medium           artwork_medium,
  price            DECIMAL(10,2),
  created_at       TIMESTAMPTZ,
  popularity_score NUMERIC,
  freshness_score  NUMERIC,
  artist_score     NUMERIC,
  combined_score   NUMERIC
) AS $$
BEGIN
  -- TODO Facteur 1 — Follows : boost x5 pour les artistes suivis par p_user_id
  --   (JOIN follows f ON f.artist_id = s.artist_id AND f.follower_id = p_user_id)
  -- TODO Facteur 2 — Medium prefere : analyser wishlists + reactions de p_user_id,
  --   extraire top 3 mediums, boost x3 si s.medium IN (...)
  -- TODO Facteur 3 — Fourchette de prix : median des wishlists de p_user_id,
  --   boost si s.price BETWEEN median*0.5 AND median*1.5
  -- TODO Facteur 4 — Proximite geo : si l'utilisateur a une localisation,
  --   boost les artistes dans un rayon 200km via index GiST sur artist_profiles
  --   (point(location_lng, location_lat))
  -- TODO Facteur 5 — Diversite : ne pas montrer plus de 2 oeuvres du meme artiste
  --   dans un batch de p_limit (window function ROW_NUMBER() PARTITION BY artist_id)
  -- TODO Fallback anonyme : si p_user_id IS NULL → popularity + freshness uniquement
  -- TODO Penaliser les oeuvres avec signal_type='not_interested' ou 'skip' dans feed_signals

  RETURN QUERY
  SELECT
    s.id,
    s.artist_id,
    s.medium,
    s.price,
    s.created_at,
    s.popularity_score,
    s.freshness_score,
    s.artist_score,
    (s.popularity_score + s.freshness_score + s.artist_score) AS combined_score
  FROM artwork_scores s
  ORDER BY combined_score DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ───────────────────────────────────────────────
-- CRON : REFRESH horaire de artwork_scores
-- ───────────────────────────────────────────────
-- Guarde : ne s'execute que si pg_cron est installe sur l'instance.

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    PERFORM cron.schedule(
      'refresh_artwork_scores',
      '0 * * * *',
      $cron$REFRESH MATERIALIZED VIEW CONCURRENTLY artwork_scores;$cron$
    );
  END IF;
END;
$$;
