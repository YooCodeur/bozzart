-- ═══════════════════════════════════════════════
-- ROW LEVEL SECURITY — Activation
-- ═══════════════════════════════════════════════

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE artist_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE artworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE artwork_series ENABLE ROW LEVEL SECURITY;
ALTER TABLE carnet_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE buyer_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE discovery_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE drops ENABLE ROW LEVEL SECURITY;
ALTER TABLE drop_artworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE artist_analytics_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

-- ═══════════════════════════════════════════════
-- PROFILES
-- ═══════════════════════════════════════════════

CREATE POLICY "profiles_select_public" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "profiles_delete_own" ON profiles
  FOR DELETE USING (auth.uid() = id);

-- ═══════════════════════════════════════════════
-- ARTIST_PROFILES
-- ═══════════════════════════════════════════════

CREATE POLICY "artist_profiles_select_public" ON artist_profiles
  FOR SELECT USING (true);

CREATE POLICY "artist_profiles_insert_own" ON artist_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "artist_profiles_update_own" ON artist_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "artist_profiles_delete_own" ON artist_profiles
  FOR DELETE USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════════
-- ARTWORKS
-- ═══════════════════════════════════════════════

-- Lecture : published pour tous, drafts pour le proprietaire
CREATE POLICY "artworks_select" ON artworks
  FOR SELECT USING (
    status = 'published'
    OR status = 'sold'
    OR artist_id IN (SELECT id FROM artist_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "artworks_insert_own" ON artworks
  FOR INSERT WITH CHECK (
    artist_id IN (SELECT id FROM artist_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "artworks_update_own" ON artworks
  FOR UPDATE USING (
    artist_id IN (SELECT id FROM artist_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "artworks_delete_own" ON artworks
  FOR DELETE USING (
    artist_id IN (SELECT id FROM artist_profiles WHERE user_id = auth.uid())
  );

-- ═══════════════════════════════════════════════
-- ARTWORK_SERIES
-- ═══════════════════════════════════════════════

CREATE POLICY "series_select_public" ON artwork_series
  FOR SELECT USING (is_visible = true OR artist_id IN (
    SELECT id FROM artist_profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "series_insert_own" ON artwork_series
  FOR INSERT WITH CHECK (
    artist_id IN (SELECT id FROM artist_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "series_update_own" ON artwork_series
  FOR UPDATE USING (
    artist_id IN (SELECT id FROM artist_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "series_delete_own" ON artwork_series
  FOR DELETE USING (
    artist_id IN (SELECT id FROM artist_profiles WHERE user_id = auth.uid())
  );

-- ═══════════════════════════════════════════════
-- CARNET_POSTS
-- ═══════════════════════════════════════════════

CREATE POLICY "posts_select_public" ON carnet_posts
  FOR SELECT USING (true);

CREATE POLICY "posts_insert_own" ON carnet_posts
  FOR INSERT WITH CHECK (
    artist_id IN (SELECT id FROM artist_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "posts_update_own" ON carnet_posts
  FOR UPDATE USING (
    artist_id IN (SELECT id FROM artist_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "posts_delete_own" ON carnet_posts
  FOR DELETE USING (
    artist_id IN (SELECT id FROM artist_profiles WHERE user_id = auth.uid())
  );

-- ═══════════════════════════════════════════════
-- REACTIONS
-- ═══════════════════════════════════════════════

CREATE POLICY "reactions_select_public" ON reactions
  FOR SELECT USING (true);

CREATE POLICY "reactions_insert_own" ON reactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "reactions_update_own" ON reactions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "reactions_delete_own" ON reactions
  FOR DELETE USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════════
-- COMMENTS
-- ═══════════════════════════════════════════════

CREATE POLICY "comments_select_public" ON comments
  FOR SELECT USING (is_hidden = false);

CREATE POLICY "comments_insert_auth" ON comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "comments_update_own" ON comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "comments_delete_own" ON comments
  FOR DELETE USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════════
-- FOLLOWS
-- ═══════════════════════════════════════════════

CREATE POLICY "follows_select_public" ON follows
  FOR SELECT USING (true);

CREATE POLICY "follows_insert_own" ON follows
  FOR INSERT WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "follows_delete_own" ON follows
  FOR DELETE USING (auth.uid() = follower_id);

-- ═══════════════════════════════════════════════
-- WISHLISTS
-- ═══════════════════════════════════════════════

CREATE POLICY "wishlists_select_own" ON wishlists
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "wishlists_insert_own" ON wishlists
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "wishlists_delete_own" ON wishlists
  FOR DELETE USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════════
-- CONVERSATIONS
-- ═══════════════════════════════════════════════

CREATE POLICY "conversations_select_participant" ON conversations
  FOR SELECT USING (
    buyer_id = auth.uid()
    OR artist_id IN (SELECT id FROM artist_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "conversations_insert_buyer" ON conversations
  FOR INSERT WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "conversations_update_participant" ON conversations
  FOR UPDATE USING (
    buyer_id = auth.uid()
    OR artist_id IN (SELECT id FROM artist_profiles WHERE user_id = auth.uid())
  );

-- ═══════════════════════════════════════════════
-- MESSAGES
-- ═══════════════════════════════════════════════

CREATE POLICY "messages_select_participant" ON messages
  FOR SELECT USING (
    conversation_id IN (
      SELECT id FROM conversations
      WHERE buyer_id = auth.uid()
      OR artist_id IN (SELECT id FROM artist_profiles WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "messages_insert_participant" ON messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id
    AND conversation_id IN (
      SELECT id FROM conversations
      WHERE buyer_id = auth.uid()
      OR artist_id IN (SELECT id FROM artist_profiles WHERE user_id = auth.uid())
    )
  );

-- ═══════════════════════════════════════════════
-- TRANSACTIONS
-- ═══════════════════════════════════════════════

CREATE POLICY "transactions_select_participant" ON transactions
  FOR SELECT USING (
    buyer_id = auth.uid()
    OR artist_id IN (SELECT id FROM artist_profiles WHERE user_id = auth.uid())
  );

-- Insert/update via service_role uniquement (webhooks Stripe)

-- ═══════════════════════════════════════════════
-- BUYER_COLLECTIONS
-- ═══════════════════════════════════════════════

CREATE POLICY "collections_select_own" ON buyer_collections
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "collections_update_own" ON buyer_collections
  FOR UPDATE USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════════
-- DISCOVERY_SLOTS
-- ═══════════════════════════════════════════════

CREATE POLICY "discovery_select_public" ON discovery_slots
  FOR SELECT USING (is_active = true);

-- Insert/update/delete via admin uniquement

-- ═══════════════════════════════════════════════
-- DROPS
-- ═══════════════════════════════════════════════

CREATE POLICY "drops_select_public" ON drops
  FOR SELECT USING (status IN ('active', 'ended') OR
    artist_id IN (SELECT id FROM artist_profiles WHERE user_id = auth.uid()));

CREATE POLICY "drops_insert_own" ON drops
  FOR INSERT WITH CHECK (
    artist_id IN (SELECT id FROM artist_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "drops_update_own" ON drops
  FOR UPDATE USING (
    artist_id IN (SELECT id FROM artist_profiles WHERE user_id = auth.uid())
  );

-- ═══════════════════════════════════════════════
-- DROP_ARTWORKS
-- ═══════════════════════════════════════════════

CREATE POLICY "drop_artworks_select_public" ON drop_artworks
  FOR SELECT USING (true);

CREATE POLICY "drop_artworks_manage_own" ON drop_artworks
  FOR ALL USING (
    drop_id IN (SELECT id FROM drops WHERE artist_id IN (
      SELECT id FROM artist_profiles WHERE user_id = auth.uid()
    ))
  );

-- ═══════════════════════════════════════════════
-- NOTIFICATIONS
-- ═══════════════════════════════════════════════

CREATE POLICY "notifications_select_own" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "notifications_update_own" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════════
-- PUSH_TOKENS
-- ═══════════════════════════════════════════════

CREATE POLICY "push_tokens_select_own" ON push_tokens
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "push_tokens_insert_own" ON push_tokens
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "push_tokens_delete_own" ON push_tokens
  FOR DELETE USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════════
-- ARTIST_ANALYTICS_DAILY
-- ═══════════════════════════════════════════════

CREATE POLICY "analytics_select_own" ON artist_analytics_daily
  FOR SELECT USING (
    artist_id IN (SELECT id FROM artist_profiles WHERE user_id = auth.uid())
  );

-- ═══════════════════════════════════════════════
-- CERTIFICATES
-- ═══════════════════════════════════════════════

CREATE POLICY "certificates_select_participant" ON certificates
  FOR SELECT USING (
    transaction_id IN (
      SELECT id FROM transactions
      WHERE buyer_id = auth.uid()
      OR artist_id IN (SELECT id FROM artist_profiles WHERE user_id = auth.uid())
    )
  );
