-- ═══════════════════════════════════════════════
-- PHASE 23 — LIVE STREAMING ATELIER
-- ═══════════════════════════════════════════════

-- ─── live_streams ──────────────────────────────
CREATE TABLE live_streams (
  id                     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artist_id              UUID NOT NULL REFERENCES artist_profiles(id) ON DELETE CASCADE,
  title                  TEXT NOT NULL,
  description            TEXT,
  scheduled_at           TIMESTAMPTZ,
  started_at             TIMESTAMPTZ,
  ended_at               TIMESTAMPTZ,
  status                 TEXT NOT NULL DEFAULT 'scheduled'
                           CHECK (status IN ('scheduled', 'live', 'ended', 'canceled')),
  provider               TEXT NOT NULL DEFAULT 'mux',
  provider_stream_id     TEXT,
  provider_playback_id   TEXT,
  stream_key             TEXT,
  rtmp_ingest_url        TEXT,
  recording_url          TEXT,
  viewer_count           INTEGER NOT NULL DEFAULT 0,
  peak_viewers           INTEGER NOT NULL DEFAULT 0,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_live_streams_status ON live_streams(status, scheduled_at DESC);
CREATE INDEX idx_live_streams_artist ON live_streams(artist_id, status);

-- ─── live_chat_messages ────────────────────────
CREATE TABLE live_chat_messages (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stream_id   UUID NOT NULL REFERENCES live_streams(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body        TEXT NOT NULL CHECK (char_length(body) BETWEEN 1 AND 500),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_live_chat_stream ON live_chat_messages(stream_id, created_at DESC);

-- ─── live_reactions ────────────────────────────
CREATE TABLE live_reactions (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stream_id   UUID NOT NULL REFERENCES live_streams(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  emoji       TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_live_reactions_stream ON live_reactions(stream_id, created_at DESC);

-- ═══════════════════════════════════════════════
-- RLS
-- ═══════════════════════════════════════════════

ALTER TABLE live_streams        ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_chat_messages  ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_reactions      ENABLE ROW LEVEL SECURITY;

-- ─ live_streams : lecture publique pour scheduled/live/ended, CRUD artiste owner ─
CREATE POLICY "live_streams_public_read" ON live_streams
  FOR SELECT USING (status IN ('scheduled', 'live', 'ended'));

CREATE POLICY "live_streams_owner_all" ON live_streams
  FOR ALL USING (
    artist_id IN (SELECT id FROM artist_profiles WHERE user_id = auth.uid())
  ) WITH CHECK (
    artist_id IN (SELECT id FROM artist_profiles WHERE user_id = auth.uid())
  );

-- ─ live_chat_messages ─
-- SELECT public quand stream live/ended
CREATE POLICY "live_chat_public_read" ON live_chat_messages
  FOR SELECT USING (
    stream_id IN (SELECT id FROM live_streams WHERE status IN ('live', 'ended'))
  );

-- INSERT : authenticated users, stream doit être live
-- TODO: rate-limit (max N messages / 10s) via edge function ou trigger
CREATE POLICY "live_chat_auth_insert" ON live_chat_messages
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND stream_id IN (SELECT id FROM live_streams WHERE status = 'live')
  );

-- DELETE : l'artiste du stream (modération)
CREATE POLICY "live_chat_owner_delete" ON live_chat_messages
  FOR DELETE USING (
    stream_id IN (
      SELECT ls.id FROM live_streams ls
      JOIN artist_profiles ap ON ap.id = ls.artist_id
      WHERE ap.user_id = auth.uid()
    )
  );

-- ─ live_reactions ─
CREATE POLICY "live_reactions_public_read" ON live_reactions
  FOR SELECT USING (
    stream_id IN (SELECT id FROM live_streams WHERE status IN ('live', 'ended'))
  );

CREATE POLICY "live_reactions_auth_insert" ON live_reactions
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND stream_id IN (SELECT id FROM live_streams WHERE status = 'live')
  );

-- ═══════════════════════════════════════════════
-- Realtime
-- ═══════════════════════════════════════════════
ALTER PUBLICATION supabase_realtime ADD TABLE live_chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE live_reactions;
ALTER PUBLICATION supabase_realtime ADD TABLE live_streams;
