CREATE OR REPLACE FUNCTION get_business_id()
RETURNS UUID AS $$
  WITH claims AS (
    SELECT NULLIF(current_setting('request.jwt.claims', true), '')::jsonb AS jwt
  )
  SELECT COALESCE(
    NULLIF((SELECT jwt ->> 'business_id' FROM claims), '')::UUID,
    (
      SELECT business_id
      FROM public.users
      WHERE id = auth.uid()
      LIMIT 1
    )
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;
