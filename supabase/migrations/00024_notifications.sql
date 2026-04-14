-- ═══════════════════════════════════════════════
-- PHASE 22 — SMART NOTIFICATIONS & RETENTION
-- ═══════════════════════════════════════════════

-- --------------------------------------------------
-- 22.1 — Categories column on notifications
-- --------------------------------------------------
-- The base `notifications` table already exists (00008). We add a free-form
-- `category` column with a CHECK constraint to cover the new retention
-- categories without breaking the existing enum-based `type` column.

ALTER TABLE notifications
  ADD COLUMN IF NOT EXISTS category TEXT,
  ADD COLUMN IF NOT EXISTS url TEXT,
  ADD COLUMN IF NOT EXISTS read BOOLEAN;

-- Back-fill read mirror from legacy is_read.
UPDATE notifications SET read = COALESCE(read, is_read) WHERE read IS NULL;
ALTER TABLE notifications ALTER COLUMN read SET DEFAULT FALSE;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'notifications_category_check'
  ) THEN
    ALTER TABLE notifications ADD CONSTRAINT notifications_category_check
      CHECK (category IS NULL OR category IN (
        'new_post_from_followed_artist',
        'artist_live_starting',
        'subscription_expiring',
        'price_drop_wishlist',
        'commission_update',
        'referral_converted',
        'social_proof',
        'reengagement'
      ));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_notifications_user_category
  ON notifications(user_id, category, created_at DESC);

-- --------------------------------------------------
-- notification_preferences
-- --------------------------------------------------
CREATE TABLE IF NOT EXISTS notification_preferences (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  -- new_post_from_followed_artist
  new_post_push     BOOLEAN NOT NULL DEFAULT TRUE,
  new_post_email    BOOLEAN NOT NULL DEFAULT FALSE,
  new_post_in_app   BOOLEAN NOT NULL DEFAULT TRUE,
  -- artist_live_starting
  live_push         BOOLEAN NOT NULL DEFAULT TRUE,
  live_email        BOOLEAN NOT NULL DEFAULT FALSE,
  live_in_app       BOOLEAN NOT NULL DEFAULT TRUE,
  -- subscription_expiring
  sub_push          BOOLEAN NOT NULL DEFAULT TRUE,
  sub_email         BOOLEAN NOT NULL DEFAULT TRUE,
  sub_in_app        BOOLEAN NOT NULL DEFAULT TRUE,
  -- price_drop_wishlist
  price_drop_push   BOOLEAN NOT NULL DEFAULT TRUE,
  price_drop_email  BOOLEAN NOT NULL DEFAULT TRUE,
  price_drop_in_app BOOLEAN NOT NULL DEFAULT TRUE,
  -- commission_update
  commission_push   BOOLEAN NOT NULL DEFAULT TRUE,
  commission_email  BOOLEAN NOT NULL DEFAULT TRUE,
  commission_in_app BOOLEAN NOT NULL DEFAULT TRUE,
  -- referral_converted
  referral_push     BOOLEAN NOT NULL DEFAULT TRUE,
  referral_email    BOOLEAN NOT NULL DEFAULT TRUE,
  referral_in_app   BOOLEAN NOT NULL DEFAULT TRUE,
  -- social_proof
  social_push       BOOLEAN NOT NULL DEFAULT FALSE,
  social_email      BOOLEAN NOT NULL DEFAULT FALSE,
  social_in_app     BOOLEAN NOT NULL DEFAULT TRUE,
  -- reengagement
  reengage_push     BOOLEAN NOT NULL DEFAULT TRUE,
  reengage_email    BOOLEAN NOT NULL DEFAULT TRUE,
  reengage_in_app   BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS np_owner_select ON notification_preferences;
CREATE POLICY np_owner_select ON notification_preferences
  FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS np_owner_upsert ON notification_preferences;
CREATE POLICY np_owner_upsert ON notification_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS np_owner_update ON notification_preferences;
CREATE POLICY np_owner_update ON notification_preferences
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- --------------------------------------------------
-- reengagement_jobs
-- --------------------------------------------------
CREATE TABLE IF NOT EXISTS reengagement_jobs (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reason       TEXT NOT NULL,
  sent_at      TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_reengagement_jobs_user
  ON reengagement_jobs(user_id, scheduled_at DESC);

ALTER TABLE reengagement_jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS rj_owner_select ON reengagement_jobs;
CREATE POLICY rj_owner_select ON reengagement_jobs
  FOR SELECT USING (auth.uid() = user_id);

-- --------------------------------------------------
-- 22.2 — Helper to insert notifications (SECURITY DEFINER)
-- --------------------------------------------------
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id  UUID,
  p_category TEXT,
  p_title    TEXT,
  p_body     TEXT,
  p_url      TEXT DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_id UUID;
  v_in_app BOOLEAN := TRUE;
BEGIN
  -- Respect in_app preference (defaults to true if no row exists).
  SELECT CASE p_category
    WHEN 'new_post_from_followed_artist' THEN new_post_in_app
    WHEN 'artist_live_starting'          THEN live_in_app
    WHEN 'subscription_expiring'         THEN sub_in_app
    WHEN 'price_drop_wishlist'           THEN price_drop_in_app
    WHEN 'commission_update'             THEN commission_in_app
    WHEN 'referral_converted'            THEN referral_in_app
    WHEN 'social_proof'                  THEN social_in_app
    WHEN 'reengagement'                  THEN reengage_in_app
    ELSE TRUE END
  INTO v_in_app
  FROM notification_preferences WHERE user_id = p_user_id;

  IF v_in_app IS FALSE THEN
    RETURN NULL;
  END IF;

  INSERT INTO notifications (user_id, type, category, title, body, url, read, is_read, deep_link)
  VALUES (p_user_id, 'system'::notification_type, p_category, p_title, p_body, p_url, FALSE, FALSE, p_url)
  RETURNING id INTO v_id;
  RETURN v_id;
END $$;

-- --------------------------------------------------
-- Trigger: new carnet_post → notify followers
-- --------------------------------------------------
CREATE OR REPLACE FUNCTION notify_new_carnet_post() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_author_name TEXT;
  v_follower RECORD;
BEGIN
  SELECT display_name INTO v_author_name FROM profiles WHERE id = NEW.author_id;
  FOR v_follower IN
    SELECT follower_id FROM follows WHERE following_id = NEW.author_id
  LOOP
    PERFORM create_notification(
      v_follower.follower_id,
      'new_post_from_followed_artist',
      COALESCE(v_author_name, 'Un artiste suivi') || ' a publie',
      LEFT(COALESCE(NEW.content, ''), 140),
      '/carnet/' || NEW.id::text
    );
  END LOOP;
  RETURN NEW;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'carnet_posts') THEN
    DROP TRIGGER IF EXISTS trg_notify_new_carnet_post ON carnet_posts;
    CREATE TRIGGER trg_notify_new_carnet_post
      AFTER INSERT ON carnet_posts
      FOR EACH ROW EXECUTE FUNCTION notify_new_carnet_post();
  END IF;
END $$;

-- --------------------------------------------------
-- Trigger: live_streams status → live
-- --------------------------------------------------
CREATE OR REPLACE FUNCTION notify_artist_live_starting() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_artist_name TEXT;
  v_follower RECORD;
BEGIN
  IF NEW.status = 'live' AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM 'live') THEN
    SELECT display_name INTO v_artist_name FROM profiles WHERE id = NEW.artist_id;
    FOR v_follower IN SELECT follower_id FROM follows WHERE following_id = NEW.artist_id LOOP
      PERFORM create_notification(
        v_follower.follower_id,
        'artist_live_starting',
        COALESCE(v_artist_name, 'Un artiste') || ' est en live',
        COALESCE(NEW.title, 'Rejoignez le live'),
        '/live/' || NEW.id::text
      );
    END LOOP;
  END IF;
  RETURN NEW;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'live_streams') THEN
    DROP TRIGGER IF EXISTS trg_notify_artist_live_starting ON live_streams;
    CREATE TRIGGER trg_notify_artist_live_starting
      AFTER INSERT OR UPDATE OF status ON live_streams
      FOR EACH ROW EXECUTE FUNCTION notify_artist_live_starting();
  END IF;
END $$;

-- --------------------------------------------------
-- Trigger: subscription expiring (scheduled insert via cron)
-- We expose a function that creates the notification for subs expiring in ~3 days.
-- --------------------------------------------------
CREATE OR REPLACE FUNCTION notify_subscriptions_expiring_soon() RETURNS INTEGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_row RECORD;
  v_count INTEGER := 0;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'subscriptions') THEN
    RETURN 0;
  END IF;
  FOR v_row IN
    EXECUTE $q$
      SELECT user_id, current_period_end
      FROM subscriptions
      WHERE status = 'active'
        AND current_period_end BETWEEN NOW() AND NOW() + INTERVAL '3 days'
    $q$
  LOOP
    PERFORM create_notification(
      v_row.user_id,
      'subscription_expiring',
      'Votre abonnement expire bientot',
      'Renouvelez avant le ' || to_char(v_row.current_period_end, 'DD/MM/YYYY'),
      '/dashboard/subscription'
    );
    v_count := v_count + 1;
  END LOOP;
  RETURN v_count;
END $$;

-- --------------------------------------------------
-- Trigger: price drop on wishlisted artwork
-- --------------------------------------------------
CREATE OR REPLACE FUNCTION notify_price_drop_wishlist() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_user RECORD;
BEGIN
  IF NEW.price IS NOT NULL AND OLD.price IS NOT NULL AND NEW.price < OLD.price THEN
    FOR v_user IN
      SELECT DISTINCT user_id FROM wishlists WHERE artwork_id = NEW.id
    LOOP
      PERFORM create_notification(
        v_user.user_id,
        'price_drop_wishlist',
        'Baisse de prix',
        COALESCE(NEW.title, 'Une oeuvre') || ' : ' || OLD.price::text || ' → ' || NEW.price::text || ' EUR',
        '/artworks/' || NEW.id::text
      );
    END LOOP;
  END IF;
  RETURN NEW;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'artworks')
     AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'wishlists') THEN
    DROP TRIGGER IF EXISTS trg_notify_price_drop_wishlist ON artworks;
    CREATE TRIGGER trg_notify_price_drop_wishlist
      AFTER UPDATE OF price ON artworks
      FOR EACH ROW EXECUTE FUNCTION notify_price_drop_wishlist();
  END IF;
END $$;

-- --------------------------------------------------
-- Trigger: commission status change
-- --------------------------------------------------
CREATE OR REPLACE FUNCTION notify_commission_update() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.status IS DISTINCT FROM OLD.status THEN
    IF NEW.client_id IS NOT NULL THEN
      PERFORM create_notification(
        NEW.client_id,
        'commission_update',
        'Commande mise a jour',
        'Statut : ' || NEW.status,
        '/dashboard/commissions/' || NEW.id::text
      );
    END IF;
    IF NEW.artist_id IS NOT NULL THEN
      PERFORM create_notification(
        NEW.artist_id,
        'commission_update',
        'Commande mise a jour',
        'Statut : ' || NEW.status,
        '/dashboard/commissions/' || NEW.id::text
      );
    END IF;
  END IF;
  RETURN NEW;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'commissions') THEN
    DROP TRIGGER IF EXISTS trg_notify_commission_update ON commissions;
    CREATE TRIGGER trg_notify_commission_update
      AFTER UPDATE OF status ON commissions
      FOR EACH ROW EXECUTE FUNCTION notify_commission_update();
  END IF;
END $$;

-- --------------------------------------------------
-- Trigger: referral conversion
-- --------------------------------------------------
CREATE OR REPLACE FUNCTION notify_referral_converted() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.status = 'converted' AND OLD.status IS DISTINCT FROM 'converted' THEN
    PERFORM create_notification(
      NEW.referrer_id,
      'referral_converted',
      'Un parrainage converti',
      'Felicitations, un filleul vient de s''inscrire et convertir.',
      '/dashboard/referrals'
    );
  END IF;
  RETURN NEW;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'referrals') THEN
    DROP TRIGGER IF EXISTS trg_notify_referral_converted ON referrals;
    CREATE TRIGGER trg_notify_referral_converted
      AFTER UPDATE OF status ON referrals
      FOR EACH ROW EXECUTE FUNCTION notify_referral_converted();
  END IF;
END $$;

-- --------------------------------------------------
-- 22.4 — Daily cron for re-engagement + subscription expiry
-- (pg_cron is optional; guarded.)
-- --------------------------------------------------
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    PERFORM cron.schedule(
      'reengagement-daily',
      '0 10 * * *',
      $cron$ SELECT notify_subscriptions_expiring_soon(); $cron$
    );
  END IF;
END $$;
