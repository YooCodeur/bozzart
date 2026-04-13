-- ═══════════════════════════════════════════════════════════════════
-- 00027_feed_personalization.sql
-- Phase 14.2–14.5 : Personalized feeds (discovery + carnet)
--
-- Replaces the stub `get_personalized_feed` RPC created in 00015
-- with the full 5-factor personalization logic, and adds
-- `get_personalized_carnet_feed` for the /feed page.
--
-- NOTE: migration 00015 is expected to have created the materialized
-- view `artwork_scores`, the table `feed_signals` and a stub RPC.
-- Guarded DDL below is a defensive no-op if 00015 is already applied.
-- ═══════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────
-- Defensive prerequisites (no-op if 00015 already ran)
-- ─────────────────────────────────────────────────────────────────

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_matviews WHERE matviewname = 'artwork_scores'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_name = 'artwork_scores'
  ) THEN
    EXECUTE $MV$
      CREATE MATERIALIZED VIEW artwork_scores AS
      SELECT
        a.id,
        a.artist_id,
        a.medium,
        a.price,
        a.created_at,
        ap.location_lat,
        ap.location_lng,
        (
          COALESCE(a.wishlist_count, 0) * 3 +
          COALESCE((
            SELECT COUNT(*) FROM reactions r
            JOIN carnet_posts cp ON cp.id = r.post_id
            WHERE cp.linked_artwork_id = a.id
          ), 0) * 2 +
          COALESCE(a.view_count, 0) * 0.1
        )::NUMERIC AS popularity_score,
        (EXP(-EXTRACT(EPOCH FROM (NOW() - a.created_at)) / (30 * 86400)) * 100)::NUMERIC AS freshness_score,
        (COALESCE(ap.follower_count, 0) * 2 + COALESCE(ap.total_sales_count, 0) * 5)::NUMERIC AS artist_score
      FROM artworks a
      JOIN artist_profiles ap ON ap.id = a.artist_id
      WHERE a.status = 'published'
    $MV$;
    CREATE UNIQUE INDEX IF NOT EXISTS artwork_scores_id_idx ON artwork_scores(id);
    CREATE INDEX IF NOT EXISTS artwork_scores_combined_idx
      ON artwork_scores((popularity_score + freshness_score + artist_score) DESC);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS feed_signals (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  artwork_id  UUID NOT NULL REFERENCES artworks(id) ON DELETE CASCADE,
  signal_type TEXT NOT NULL CHECK (signal_type IN ('skip','not_interested','long_view','save')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_feed_signals_user ON feed_signals(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feed_signals_artwork ON feed_signals(artwork_id);

ALTER TABLE feed_signals ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='feed_signals' AND policyname='feed_signals_owner_read') THEN
    CREATE POLICY feed_signals_owner_read ON feed_signals FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='feed_signals' AND policyname='feed_signals_owner_write') THEN
    CREATE POLICY feed_signals_owner_write ON feed_signals FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='feed_signals' AND policyname='feed_signals_owner_delete') THEN
    CREATE POLICY feed_signals_owner_delete ON feed_signals FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- ─────────────────────────────────────────────────────────────────
-- get_personalized_feed — replaces the stub from 00015
-- 5 factors: follows x5, top mediums x3, price band boost,
--            geo within 200km, diversity cap 2/artist per 10.
-- Final score: popularity*0.3 + freshness*0.3 + artist*0.1 + affinity*0.3
-- Fallback for users without history: popularity + freshness only.
-- ─────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION get_personalized_feed(
  p_user_id UUID,
  p_limit   INT DEFAULT 10,
  p_offset  INT DEFAULT 0
)
RETURNS TABLE (
  artwork_id  UUID,
  artist_id   UUID,
  score       NUMERIC,
  rank_in_batch INT
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
  v_has_history BOOLEAN := FALSE;
  v_median_price NUMERIC;
  v_user_lat NUMERIC;
  v_user_lng NUMERIC;
BEGIN
  -- Detect if the user has any history (wishlist/reactions/follows)
  IF p_user_id IS NOT NULL THEN
    SELECT
      EXISTS(SELECT 1 FROM wishlists WHERE user_id = p_user_id) OR
      EXISTS(SELECT 1 FROM reactions WHERE user_id = p_user_id) OR
      EXISTS(SELECT 1 FROM follows   WHERE follower_id = p_user_id)
    INTO v_has_history;
  END IF;

  -- Median wishlist price (factor 3)
  IF v_has_history THEN
    SELECT percentile_cont(0.5) WITHIN GROUP (ORDER BY a.price)
      INTO v_median_price
      FROM wishlists w
      JOIN artworks a ON a.id = w.artwork_id
     WHERE w.user_id = p_user_id AND a.price IS NOT NULL;
  END IF;

  -- Factor 4 geo: look up user's own artist location if any (profiles has no lat/lng yet).
  -- TODO: when profiles gain location_lat/location_lng, read them here.
  SELECT ap.location_lat, ap.location_lng
    INTO v_user_lat, v_user_lng
    FROM artist_profiles ap
   WHERE ap.user_id = p_user_id
   LIMIT 1;

  -- ── Non-personalised fallback ──
  IF NOT v_has_history OR p_user_id IS NULL THEN
    RETURN QUERY
    WITH scored AS (
      SELECT
        s.id         AS artwork_id,
        s.artist_id,
        (s.popularity_score + s.freshness_score) AS score
      FROM artwork_scores s
      WHERE NOT EXISTS (
        SELECT 1 FROM feed_signals fs
        WHERE fs.user_id = p_user_id
          AND fs.artwork_id = s.id
          AND fs.signal_type = 'not_interested'
      )
    ),
    ranked AS (
      SELECT
        scored.*,
        ROW_NUMBER() OVER (PARTITION BY scored.artist_id ORDER BY scored.score DESC)::INT AS rank_in_batch
      FROM scored
    )
    SELECT ranked.artwork_id, ranked.artist_id, ranked.score, ranked.rank_in_batch
      FROM ranked
     WHERE ranked.rank_in_batch <= 2 -- diversity: max 2 per artist
     ORDER BY ranked.score DESC
     LIMIT p_limit OFFSET p_offset;
    RETURN;
  END IF;

  -- ── Personalised path ──
  RETURN QUERY
  WITH
  top_mediums AS (
    SELECT medium FROM (
      SELECT a.medium, COUNT(*) AS c
        FROM wishlists w JOIN artworks a ON a.id = w.artwork_id
       WHERE w.user_id = p_user_id
       GROUP BY a.medium
      UNION ALL
      SELECT a.medium, COUNT(*) AS c
        FROM reactions r
        JOIN carnet_posts cp ON cp.id = r.post_id
        JOIN artworks a ON a.id = cp.linked_artwork_id
       WHERE r.user_id = p_user_id AND cp.linked_artwork_id IS NOT NULL
       GROUP BY a.medium
    ) u
    GROUP BY medium
    ORDER BY SUM(c) DESC
    LIMIT 3
  ),
  followed_artists AS (
    SELECT artist_id FROM follows WHERE follower_id = p_user_id
  ),
  affinity AS (
    SELECT
      s.id AS artwork_id,
      s.artist_id,
      s.medium,
      s.price,
      s.location_lat,
      s.location_lng,
      s.popularity_score,
      s.freshness_score,
      s.artist_score,
      -- user_affinity built from factors 1-4 (scaled to ~0..100)
      (
        (CASE WHEN s.artist_id IN (SELECT artist_id FROM followed_artists) THEN 50 ELSE 0 END) + -- factor 1 x5
        (CASE WHEN s.medium    IN (SELECT medium    FROM top_mediums)      THEN 30 ELSE 0 END) + -- factor 2 x3
        (CASE WHEN v_median_price IS NOT NULL
              AND s.price BETWEEN v_median_price * 0.5 AND v_median_price * 1.5
              THEN 15 ELSE 0 END) +                                                              -- factor 3
        (CASE WHEN v_user_lat IS NOT NULL AND s.location_lat IS NOT NULL
              AND (
                -- approx haversine in km; 200km radius
                6371 * 2 * ASIN(SQRT(
                  POWER(SIN(RADIANS((s.location_lat - v_user_lat)/2)), 2) +
                  COS(RADIANS(v_user_lat)) * COS(RADIANS(s.location_lat)) *
                  POWER(SIN(RADIANS((s.location_lng - v_user_lng)/2)), 2)
                ))
              ) <= 200
              THEN 15 ELSE 0 END)                                                                -- factor 4
      )::NUMERIC AS user_affinity
    FROM artwork_scores s
  ),
  scored AS (
    SELECT
      a.artwork_id,
      a.artist_id,
      (a.popularity_score * 0.3
        + a.freshness_score  * 0.3
        + a.artist_score     * 0.1
        + a.user_affinity    * 0.3) AS score
    FROM affinity a
    WHERE NOT EXISTS (
      SELECT 1 FROM feed_signals fs
      WHERE fs.user_id = p_user_id
        AND fs.artwork_id = a.artwork_id
        AND fs.signal_type = 'not_interested'
    )
  ),
  ranked AS (
    SELECT
      scored.*,
      ROW_NUMBER() OVER (PARTITION BY scored.artist_id ORDER BY scored.score DESC)::INT AS rank_in_batch
    FROM scored
  )
  SELECT ranked.artwork_id, ranked.artist_id, ranked.score, ranked.rank_in_batch
    FROM ranked
   WHERE ranked.rank_in_batch <= 2 -- factor 5: max 2 per artist in a batch
   ORDER BY ranked.score DESC
   LIMIT p_limit OFFSET p_offset;
END;
$$;

GRANT EXECUTE ON FUNCTION get_personalized_feed(UUID, INT, INT) TO anon, authenticated;

-- ─────────────────────────────────────────────────────────────────
-- get_personalized_carnet_feed — /feed page (phase 14.3)
-- Returns a mix: 70% posts from followed artists + 30% popular discovery.
-- Adds `source` column ('follow' | 'discovery').
-- ─────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION get_personalized_carnet_feed(
  p_user_id UUID,
  p_limit   INT DEFAULT 10,
  p_offset  INT DEFAULT 0
)
RETURNS TABLE (
  post_id           UUID,
  artist_id         UUID,
  source            TEXT,
  score             NUMERIC,
  created_at        TIMESTAMPTZ
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
  v_follow_count INT := GREATEST(1, (p_limit * 7) / 10);   -- ~70%
  v_disc_count   INT := GREATEST(0, p_limit - v_follow_count); -- ~30%
  v_follow_offset INT := (p_offset * 7) / 10;
  v_disc_offset   INT := (p_offset * 3) / 10;
BEGIN
  RETURN QUERY
  WITH follow_posts AS (
    SELECT
      cp.id            AS post_id,
      cp.artist_id,
      'follow'::TEXT   AS source,
      (EXTRACT(EPOCH FROM cp.created_at))::NUMERIC AS score,
      cp.created_at
    FROM carnet_posts cp
    JOIN follows f
      ON f.artist_id = cp.artist_id
     AND f.follower_id = p_user_id
    ORDER BY cp.created_at DESC
    LIMIT v_follow_count OFFSET v_follow_offset
  ),
  discovery_posts AS (
    SELECT
      cp.id          AS post_id,
      cp.artist_id,
      'discovery'::TEXT AS source,
      (
        COALESCE((cp.reaction_counts->>'touched')::NUMERIC, 0) +
        COALESCE((cp.reaction_counts->>'want')::NUMERIC, 0) * 2 +
        COALESCE(cp.comment_count, 0) +
        -- freshness decay (30d)
        EXP(-EXTRACT(EPOCH FROM (NOW() - cp.created_at)) / (30 * 86400)) * 50
      )::NUMERIC AS score,
      cp.created_at
    FROM carnet_posts cp
    WHERE NOT EXISTS (
      SELECT 1 FROM follows f
      WHERE f.follower_id = p_user_id
        AND f.artist_id = cp.artist_id
    )
    ORDER BY score DESC, cp.created_at DESC
    LIMIT v_disc_count OFFSET v_disc_offset
  )
  SELECT * FROM follow_posts
  UNION ALL
  SELECT * FROM discovery_posts
  ORDER BY source ASC, created_at DESC; -- follow first (chrono), then discovery
END;
$$;

GRANT EXECUTE ON FUNCTION get_personalized_carnet_feed(UUID, INT, INT) TO anon, authenticated;
