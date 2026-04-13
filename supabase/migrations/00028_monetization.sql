-- ═══════════════════════════════════════════════
-- PHASE 25 — MONETISATION AVANCEE
-- Boosts payants, recap revenus, dashboard plateforme
-- ═══════════════════════════════════════════════

-- ───────────────────────────────────────────────
-- 25.2 — Boost de visibilite (payant)
-- ───────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS artwork_boosts (
  id                        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artwork_id                UUID NOT NULL REFERENCES artworks(id) ON DELETE CASCADE,
  artist_id                 UUID NOT NULL REFERENCES artist_profiles(id) ON DELETE CASCADE,
  duration_days             INTEGER NOT NULL CHECK (duration_days IN (1, 3, 7, 14, 30)),
  price_cents               INTEGER NOT NULL CHECK (price_cents >= 0),
  currency                  TEXT NOT NULL DEFAULT 'EUR',
  stripe_payment_intent_id  TEXT UNIQUE,
  stripe_checkout_session_id TEXT UNIQUE,
  status                    TEXT NOT NULL DEFAULT 'pending'
                              CHECK (status IN ('pending', 'active', 'ended', 'cancelled')),
  starts_at                 TIMESTAMPTZ,
  ends_at                   TIMESTAMPTZ,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_artwork_boosts_artwork ON artwork_boosts(artwork_id);
CREATE INDEX IF NOT EXISTS idx_artwork_boosts_artist ON artwork_boosts(artist_id);
CREATE INDEX IF NOT EXISTS idx_artwork_boosts_status ON artwork_boosts(status);
CREATE INDEX IF NOT EXISTS idx_artwork_boosts_active ON artwork_boosts(artwork_id, ends_at)
  WHERE status = 'active';

-- ───────────────────────────────────────────────
-- Tarification des boosts
-- ───────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS boost_pricing (
  duration_days  INTEGER PRIMARY KEY CHECK (duration_days IN (1, 3, 7, 14, 30)),
  price_cents    INTEGER NOT NULL CHECK (price_cents >= 0),
  currency       TEXT NOT NULL DEFAULT 'EUR',
  label          TEXT NOT NULL,
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO boost_pricing (duration_days, price_cents, currency, label) VALUES
  (1,  500,  'EUR', '24 heures'),
  (3,  1200, 'EUR', '3 jours'),
  (7,  2500, 'EUR', '7 jours'),
  (14, 4500, 'EUR', '14 jours'),
  (30, 8000, 'EUR', '30 jours')
ON CONFLICT (duration_days) DO NOTHING;

-- ───────────────────────────────────────────────
-- Helper pour artwork_scores (integration future)
-- Retourne TRUE si l'oeuvre a un boost actif
-- TODO: a integrer dans une future artwork_scores_v2
--       en ajoutant +100 au score quand get_active_boost = TRUE
-- ───────────────────────────────────────────────

CREATE OR REPLACE FUNCTION get_active_boost(p_artwork_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
      FROM artwork_boosts
     WHERE artwork_id = p_artwork_id
       AND status = 'active'
       AND starts_at <= NOW()
       AND ends_at > NOW()
  );
$$;

-- Helper qui renvoie le bonus de score (pour artwork_scores_v2)
CREATE OR REPLACE FUNCTION get_boost_score(p_artwork_id UUID)
RETURNS INTEGER
LANGUAGE SQL
STABLE
AS $$
  SELECT CASE WHEN get_active_boost(p_artwork_id) THEN 100 ELSE 0 END;
$$;

-- ───────────────────────────────────────────────
-- 25.3 — Vue revenus plateforme (agregee par jour)
-- ───────────────────────────────────────────────

CREATE OR REPLACE VIEW platform_revenue_daily AS
WITH days AS (
  SELECT generate_series(
           (CURRENT_DATE - INTERVAL '365 days')::DATE,
           CURRENT_DATE,
           '1 day'::INTERVAL
         )::DATE AS day
),
commissions AS (
  SELECT DATE(paid_at) AS day,
         COALESCE(SUM(ROUND(platform_fee * 100)), 0)::BIGINT AS cents,
         COUNT(*)::BIGINT AS count
    FROM transactions
   WHERE status = 'completed'
     AND paid_at IS NOT NULL
     AND COALESCE(is_resale, FALSE) = FALSE
     AND (
       -- Filtrer les transactions commission personnalisee (si colonne existe)
       -- On prend tout ce qui n'est pas un boost/subscription ici
       TRUE
     )
   GROUP BY DATE(paid_at)
),
boosts AS (
  SELECT DATE(created_at) AS day,
         COALESCE(SUM(price_cents), 0)::BIGINT AS cents,
         COUNT(*)::BIGINT AS count
    FROM artwork_boosts
   WHERE status IN ('active', 'ended')
   GROUP BY DATE(created_at)
)
SELECT
  d.day AS date,
  COALESCE(c.cents, 0)  AS commission_revenue_cents,
  COALESCE(c.count, 0)  AS commission_count,
  -- Les colonnes suivantes dependent de tables introduites par
  -- les phases 18/19/20. On expose 0 par defaut et on laissera un
  -- TODO de branchement lorsque les tables seront presentes.
  0::BIGINT AS subscription_revenue_cents,
  0::BIGINT AS commission_feature_revenue_cents,
  0::BIGINT AS print_revenue_cents,
  COALESCE(b.cents, 0)  AS boost_revenue_cents,
  COALESCE(b.count, 0)  AS boost_count,
  (COALESCE(c.cents, 0)
   + COALESCE(b.cents, 0)
   + 0 + 0 + 0)::BIGINT AS total_cents
FROM days d
LEFT JOIN commissions c ON c.day = d.day
LEFT JOIN boosts      b ON b.day = d.day
ORDER BY d.day DESC;

COMMENT ON VIEW platform_revenue_daily IS
  'Agregats journaliers des revenus plateforme. TODO: brancher subscription_revenue_cents '
  '(phase 18), commission_feature_revenue_cents (phase 19), print_revenue_cents (phase 20) '
  'lorsque ces tables seront disponibles.';

-- ───────────────────────────────────────────────
-- RLS
-- ───────────────────────────────────────────────

ALTER TABLE artwork_boosts  ENABLE ROW LEVEL SECURITY;
ALTER TABLE boost_pricing   ENABLE ROW LEVEL SECURITY;

-- Boosts : l'artiste voit et gere les siens
CREATE POLICY "artwork_boosts_select_own" ON artwork_boosts
  FOR SELECT USING (
    artist_id IN (SELECT id FROM artist_profiles WHERE user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "artwork_boosts_insert_own" ON artwork_boosts
  FOR INSERT WITH CHECK (
    artist_id IN (SELECT id FROM artist_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "artwork_boosts_update_own" ON artwork_boosts
  FOR UPDATE USING (
    artist_id IN (SELECT id FROM artist_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "artwork_boosts_delete_own" ON artwork_boosts
  FOR DELETE USING (
    artist_id IN (SELECT id FROM artist_profiles WHERE user_id = auth.uid())
  );

-- Lecture publique discrete du statut boost actif pour afficher le badge
CREATE POLICY "artwork_boosts_select_public_active" ON artwork_boosts
  FOR SELECT USING (status = 'active');

-- Boost pricing : lecture publique
CREATE POLICY "boost_pricing_select_public" ON boost_pricing
  FOR SELECT USING (TRUE);

-- ───────────────────────────────────────────────
-- Acces admin a la vue revenus plateforme
-- Convention existante : role admin dans profiles
-- ───────────────────────────────────────────────

REVOKE ALL ON platform_revenue_daily FROM PUBLIC;
REVOKE ALL ON platform_revenue_daily FROM anon, authenticated;

CREATE OR REPLACE FUNCTION is_platform_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Wrapper RPC qui n'expose les donnees qu'aux admins
CREATE OR REPLACE FUNCTION get_platform_revenue_daily(p_days INTEGER DEFAULT 90)
RETURNS SETOF platform_revenue_daily
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT is_platform_admin() THEN
    RAISE EXCEPTION 'forbidden: admin role required';
  END IF;
  RETURN QUERY
    SELECT *
      FROM platform_revenue_daily
     WHERE date >= (CURRENT_DATE - (p_days || ' days')::INTERVAL)
     ORDER BY date DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION get_platform_revenue_daily(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION is_platform_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION get_active_boost(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_boost_score(UUID)  TO anon, authenticated;
