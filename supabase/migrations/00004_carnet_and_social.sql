-- ═══════════════════════════════════════════════
-- CARNET_POSTS
-- ═══════════════════════════════════════════════

CREATE TABLE carnet_posts (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artist_id       UUID NOT NULL REFERENCES artist_profiles(id) ON DELETE CASCADE,

  type            post_type NOT NULL,
  caption         TEXT,
  body_html       TEXT,
  media_urls      TEXT[] DEFAULT '{}',
  media_metadata  JSONB DEFAULT '{}',
  linked_artwork_id UUID REFERENCES artworks(id),

  comments_enabled  BOOLEAN DEFAULT TRUE,
  silence_metrics   BOOLEAN DEFAULT FALSE,

  -- Stats (trigger)
  reaction_counts   JSONB DEFAULT '{"touched":0,"want":0,"how":0,"share":0}',
  comment_count     INTEGER DEFAULT 0,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_posts_artist ON carnet_posts(artist_id, created_at DESC);

-- ═══════════════════════════════════════════════
-- REACTIONS
-- ═══════════════════════════════════════════════

CREATE TABLE reactions (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  post_id     UUID NOT NULL REFERENCES carnet_posts(id) ON DELETE CASCADE,
  type        reaction_type NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);

-- ═══════════════════════════════════════════════
-- COMMENTS
-- ═══════════════════════════════════════════════

CREATE TABLE comments (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id     UUID NOT NULL REFERENCES carnet_posts(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  body        TEXT NOT NULL,
  parent_id   UUID REFERENCES comments(id),
  is_hidden   BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_comments_post ON comments(post_id, created_at ASC);

-- ═══════════════════════════════════════════════
-- FOLLOWS
-- ═══════════════════════════════════════════════

CREATE TABLE follows (
  follower_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  artist_id     UUID NOT NULL REFERENCES artist_profiles(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (follower_id, artist_id)
);

CREATE INDEX idx_follows_artist ON follows(artist_id);
CREATE INDEX idx_follows_follower ON follows(follower_id);

-- ═══════════════════════════════════════════════
-- WISHLISTS
-- ═══════════════════════════════════════════════

CREATE TABLE wishlists (
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  artwork_id  UUID NOT NULL REFERENCES artworks(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, artwork_id)
);
