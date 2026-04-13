-- ═══════════════════════════════════════════════
-- PHASE 19 — CUSTOM COMMISSIONS
-- ═══════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS commissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  artist_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
  -- Brief
  title TEXT NOT NULL,
  brief TEXT NOT NULL,
  description TEXT,
  medium TEXT,
  dimensions_width INTEGER,
  dimensions_height INTEGER,
  reference_images TEXT[] DEFAULT '{}',
  -- Budget / deadline
  budget_cents INTEGER,
  currency TEXT DEFAULT 'eur',
  deadline DATE,
  estimated_delivery DATE,
  -- Artist quote
  artist_price_cents INTEGER,
  artist_notes TEXT,
  -- Delivery
  delivery_url TEXT,
  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending',
    'accepted',
    'declined',
    'in_progress',
    'delivered',
    'completed',
    'canceled'
  )),
  -- Stripe
  stripe_checkout_session_id TEXT,
  stripe_payment_intent_id TEXT,
  paid_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_commissions_artist_status
  ON commissions(artist_id, status);
CREATE INDEX IF NOT EXISTS idx_commissions_buyer_created
  ON commissions(buyer_id, created_at DESC);

-- ─── Updated_at trigger ───
CREATE OR REPLACE FUNCTION commissions_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_commissions_updated_at ON commissions;
CREATE TRIGGER trg_commissions_updated_at
  BEFORE UPDATE ON commissions
  FOR EACH ROW EXECUTE FUNCTION commissions_set_updated_at();

-- ─── Status transitions guard ───
-- TODO: extend with full state-machine validation. For now, only participants
-- can update, and buyers/artists each have limited allowed transitions.
CREATE OR REPLACE FUNCTION commissions_validate_transition()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;

  -- Allowed transitions
  IF NOT (
    (OLD.status = 'pending'     AND NEW.status IN ('accepted','declined','canceled')) OR
    (OLD.status = 'accepted'    AND NEW.status IN ('in_progress','canceled')) OR
    (OLD.status = 'in_progress' AND NEW.status IN ('delivered','canceled')) OR
    (OLD.status = 'delivered'   AND NEW.status IN ('completed','in_progress')) OR
    (OLD.status = 'declined'    AND FALSE) OR
    (OLD.status = 'completed'   AND FALSE) OR
    (OLD.status = 'canceled'    AND FALSE)
  ) THEN
    RAISE EXCEPTION 'Invalid commission status transition: % → %', OLD.status, NEW.status;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_commissions_validate_transition ON commissions;
CREATE TRIGGER trg_commissions_validate_transition
  BEFORE UPDATE OF status ON commissions
  FOR EACH ROW EXECUTE FUNCTION commissions_validate_transition();

-- ═══════════════════════════════════════════════
-- RLS
-- ═══════════════════════════════════════════════

ALTER TABLE commissions ENABLE ROW LEVEL SECURITY;

-- SELECT : buyer and artist
CREATE POLICY "commissions_select_participants" ON commissions
  FOR SELECT USING (
    auth.uid() = buyer_id OR auth.uid() = artist_id
  );

-- INSERT : only buyer can create (must match auth.uid())
CREATE POLICY "commissions_insert_buyer" ON commissions
  FOR INSERT WITH CHECK (
    auth.uid() = buyer_id
  );

-- UPDATE : participants (transitions enforced via trigger)
CREATE POLICY "commissions_update_participants" ON commissions
  FOR UPDATE USING (
    auth.uid() = buyer_id OR auth.uid() = artist_id
  );

-- ═══════════════════════════════════════════════
-- STORAGE — bucket `commissions` (reference images)
-- ═══════════════════════════════════════════════

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'commissions',
  'commissions',
  true,
  20971520,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic']
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "commissions_storage_select_public" ON storage.objects
  FOR SELECT USING (bucket_id = 'commissions');

CREATE POLICY "commissions_storage_insert_auth" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'commissions'
    AND auth.role() = 'authenticated'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "commissions_storage_update_own" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'commissions'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "commissions_storage_delete_own" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'commissions'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
