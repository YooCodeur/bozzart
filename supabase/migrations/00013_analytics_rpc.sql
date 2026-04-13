-- Fonction RPC pour incrementer un champ analytics de maniere atomique
CREATE OR REPLACE FUNCTION increment_analytics(row_id UUID, field_name TEXT)
RETURNS VOID AS $$
BEGIN
  EXECUTE format(
    'UPDATE artist_analytics_daily SET %I = %I + 1 WHERE id = $1',
    field_name, field_name
  ) USING row_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
