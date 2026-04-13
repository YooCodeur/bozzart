-- ═══════════════════════════════════════════════
-- TRIGGER : notification nouveau message
-- ═══════════════════════════════════════════════

CREATE OR REPLACE FUNCTION notify_new_message()
RETURNS TRIGGER AS $$
DECLARE
  conv conversations%ROWTYPE;
  recipient_user_id UUID;
BEGIN
  SELECT * INTO conv FROM conversations WHERE id = NEW.conversation_id;

  -- Determiner le destinataire (l'autre participant)
  IF NEW.sender_id = conv.buyer_id THEN
    -- L'acheteur envoie → notifier l'artiste
    SELECT user_id INTO recipient_user_id FROM artist_profiles WHERE id = conv.artist_id;
  ELSE
    -- L'artiste envoie → notifier l'acheteur
    recipient_user_id := conv.buyer_id;
  END IF;

  IF recipient_user_id IS NOT NULL THEN
    INSERT INTO notifications (user_id, type, title, body, data, deep_link)
    VALUES (
      recipient_user_id,
      'message',
      'Nouveau message',
      LEFT(NEW.body, 100),
      jsonb_build_object('conversationId', NEW.conversation_id),
      '/dashboard/messages/' || NEW.conversation_id
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_notify_new_message
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION notify_new_message();

-- ═══════════════════════════════════════════════
-- TRIGGER : notification nouveau follower
-- ═══════════════════════════════════════════════

CREATE OR REPLACE FUNCTION notify_new_follower()
RETURNS TRIGGER AS $$
DECLARE
  artist_user_id UUID;
  follower_name TEXT;
BEGIN
  SELECT user_id INTO artist_user_id FROM artist_profiles WHERE id = NEW.artist_id;
  SELECT display_name INTO follower_name FROM profiles WHERE id = NEW.follower_id;

  IF artist_user_id IS NOT NULL THEN
    INSERT INTO notifications (user_id, type, title, body, data, deep_link)
    VALUES (
      artist_user_id,
      'new_follower',
      'Nouvel abonne',
      follower_name || ' vous suit maintenant',
      jsonb_build_object('followerId', NEW.follower_id),
      '/dashboard/analytics'
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_notify_new_follower
  AFTER INSERT ON follows
  FOR EACH ROW EXECUTE FUNCTION notify_new_follower();

-- ═══════════════════════════════════════════════
-- TRIGGER : notification nouveau post (pour les followers)
-- ═══════════════════════════════════════════════

CREATE OR REPLACE FUNCTION notify_new_post()
RETURNS TRIGGER AS $$
DECLARE
  artist_name TEXT;
  follower RECORD;
BEGIN
  SELECT full_name INTO artist_name FROM artist_profiles WHERE id = NEW.artist_id;

  FOR follower IN
    SELECT follower_id FROM follows WHERE artist_id = NEW.artist_id
  LOOP
    INSERT INTO notifications (user_id, type, title, body, data, deep_link)
    VALUES (
      follower.follower_id,
      'new_post',
      'Nouveau post de ' || artist_name,
      LEFT(COALESCE(NEW.caption, 'Nouveau contenu'), 100),
      jsonb_build_object('postId', NEW.id, 'artistId', NEW.artist_id),
      NULL
    );
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_notify_new_post
  AFTER INSERT ON carnet_posts
  FOR EACH ROW EXECUTE FUNCTION notify_new_post();
