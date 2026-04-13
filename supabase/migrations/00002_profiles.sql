-- ═══════════════════════════════════════════════
-- PROFILES (extension de auth.users Supabase)
-- ═══════════════════════════════════════════════

CREATE TABLE profiles (
  id                UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role              user_role NOT NULL DEFAULT 'buyer',
  username          TEXT UNIQUE NOT NULL,
  display_name      TEXT NOT NULL,
  avatar_url        TEXT,
  bio               TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ═══════════════════════════════════════════════
-- ARTIST_PROFILES
-- ═══════════════════════════════════════════════

CREATE TABLE artist_profiles (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id               UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,

  -- Identite
  slug                  TEXT UNIQUE NOT NULL,
  full_name             TEXT NOT NULL,
  pronouns              TEXT,
  location_city         TEXT,
  location_country      TEXT,
  location_lat          DECIMAL(9,6),
  location_lng          DECIMAL(9,6),
  website_url           TEXT,
  instagram_url         TEXT,

  -- L'Histoire (biographie longue)
  story_html            TEXT,
  story_chapters        JSONB DEFAULT '[]',

  -- Stripe Connect
  stripe_account_id     TEXT,
  stripe_onboarded      BOOLEAN DEFAULT FALSE,
  stripe_payouts_enabled BOOLEAN DEFAULT FALSE,

  -- Parametres
  messaging_enabled     BOOLEAN DEFAULT TRUE,
  messaging_filter      TEXT DEFAULT 'all',
  silence_mode_until    TIMESTAMPTZ,
  silence_messaging     BOOLEAN DEFAULT FALSE,

  -- Programme Fondateurs
  is_founder            BOOLEAN DEFAULT FALSE,
  founder_since         TIMESTAMPTZ,
  commission_rate       DECIMAL(4,3) DEFAULT 0.10,

  -- Stats denormalisees (trigger)
  total_sales_count     INTEGER DEFAULT 0,
  total_sales_amount    DECIMAL(10,2) DEFAULT 0,
  follower_count        INTEGER DEFAULT 0,
  artwork_count         INTEGER DEFAULT 0,

  -- Flags
  is_featured           BOOLEAN DEFAULT FALSE,
  is_verified           BOOLEAN DEFAULT FALSE,

  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_artist_location ON artist_profiles USING GIST (
  point(location_lng, location_lat)
);
CREATE INDEX idx_artist_slug ON artist_profiles(slug);
