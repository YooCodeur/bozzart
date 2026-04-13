-- ═══════════════════════════════════════════════
-- 00019 — push_tokens platform column normalization
-- Phase 12.2 — Multi-platform push (web VAPID + Expo mobile)
-- ═══════════════════════════════════════════════

-- The `platform` column already exists from 00008 as TEXT NOT NULL (free-form).
-- Here we:
--   1. Relax NOT NULL so newly-inserted rows without an explicit platform are allowed
--      (legacy rows / in-flight migrations). TODO: backfill existing rows to 'ios' or
--      'android' based on Expo token prefix (`ExponentPushToken[...]`) then re-apply
--      NOT NULL in a later migration.
--   2. Constrain accepted values to ('web', 'ios', 'android').
--   3. Add a composite index on (user_id, platform) for fan-out send queries.
--
-- Uniqueness remains on (user_id, token) so a single user may register multiple
-- tokens (e.g. a web browser + an iOS device + an Android device simultaneously).
-- There is intentionally NO UNIQUE constraint on (user_id) alone.

ALTER TABLE push_tokens
  ALTER COLUMN platform DROP NOT NULL;

-- Drop any prior check constraint on platform if one was added by a prior attempt.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'push_tokens_platform_check'
      AND conrelid = 'push_tokens'::regclass
  ) THEN
    ALTER TABLE push_tokens DROP CONSTRAINT push_tokens_platform_check;
  END IF;
END $$;

ALTER TABLE push_tokens
  ADD CONSTRAINT push_tokens_platform_check
  CHECK (platform IS NULL OR platform IN ('web', 'ios', 'android'));

-- TODO: backfill existing rows — attempt to infer platform:
--   UPDATE push_tokens SET platform = 'ios'
--     WHERE platform IS NULL AND token LIKE 'ExponentPushToken[%';
-- Run manually once tokens are audited.

CREATE INDEX IF NOT EXISTS push_tokens_user_platform_idx
  ON push_tokens (user_id, platform)
  WHERE is_active = TRUE;
