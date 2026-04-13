-- ═══════════════════════════════════════════════
-- PHASE 16 — SOCIAL ACTIVITIES
-- ═══════════════════════════════════════════════

CREATE TABLE social_activities (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN (
    'purchased_artwork',
    'followed_artist',
    'followed_collector',
    'reacted_to_post',
    'commented_on_post',
    'shared_artwork',
    'published_artwork',
    'published_post',
    'started_drop',
    'added_to_wishlist'
  )),
  target_id     UUID,
  target_type   TEXT CHECK (target_type IN ('artwork', 'post', 'user', 'drop')),
  metadata      JSONB DEFAULT '{}'::JSONB,
  is_public     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_social_activities_user ON social_activities(user_id, created_at DESC);
CREATE INDEX idx_social_activities_type ON social_activities(activity_type, created_at DESC);

-- ═══════════════════════════════════════════════
-- RLS
-- ═══════════════════════════════════════════════

ALTER TABLE social_activities ENABLE ROW LEVEL SECURITY;

-- Lecture publique quand is_public = true OU si l'utilisateur est l'auteur
CREATE POLICY social_activities_select_public
  ON social_activities FOR SELECT
  USING (is_public = TRUE OR user_id = auth.uid());

-- Pas de policy INSERT/UPDATE/DELETE pour les utilisateurs :
-- seules les triggers (SECURITY DEFINER) et le service_role peuvent ecrire.

-- ═══════════════════════════════════════════════
-- TRIGGER FUNCTIONS
-- ═══════════════════════════════════════════════

-- purchased_artwork : AFTER INSERT sur transactions quand status = 'completed'
CREATE OR REPLACE FUNCTION trg_social_activity_purchase()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'completed' AND NEW.buyer_id IS NOT NULL THEN
    INSERT INTO social_activities (user_id, activity_type, target_id, target_type, metadata)
    VALUES (
      NEW.buyer_id,
      'purchased_artwork',
      NEW.artwork_id,
      'artwork',
      jsonb_build_object(
        'transaction_id', NEW.id,
        'artist_id', NEW.artist_id,
        'amount', NEW.amount,
        'currency', NEW.currency
      )
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER social_activity_on_transaction
  AFTER INSERT ON transactions
  FOR EACH ROW EXECUTE FUNCTION trg_social_activity_purchase();

-- followed_artist / followed_collector : AFTER INSERT sur follows
-- NOTE : la table `follows` reference `artist_profiles` (colonne artist_id),
-- donc toutes les entrees sont des follows d'artistes => 'followed_artist'.
-- TODO: quand un systeme de follow collectionneur sera introduit, brancher ici.
CREATE OR REPLACE FUNCTION trg_social_activity_follow()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_target_user_id UUID;
  v_target_role    TEXT;
  v_activity_type  TEXT := 'followed_artist';
BEGIN
  -- artist_profiles.id == profiles.id (meme UUID de base) dans ce schema ;
  -- on essaye de recuperer le role du profil cible pour distinguer artiste/collector.
  SELECT p.id, p.role::TEXT
    INTO v_target_user_id, v_target_role
    FROM profiles p
   WHERE p.id = NEW.artist_id
   LIMIT 1;

  IF v_target_role = 'buyer' THEN
    v_activity_type := 'followed_collector';
  END IF;

  INSERT INTO social_activities (user_id, activity_type, target_id, target_type, metadata)
  VALUES (
    NEW.follower_id,
    v_activity_type,
    COALESCE(v_target_user_id, NEW.artist_id),
    'user',
    jsonb_build_object('artist_id', NEW.artist_id)
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER social_activity_on_follow
  AFTER INSERT ON follows
  FOR EACH ROW EXECUTE FUNCTION trg_social_activity_follow();

-- reacted_to_post : AFTER INSERT sur reactions
CREATE OR REPLACE FUNCTION trg_social_activity_reaction()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO social_activities (user_id, activity_type, target_id, target_type, metadata)
  VALUES (
    NEW.user_id,
    'reacted_to_post',
    NEW.post_id,
    'post',
    jsonb_build_object('reaction_type', NEW.type)
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER social_activity_on_reaction
  AFTER INSERT ON reactions
  FOR EACH ROW EXECUTE FUNCTION trg_social_activity_reaction();

-- published_artwork : AFTER INSERT sur artworks quand status = 'published'
-- NOTE: artworks.artist_id reference artist_profiles(id). On suppose que
-- artist_profiles.id == profiles.id (meme UUID). Sinon, TODO joindre pour obtenir profile.id.
CREATE OR REPLACE FUNCTION trg_social_activity_artwork_published()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'published' THEN
    INSERT INTO social_activities (user_id, activity_type, target_id, target_type, metadata)
    VALUES (
      NEW.artist_id,
      'published_artwork',
      NEW.id,
      'artwork',
      jsonb_build_object('title', NEW.title)
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER social_activity_on_artwork_insert
  AFTER INSERT ON artworks
  FOR EACH ROW EXECUTE FUNCTION trg_social_activity_artwork_published();

-- published_post : AFTER INSERT sur carnet_posts
-- NOTE: carnet_posts.artist_id reference artist_profiles(id). Meme hypothese que ci-dessus.
CREATE OR REPLACE FUNCTION trg_social_activity_post_published()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO social_activities (user_id, activity_type, target_id, target_type, metadata)
  VALUES (
    NEW.artist_id,
    'published_post',
    NEW.id,
    'post',
    jsonb_build_object('type', NEW.type)
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER social_activity_on_post_insert
  AFTER INSERT ON carnet_posts
  FOR EACH ROW EXECUTE FUNCTION trg_social_activity_post_published();

-- added_to_wishlist : AFTER INSERT sur wishlists
CREATE OR REPLACE FUNCTION trg_social_activity_wishlist()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO social_activities (user_id, activity_type, target_id, target_type, metadata, is_public)
  VALUES (
    NEW.user_id,
    'added_to_wishlist',
    NEW.artwork_id,
    'artwork',
    '{}'::JSONB,
    -- Par defaut une wishlist est plus discrete : on laisse public=true,
    -- le filtrage fin (is_collection_public) est applique cote requete de feed.
    TRUE
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER social_activity_on_wishlist_insert
  AFTER INSERT ON wishlists
  FOR EACH ROW EXECUTE FUNCTION trg_social_activity_wishlist();
