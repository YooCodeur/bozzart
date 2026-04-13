-- ═══════════════════════════════════════════════
-- NOTIFICATIONS
-- ═══════════════════════════════════════════════

CREATE TABLE notifications (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type        notification_type NOT NULL,
  title       TEXT NOT NULL,
  body        TEXT,
  data        JSONB DEFAULT '{}',
  is_read     BOOLEAN DEFAULT FALSE,
  deep_link   TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, created_at DESC, is_read);

-- ═══════════════════════════════════════════════
-- PUSH_TOKENS
-- ═══════════════════════════════════════════════

CREATE TABLE push_tokens (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  token       TEXT NOT NULL,
  platform    TEXT NOT NULL,
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, token)
);

-- ═══════════════════════════════════════════════
-- ARTIST_ANALYTICS_DAILY
-- ═══════════════════════════════════════════════

CREATE TABLE artist_analytics_daily (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artist_id       UUID NOT NULL REFERENCES artist_profiles(id) ON DELETE CASCADE,
  date            DATE NOT NULL,
  profile_views   INTEGER DEFAULT 0,
  artwork_views   INTEGER DEFAULT 0,
  new_followers   INTEGER DEFAULT 0,
  new_wishlists   INTEGER DEFAULT 0,
  messages_received INTEGER DEFAULT 0,
  sales_count     INTEGER DEFAULT 0,
  sales_amount    DECIMAL(10,2) DEFAULT 0,
  discovery_impressions INTEGER DEFAULT 0,
  UNIQUE(artist_id, date)
);
