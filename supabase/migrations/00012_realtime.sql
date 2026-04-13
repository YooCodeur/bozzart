-- ═══════════════════════════════════════════════
-- SUPABASE REALTIME
-- Activer la replication pour les tables temps reel
-- ═══════════════════════════════════════════════

ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
