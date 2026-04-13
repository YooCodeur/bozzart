-- ═══════════════════════════════════════════════
-- PHASE 20 — PRINT-ON-DEMAND
-- ═══════════════════════════════════════════════

-- ─── print_products ───
CREATE TABLE IF NOT EXISTS print_products (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artwork_id          UUID NOT NULL REFERENCES artworks(id) ON DELETE CASCADE,
  format              TEXT NOT NULL, -- A3, A2, A1, canvas, poster, ...
  base_price_cents    INTEGER NOT NULL CHECK (base_price_cents >= 0),
  artist_margin_cents INTEGER NOT NULL DEFAULT 0 CHECK (artist_margin_cents >= 0),
  retail_price_cents  INTEGER GENERATED ALWAYS AS (base_price_cents + artist_margin_cents) STORED,
  is_enabled          BOOLEAN NOT NULL DEFAULT false,
  external_product_id TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT print_products_artwork_format_unique UNIQUE (artwork_id, format)
);

CREATE INDEX IF NOT EXISTS idx_print_products_artwork_enabled
  ON print_products(artwork_id, is_enabled);

-- ─── print_orders ───
CREATE TABLE IF NOT EXISTS print_orders (
  id                        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_id                  UUID NOT NULL REFERENCES profiles(id) ON DELETE SET NULL,
  print_product_id          UUID NOT NULL REFERENCES print_products(id),
  quantity                  INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  shipping_address          JSONB NOT NULL,
  stripe_payment_intent_id  TEXT,
  status                    TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'paid', 'printing', 'shipped', 'delivered', 'canceled'
  )),
  tracking_number           TEXT,
  carrier                   TEXT,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_print_orders_buyer_created
  ON print_orders(buyer_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_print_orders_status_created
  ON print_orders(status, created_at);

-- updated_at trigger
CREATE OR REPLACE FUNCTION set_print_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_print_orders_updated_at ON print_orders;
CREATE TRIGGER trg_print_orders_updated_at
  BEFORE UPDATE ON print_orders
  FOR EACH ROW EXECUTE FUNCTION set_print_orders_updated_at();

-- ═══════════════════════════════════════════════
-- RLS
-- ═══════════════════════════════════════════════

ALTER TABLE print_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE print_orders ENABLE ROW LEVEL SECURITY;

-- print_products: lecture publique si is_enabled ; CRUD artiste proprietaire
CREATE POLICY "print_products_select_public" ON print_products
  FOR SELECT USING (
    is_enabled = true
    OR artwork_id IN (
      SELECT a.id FROM artworks a
      JOIN artist_profiles ap ON ap.id = a.artist_id
      WHERE ap.user_id = auth.uid()
    )
  );

CREATE POLICY "print_products_insert_own" ON print_products
  FOR INSERT WITH CHECK (
    artwork_id IN (
      SELECT a.id FROM artworks a
      JOIN artist_profiles ap ON ap.id = a.artist_id
      WHERE ap.user_id = auth.uid()
    )
  );

CREATE POLICY "print_products_update_own" ON print_products
  FOR UPDATE USING (
    artwork_id IN (
      SELECT a.id FROM artworks a
      JOIN artist_profiles ap ON ap.id = a.artist_id
      WHERE ap.user_id = auth.uid()
    )
  );

CREATE POLICY "print_products_delete_own" ON print_products
  FOR DELETE USING (
    artwork_id IN (
      SELECT a.id FROM artworks a
      JOIN artist_profiles ap ON ap.id = a.artist_id
      WHERE ap.user_id = auth.uid()
    )
  );

-- print_orders: buyer voit ses commandes ; artiste voit ventes de ses oeuvres
CREATE POLICY "print_orders_select_buyer" ON print_orders
  FOR SELECT USING (buyer_id = auth.uid());

CREATE POLICY "print_orders_select_artist" ON print_orders
  FOR SELECT USING (
    print_product_id IN (
      SELECT pp.id FROM print_products pp
      JOIN artworks a ON a.id = pp.artwork_id
      JOIN artist_profiles ap ON ap.id = a.artist_id
      WHERE ap.user_id = auth.uid()
    )
  );

CREATE POLICY "print_orders_insert_self" ON print_orders
  FOR INSERT WITH CHECK (buyer_id = auth.uid());
