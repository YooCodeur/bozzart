-- ═══════════════════════════════════════════════
-- PHASE 24 — DATA & INTELLIGENCE
-- ═══════════════════════════════════════════════

-- ----------------------------------------------------------------
-- Opt-in pour l'estimation de valeur publique
-- ----------------------------------------------------------------
ALTER TABLE artist_profiles
  ADD COLUMN IF NOT EXISTS show_value_estimate BOOLEAN DEFAULT FALSE;

-- ----------------------------------------------------------------
-- MATERIALIZED VIEW: artist_analytics_daily_mv
-- (la table artist_analytics_daily existe deja, on agrege par jour
--  a partir des sources + de cette table evenementielle)
-- ----------------------------------------------------------------
DROP MATERIALIZED VIEW IF EXISTS artist_analytics_daily_mv;
CREATE MATERIALIZED VIEW artist_analytics_daily_mv AS
WITH follows_daily AS (
  SELECT artist_id, DATE(created_at) AS day, COUNT(*)::int AS follows_gained
  FROM follows
  GROUP BY artist_id, DATE(created_at)
),
wishlist_daily AS (
  SELECT a.artist_id, DATE(w.created_at) AS day, COUNT(*)::int AS wishlist_adds
  FROM wishlists w
  JOIN artworks a ON a.id = w.artwork_id
  GROUP BY a.artist_id, DATE(w.created_at)
),
carnet_events AS (
  SELECT cp.artist_id, r.created_at FROM carnet_posts cp JOIN reactions r ON r.post_id = cp.id
  UNION ALL
  SELECT cp.artist_id, c.created_at FROM carnet_posts cp JOIN comments c ON c.post_id = cp.id
),
carnet_daily AS (
  SELECT artist_id, DATE(created_at) AS day, COUNT(*)::int AS engagement
  FROM carnet_events
  GROUP BY artist_id, DATE(created_at)
),
sales_daily AS (
  SELECT artist_id,
         DATE(COALESCE(paid_at, created_at)) AS day,
         COUNT(*)::int AS sales_count,
         COALESCE(SUM((amount * 100)::bigint), 0)::bigint AS revenue_cents
  FROM transactions
  WHERE status = 'completed'
  GROUP BY artist_id, DATE(COALESCE(paid_at, created_at))
),
views_daily AS (
  SELECT artist_id,
         date AS day,
         (COALESCE(profile_views, 0) + COALESCE(artwork_views, 0))::int AS views
  FROM artist_analytics_daily
)
SELECT
  ap.id AS artist_id,
  d.day,
  COALESCE(v.views, 0) AS views,
  COALESCE(f.follows_gained, 0) AS follows_gained,
  COALESCE(w.wishlist_adds, 0) AS wishlist_adds,
  COALESCE(c.engagement, 0) AS carnet_engagement,
  COALESCE(s.sales_count, 0) AS sales_count,
  COALESCE(s.revenue_cents, 0) AS revenue_cents
FROM artist_profiles ap
JOIN (
  SELECT artist_id, day FROM follows_daily
  UNION SELECT artist_id, day FROM wishlist_daily
  UNION SELECT artist_id, day FROM carnet_daily
  UNION SELECT artist_id, day FROM sales_daily
  UNION SELECT artist_id, day FROM views_daily
) d ON d.artist_id = ap.id
LEFT JOIN follows_daily  f ON f.artist_id = ap.id AND f.day = d.day
LEFT JOIN wishlist_daily w ON w.artist_id = ap.id AND w.day = d.day
LEFT JOIN carnet_daily   c ON c.artist_id = ap.id AND c.day = d.day
LEFT JOIN sales_daily    s ON s.artist_id = ap.id AND s.day = d.day
LEFT JOIN views_daily    v ON v.artist_id = ap.id AND v.day = d.day;

CREATE UNIQUE INDEX IF NOT EXISTS idx_artist_analytics_mv_pk
  ON artist_analytics_daily_mv(artist_id, day);
CREATE INDEX IF NOT EXISTS idx_artist_analytics_mv_day
  ON artist_analytics_daily_mv(day DESC);

-- ----------------------------------------------------------------
-- MATERIALIZED VIEW: market_trends_weekly
-- ----------------------------------------------------------------
DROP MATERIALIZED VIEW IF EXISTS market_trends_weekly;
CREATE MATERIALIZED VIEW market_trends_weekly AS
WITH weekly AS (
  SELECT
    aw.medium,
    DATE_TRUNC('week', COALESCE(t.paid_at, t.created_at))::date AS week_start,
    COUNT(*)::int AS tx_count,
    (PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY t.amount))::numeric(10,2) AS median_price
  FROM transactions t
  JOIN artworks aw ON aw.id = t.artwork_id
  WHERE t.status = 'completed'
  GROUP BY aw.medium, DATE_TRUNC('week', COALESCE(t.paid_at, t.created_at))
),
with_prev AS (
  SELECT
    medium,
    week_start,
    tx_count,
    median_price,
    LAG(tx_count) OVER (PARTITION BY medium ORDER BY week_start) AS prev_tx,
    LAG(median_price) OVER (PARTITION BY medium ORDER BY week_start) AS prev_median
  FROM weekly
)
SELECT
  medium,
  week_start,
  tx_count,
  median_price,
  CASE
    WHEN prev_tx IS NULL OR prev_tx = 0 THEN NULL
    ELSE ROUND(((tx_count::numeric - prev_tx::numeric) / prev_tx::numeric) * 100, 2)
  END AS trending_score
FROM with_prev;

CREATE UNIQUE INDEX IF NOT EXISTS idx_market_trends_pk
  ON market_trends_weekly(medium, week_start);
CREATE INDEX IF NOT EXISTS idx_market_trends_week
  ON market_trends_weekly(week_start DESC);

-- ----------------------------------------------------------------
-- TABLE: value_estimates
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS value_estimates (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artwork_id            UUID NOT NULL REFERENCES artworks(id) ON DELETE CASCADE,
  estimated_low_cents   BIGINT NOT NULL,
  estimated_high_cents  BIGINT NOT NULL,
  confidence            NUMERIC(4,3) NOT NULL DEFAULT 0,
  model_version         TEXT NOT NULL,
  computed_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_value_estimates_artwork
  ON value_estimates(artwork_id, computed_at DESC);
CREATE INDEX IF NOT EXISTS idx_value_estimates_model
  ON value_estimates(model_version);

ALTER TABLE value_estimates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS value_estimates_read ON value_estimates;
CREATE POLICY value_estimates_read ON value_estimates FOR SELECT USING (TRUE);

-- ----------------------------------------------------------------
-- VIEW: buyer_insights
-- ----------------------------------------------------------------
CREATE OR REPLACE VIEW buyer_insights AS
WITH mediums AS (
  SELECT w.user_id,
         aw.medium,
         COUNT(*) AS cnt,
         ROW_NUMBER() OVER (PARTITION BY w.user_id ORDER BY COUNT(*) DESC) AS rnk
  FROM wishlists w
  JOIN artworks aw ON aw.id = w.artwork_id
  GROUP BY w.user_id, aw.medium
),
top_mediums AS (
  SELECT user_id, ARRAY_AGG(medium ORDER BY rnk) FILTER (WHERE rnk <= 3) AS preferred_mediums
  FROM mediums
  GROUP BY user_id
),
wishlist_avg AS (
  SELECT w.user_id, AVG(aw.price)::numeric(10,2) AS avg_wishlist_price
  FROM wishlists w
  JOIN artworks aw ON aw.id = w.artwork_id
  GROUP BY w.user_id
),
followed AS (
  SELECT follower_id AS user_id, COUNT(*)::int AS artists_followed_count
  FROM follows
  GROUP BY follower_id
),
purchases AS (
  SELECT buyer_id AS user_id, COUNT(*)::int AS purchase_count
  FROM transactions
  WHERE status = 'completed' AND buyer_id IS NOT NULL
  GROUP BY buyer_id
)
SELECT
  p.id AS user_id,
  COALESCE(tm.preferred_mediums, ARRAY[]::artwork_medium[]) AS preferred_mediums,
  COALESCE(wa.avg_wishlist_price, 0) AS avg_wishlist_price,
  COALESCE(f.artists_followed_count, 0) AS artists_followed_count,
  COALESCE(pu.purchase_count, 0) AS purchase_count
FROM profiles p
LEFT JOIN top_mediums  tm ON tm.user_id = p.id
LEFT JOIN wishlist_avg wa ON wa.user_id = p.id
LEFT JOIN followed     f  ON f.user_id = p.id
LEFT JOIN purchases    pu ON pu.user_id = p.id;

-- ----------------------------------------------------------------
-- pg_cron (optional)
-- ----------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    PERFORM cron.schedule(
      'refresh_artist_analytics_daily_mv',
      '0 * * * *',
      $cron$ REFRESH MATERIALIZED VIEW CONCURRENTLY artist_analytics_daily_mv $cron$
    );
    PERFORM cron.schedule(
      'refresh_market_trends_weekly',
      '15 3 * * *',
      $cron$ REFRESH MATERIALIZED VIEW CONCURRENTLY market_trends_weekly $cron$
    );
  END IF;
EXCEPTION WHEN OTHERS THEN
  -- cron job déjà existant ou extension indispo : on ignore silencieusement
  NULL;
END $$;
