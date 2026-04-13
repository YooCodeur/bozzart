-- ═══════════════════════════════════════════════
-- TRANSACTIONS
-- ═══════════════════════════════════════════════

CREATE TABLE transactions (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artwork_id          UUID NOT NULL REFERENCES artworks(id),
  buyer_id            UUID REFERENCES profiles(id),
  artist_id           UUID NOT NULL REFERENCES artist_profiles(id),
  conversation_id     UUID REFERENCES conversations(id),

  -- Montants
  amount              DECIMAL(10,2) NOT NULL,
  platform_fee        DECIMAL(10,2) NOT NULL,
  artist_amount       DECIMAL(10,2) NOT NULL,
  currency            TEXT DEFAULT 'EUR',

  -- Stripe
  stripe_payment_intent_id TEXT UNIQUE,
  stripe_transfer_id       TEXT,
  stripe_payout_id         TEXT,

  -- Statut
  status              transaction_status DEFAULT 'pending',
  paid_at             TIMESTAMPTZ,
  transferred_at      TIMESTAMPTZ,
  payout_at           TIMESTAMPTZ,

  -- Acheteur guest
  guest_email         TEXT,
  guest_name          TEXT,

  -- Certificat
  certificate_url     TEXT,
  certificate_issued_at TIMESTAMPTZ,

  -- Droit de suite
  original_transaction_id UUID REFERENCES transactions(id),
  is_resale           BOOLEAN DEFAULT FALSE,
  resale_royalty_amount DECIMAL(10,2),

  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_transactions_artist ON transactions(artist_id, created_at DESC);
CREATE INDEX idx_transactions_buyer ON transactions(buyer_id, created_at DESC);
CREATE INDEX idx_transactions_status ON transactions(status);

-- ═══════════════════════════════════════════════
-- BUYER_COLLECTIONS
-- ═══════════════════════════════════════════════

CREATE TABLE buyer_collections (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  transaction_id  UUID NOT NULL REFERENCES transactions(id),
  artwork_id      UUID NOT NULL REFERENCES artworks(id),
  artist_id       UUID NOT NULL REFERENCES artist_profiles(id),
  purchased_at    TIMESTAMPTZ NOT NULL,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ═══════════════════════════════════════════════
-- CERTIFICATES
-- ═══════════════════════════════════════════════

CREATE TABLE certificates (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id  UUID NOT NULL UNIQUE REFERENCES transactions(id),
  type            certificate_type DEFAULT 'pdf',
  certificate_number TEXT UNIQUE NOT NULL,
  pdf_url         TEXT,
  blockchain_tx   TEXT,
  issued_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
