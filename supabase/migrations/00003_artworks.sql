-- ═══════════════════════════════════════════════
-- ARTWORK_SERIES
-- ═══════════════════════════════════════════════

CREATE TABLE artwork_series (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artist_id     UUID NOT NULL REFERENCES artist_profiles(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  description   TEXT,
  cover_url     TEXT,
  is_visible    BOOLEAN DEFAULT TRUE,
  artwork_count INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ═══════════════════════════════════════════════
-- ARTWORKS
-- ═══════════════════════════════════════════════

CREATE TABLE artworks (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artist_id         UUID NOT NULL REFERENCES artist_profiles(id) ON DELETE CASCADE,

  -- Contenu
  title             TEXT NOT NULL,
  story_html        TEXT,
  medium            artwork_medium NOT NULL,
  year_created      INTEGER,
  dimensions        TEXT,
  edition_info      TEXT,
  tags              TEXT[] DEFAULT '{}',

  -- Fichiers
  primary_image_url TEXT NOT NULL,
  image_urls        TEXT[] DEFAULT '{}',
  thumbnail_url     TEXT,

  -- Commerce
  status            artwork_status DEFAULT 'draft',
  price             DECIMAL(10,2) NOT NULL,
  price_currency    TEXT DEFAULT 'EUR',
  is_price_visible  BOOLEAN DEFAULT TRUE,
  accepts_offers    BOOLEAN DEFAULT FALSE,

  -- Serie
  series_id         UUID REFERENCES artwork_series(id),
  series_order      INTEGER,

  -- Stats (trigger)
  wishlist_count    INTEGER DEFAULT 0,
  view_count        INTEGER DEFAULT 0,
  message_count     INTEGER DEFAULT 0,

  -- Messagerie
  messaging_enabled BOOLEAN DEFAULT TRUE,

  -- Print a la demande
  print_available   BOOLEAN DEFAULT FALSE,
  print_partner_id  TEXT,
  print_price       DECIMAL(10,2),

  -- SEO
  slug              TEXT,
  meta_description  TEXT,

  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_at      TIMESTAMPTZ
);

-- Index recherche full-text
CREATE INDEX idx_artworks_search ON artworks
  USING GIN (to_tsvector('french', title || ' ' || COALESCE(story_html, '')));
CREATE INDEX idx_artworks_artist ON artworks(artist_id);
CREATE INDEX idx_artworks_status ON artworks(status);
CREATE INDEX idx_artworks_medium ON artworks(medium);
CREATE INDEX idx_artworks_price ON artworks(price);
CREATE INDEX idx_artworks_tags ON artworks USING GIN(tags);
CREATE INDEX idx_artworks_slug ON artworks(slug);
