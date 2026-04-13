-- ═══════════════════════════════════════════════
-- TRIGGER : updated_at automatique
-- ═══════════════════════════════════════════════

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_profiles_updated_at
  BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_artist_profiles_updated_at
  BEFORE UPDATE ON artist_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_artworks_updated_at
  BEFORE UPDATE ON artworks FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_carnet_posts_updated_at
  BEFORE UPDATE ON carnet_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_comments_updated_at
  BEFORE UPDATE ON comments FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ═══════════════════════════════════════════════
-- TRIGGER : wishlist_count sur artworks
-- ═══════════════════════════════════════════════

CREATE OR REPLACE FUNCTION update_wishlist_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE artworks SET wishlist_count = wishlist_count + 1 WHERE id = NEW.artwork_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE artworks SET wishlist_count = wishlist_count - 1 WHERE id = OLD.artwork_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_wishlist_count
  AFTER INSERT OR DELETE ON wishlists
  FOR EACH ROW EXECUTE FUNCTION update_wishlist_count();

-- ═══════════════════════════════════════════════
-- TRIGGER : follower_count sur artist_profiles
-- ═══════════════════════════════════════════════

CREATE OR REPLACE FUNCTION update_follower_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE artist_profiles SET follower_count = follower_count + 1 WHERE id = NEW.artist_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE artist_profiles SET follower_count = follower_count - 1 WHERE id = OLD.artist_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_follower_count
  AFTER INSERT OR DELETE ON follows
  FOR EACH ROW EXECUTE FUNCTION update_follower_count();

-- ═══════════════════════════════════════════════
-- TRIGGER : artwork_count sur artist_profiles
-- ═══════════════════════════════════════════════

CREATE OR REPLACE FUNCTION update_artwork_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'published' THEN
    UPDATE artist_profiles SET artwork_count = artwork_count + 1 WHERE id = NEW.artist_id;
  ELSIF TG_OP = 'DELETE' AND OLD.status = 'published' THEN
    UPDATE artist_profiles SET artwork_count = artwork_count - 1 WHERE id = OLD.artist_id;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status != 'published' AND NEW.status = 'published' THEN
      UPDATE artist_profiles SET artwork_count = artwork_count + 1 WHERE id = NEW.artist_id;
    ELSIF OLD.status = 'published' AND NEW.status != 'published' THEN
      UPDATE artist_profiles SET artwork_count = artwork_count - 1 WHERE id = NEW.artist_id;
    END IF;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_artwork_count
  AFTER INSERT OR UPDATE OR DELETE ON artworks
  FOR EACH ROW EXECUTE FUNCTION update_artwork_count();

-- ═══════════════════════════════════════════════
-- TRIGGER : reaction_counts sur carnet_posts
-- ═══════════════════════════════════════════════

CREATE OR REPLACE FUNCTION update_reaction_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE carnet_posts SET reaction_counts = jsonb_set(
      reaction_counts,
      ARRAY[NEW.type::text],
      to_jsonb(COALESCE((reaction_counts->>NEW.type::text)::int, 0) + 1)
    ) WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE carnet_posts SET reaction_counts = jsonb_set(
      reaction_counts,
      ARRAY[OLD.type::text],
      to_jsonb(GREATEST(COALESCE((reaction_counts->>OLD.type::text)::int, 0) - 1, 0))
    ) WHERE id = OLD.post_id;
  ELSIF TG_OP = 'UPDATE' AND OLD.type != NEW.type THEN
    -- Decrement ancien type
    UPDATE carnet_posts SET reaction_counts = jsonb_set(
      reaction_counts,
      ARRAY[OLD.type::text],
      to_jsonb(GREATEST(COALESCE((reaction_counts->>OLD.type::text)::int, 0) - 1, 0))
    ) WHERE id = OLD.post_id;
    -- Increment nouveau type
    UPDATE carnet_posts SET reaction_counts = jsonb_set(
      reaction_counts,
      ARRAY[NEW.type::text],
      to_jsonb(COALESCE((reaction_counts->>NEW.type::text)::int, 0) + 1)
    ) WHERE id = NEW.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_reaction_counts
  AFTER INSERT OR UPDATE OR DELETE ON reactions
  FOR EACH ROW EXECUTE FUNCTION update_reaction_counts();

-- ═══════════════════════════════════════════════
-- TRIGGER : comment_count sur carnet_posts
-- ═══════════════════════════════════════════════

CREATE OR REPLACE FUNCTION update_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE carnet_posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE carnet_posts SET comment_count = comment_count - 1 WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_comment_count
  AFTER INSERT OR DELETE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_comment_count();

-- ═══════════════════════════════════════════════
-- TRIGGER : conversation last_message_at + unread counts
-- ═══════════════════════════════════════════════

CREATE OR REPLACE FUNCTION update_conversation_on_message()
RETURNS TRIGGER AS $$
DECLARE
  conv conversations%ROWTYPE;
BEGIN
  SELECT * INTO conv FROM conversations WHERE id = NEW.conversation_id;
  UPDATE conversations SET
    last_message_at = NEW.created_at,
    artist_unread = CASE
      WHEN NEW.sender_id = conv.buyer_id THEN artist_unread + 1
      ELSE artist_unread
    END,
    buyer_unread = CASE
      WHEN NEW.sender_id != conv.buyer_id THEN buyer_unread + 1
      ELSE buyer_unread
    END
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_conversation_message
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION update_conversation_on_message();

-- ═══════════════════════════════════════════════
-- TRIGGER : creer un profil automatiquement a l'inscription
-- ═══════════════════════════════════════════════

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user-' || LEFT(NEW.id::text, 8)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', 'Nouvel utilisateur'),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'buyer')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
