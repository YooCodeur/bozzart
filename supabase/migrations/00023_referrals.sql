-- Phase 21 — Virality & Organic Growth: Referral program
-- Adds referrals table, referral_code on profiles, auto-generation trigger, RLS

-- ─── referral_code on profiles ────────────────────────────────────────
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;

-- Function to generate a short unique referral code (format: BOZZ-XXXX)
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  new_code TEXT;
  attempt INTEGER := 0;
BEGIN
  LOOP
    new_code := 'BOZZ-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 6));
    PERFORM 1 FROM profiles WHERE referral_code = new_code;
    IF NOT FOUND THEN
      RETURN new_code;
    END IF;
    attempt := attempt + 1;
    IF attempt > 10 THEN
      RAISE EXCEPTION 'Could not generate unique referral code';
    END IF;
  END LOOP;
END;
$$;

-- Trigger to auto-populate referral_code on insert
CREATE OR REPLACE FUNCTION set_referral_code_on_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.referral_code IS NULL THEN
    NEW.referral_code := generate_referral_code();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_referral_code ON profiles;
CREATE TRIGGER trg_set_referral_code
  BEFORE INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION set_referral_code_on_profile();

-- Backfill existing profiles
UPDATE profiles
  SET referral_code = generate_referral_code()
  WHERE referral_code IS NULL;

-- ─── referrals table ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS referrals (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  referred_email   TEXT,
  referred_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  code             TEXT NOT NULL UNIQUE,
  status           TEXT NOT NULL DEFAULT 'pending'
                     CHECK (status IN ('pending', 'signed_up', 'first_sale')),
  reward_cents     INTEGER NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  converted_at     TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_referrals_code ON referrals(code);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_status ON referrals(referrer_id, status);

-- ─── RLS ──────────────────────────────────────────────────────────────
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- Referrer can SELECT their own rows
DROP POLICY IF EXISTS referrals_select_own ON referrals;
CREATE POLICY referrals_select_own ON referrals
  FOR SELECT
  USING (auth.uid() = referrer_id);

-- No INSERT/UPDATE/DELETE policies for authenticated users
-- => INSERT goes via service_role or SECURITY DEFINER functions only
