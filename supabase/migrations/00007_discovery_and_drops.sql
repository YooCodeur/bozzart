-- ═══════════════════════════════════════════════
-- DISCOVERY_SLOTS (curation editoriale)
-- ═══════════════════════════════════════════════

CREATE TABLE discovery_slots (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artwork_id  UUID NOT NULL REFERENCES artworks(id),
  curator_id  UUID NOT NULL REFERENCES profiles(id),
  slot_date   DATE NOT NULL,
  slot_hour   INTEGER NOT NULL CHECK (slot_hour BETWEEN 0 AND 23),
  is_active   BOOLEAN DEFAULT TRUE,
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(slot_date, slot_hour)
);

CREATE INDEX idx_discovery_date ON discovery_slots(slot_date, slot_hour);

-- ═══════════════════════════════════════════════
-- DROPS
-- ═══════════════════════════════════════════════

CREATE TABLE drops (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artist_id       UUID NOT NULL REFERENCES artist_profiles(id),
  title           TEXT NOT NULL,
  description     TEXT,
  cover_url       TEXT,
  status          drop_status DEFAULT 'scheduled',
  starts_at       TIMESTAMPTZ NOT NULL,
  ends_at         TIMESTAMPTZ NOT NULL,
  is_sponsored    BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE drop_artworks (
  drop_id     UUID NOT NULL REFERENCES drops(id) ON DELETE CASCADE,
  artwork_id  UUID NOT NULL REFERENCES artworks(id),
  sort_order  INTEGER DEFAULT 0,
  PRIMARY KEY (drop_id, artwork_id)
);
