CREATE OR REPLACE FUNCTION get_business_id()
RETURNS UUID AS $$
  SELECT NULLIF(
    current_setting('request.jwt.claims', true)::jsonb ->> 'business_id',
    ''
  )::UUID;
$$ LANGUAGE sql STABLE;
