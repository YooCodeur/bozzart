-- ═══════════════════════════════════════════════
-- CONVERSATIONS
-- ═══════════════════════════════════════════════

CREATE TABLE conversations (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artwork_id      UUID NOT NULL REFERENCES artworks(id) ON DELETE CASCADE,
  buyer_id        UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  artist_id       UUID NOT NULL REFERENCES artist_profiles(id) ON DELETE CASCADE,
  last_message_at TIMESTAMPTZ,
  buyer_unread    INTEGER DEFAULT 0,
  artist_unread   INTEGER DEFAULT 0,
  is_archived     BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(artwork_id, buyer_id)
);

CREATE INDEX idx_conversations_artist ON conversations(artist_id, last_message_at DESC);
CREATE INDEX idx_conversations_buyer ON conversations(buyer_id, last_message_at DESC);

-- ═══════════════════════════════════════════════
-- MESSAGES
-- ═══════════════════════════════════════════════

CREATE TABLE messages (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id       UUID NOT NULL REFERENCES profiles(id),
  body            TEXT,
  type            TEXT DEFAULT 'text',
  payment_link_url TEXT,
  payment_link_amount DECIMAL(10,2),
  payment_link_used BOOLEAN DEFAULT FALSE,
  status          message_status DEFAULT 'sent',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at ASC);
