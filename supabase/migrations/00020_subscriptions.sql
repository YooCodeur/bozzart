-- Phase 18 — Systeme d'abonnement artiste
-- Plans, subscriptions, exclusive content access

-- ─── 18.1 subscription_plans ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artist_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price_monthly INTEGER NOT NULL CHECK (price_monthly >= 300 AND price_monthly <= 5000),
  currency TEXT NOT NULL DEFAULT 'eur',
  benefits JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  max_subscribers INTEGER,
  stripe_price_id TEXT,
  stripe_product_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscription_plans_artist
  ON subscription_plans(artist_id)
  WHERE is_active = true;

-- ─── 18.1 subscriptions ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscriber_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES subscription_plans(id) ON DELETE CASCADE,
  artist_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'expired')),
  stripe_subscription_id TEXT UNIQUE,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (subscriber_id, plan_id)
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_subscriber
  ON subscriptions(subscriber_id, status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_artist
  ON subscriptions(artist_id, status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan
  ON subscriptions(plan_id, status);

-- ─── 18.5 access_level sur carnet_posts ──────────────────────────────
ALTER TABLE carnet_posts
  ADD COLUMN IF NOT EXISTS access_level TEXT NOT NULL DEFAULT 'public'
    CHECK (access_level IN ('public', 'followers', 'subscribers'));

CREATE INDEX IF NOT EXISTS idx_carnet_posts_access_level
  ON carnet_posts(access_level)
  WHERE access_level <> 'public';

-- ─── RPC : is_subscriber(artist_id) ──────────────────────────────────
CREATE OR REPLACE FUNCTION is_subscriber(target_artist_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM subscriptions s
    WHERE s.artist_id = target_artist_id
      AND s.subscriber_id = auth.uid()
      AND s.status = 'active'
      AND (s.current_period_end IS NULL OR s.current_period_end > NOW())
  );
$$;

GRANT EXECUTE ON FUNCTION is_subscriber(UUID) TO authenticated, anon;

-- ─── Trigger updated_at ──────────────────────────────────────────────
CREATE OR REPLACE FUNCTION subscription_plans_touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_subscription_plans_updated_at ON subscription_plans;
CREATE TRIGGER trg_subscription_plans_updated_at
  BEFORE UPDATE ON subscription_plans
  FOR EACH ROW EXECUTE FUNCTION subscription_plans_touch_updated_at();

-- ─── RLS ─────────────────────────────────────────────────────────────
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- subscription_plans : lecture publique si actif, owner CRUD
DROP POLICY IF EXISTS "subscription_plans_select_public" ON subscription_plans;
CREATE POLICY "subscription_plans_select_public" ON subscription_plans
  FOR SELECT TO anon, authenticated
  USING (is_active = true OR artist_id = auth.uid());

DROP POLICY IF EXISTS "subscription_plans_insert_owner" ON subscription_plans;
CREATE POLICY "subscription_plans_insert_owner" ON subscription_plans
  FOR INSERT TO authenticated
  WITH CHECK (artist_id = auth.uid());

DROP POLICY IF EXISTS "subscription_plans_update_owner" ON subscription_plans;
CREATE POLICY "subscription_plans_update_owner" ON subscription_plans
  FOR UPDATE TO authenticated
  USING (artist_id = auth.uid())
  WITH CHECK (artist_id = auth.uid());

DROP POLICY IF EXISTS "subscription_plans_delete_owner" ON subscription_plans;
CREATE POLICY "subscription_plans_delete_owner" ON subscription_plans
  FOR DELETE TO authenticated
  USING (artist_id = auth.uid());

-- subscriptions : subscriber + artist lisent, ecriture via service_role
DROP POLICY IF EXISTS "subscriptions_select_participants" ON subscriptions;
CREATE POLICY "subscriptions_select_participants" ON subscriptions
  FOR SELECT TO authenticated
  USING (subscriber_id = auth.uid() OR artist_id = auth.uid());

-- Pas de policy INSERT/UPDATE/DELETE pour authenticated :
-- seul le service_role (webhook Stripe) peut ecrire.
