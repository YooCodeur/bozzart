-- ═══════════════════════════════════════════════
-- EXTENSIONS
-- ═══════════════════════════════════════════════

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- ═══════════════════════════════════════════════
-- ENUMS
-- ═══════════════════════════════════════════════

CREATE TYPE user_role AS ENUM ('artist', 'buyer', 'both', 'admin');
CREATE TYPE artwork_status AS ENUM ('draft', 'published', 'sold', 'reserved', 'archived');
CREATE TYPE artwork_medium AS ENUM (
  'painting', 'photography', 'illustration', 'digital',
  'sculpture', 'drawing', 'print', 'textile', 'video',
  'audio', 'performance', 'mixed', 'other'
);
CREATE TYPE post_type AS ENUM ('photo', 'video', 'audio', 'text', 'mixed');
CREATE TYPE reaction_type AS ENUM ('touched', 'want', 'how', 'share');
CREATE TYPE message_status AS ENUM ('sent', 'delivered', 'read');
CREATE TYPE transaction_status AS ENUM (
  'pending', 'processing', 'completed', 'failed', 'refunded'
);
CREATE TYPE notification_type AS ENUM (
  'sale', 'message', 'reaction', 'new_follower',
  'new_post', 'drop_starting', 'payout_sent'
);
CREATE TYPE certificate_type AS ENUM ('pdf', 'blockchain');
CREATE TYPE drop_status AS ENUM ('scheduled', 'active', 'ended');
