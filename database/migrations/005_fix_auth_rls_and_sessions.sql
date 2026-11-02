-- FarmGuard AI - Database Migration 005: Fix Auth RLS, Session Creation & Pre-Auth Fallbacks
-- Ensures authentication and session generation work reliably without violating RLS policies.

-- 1. Ensure pgcrypto or native gen_random_uuid is available
DO $$ BEGIN
  CREATE EXTENSION IF NOT EXISTS pgcrypto;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- 2. Relax FORCE ROW LEVEL SECURITY on users and sessions for server administration
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE users NO FORCE ROW LEVEL SECURITY;

ALTER TABLE sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions NO FORCE ROW LEVEL SECURITY;

-- 3. Define robust non-blocking policies for users
DROP POLICY IF EXISTS users_isolation_policy ON users;
DROP POLICY IF EXISTS users_insert_policy ON users;
DROP POLICY IF EXISTS users_select_policy ON users;
DROP POLICY IF EXISTS users_update_policy ON users;

-- Allow new user registration
CREATE POLICY users_insert_policy ON users
  FOR INSERT WITH CHECK (true);

-- Allow reading own profile, or server administrative lookups
CREATE POLICY users_select_policy ON users
  FOR SELECT USING (
    id = NULLIF(current_setting('app.user_id', true), '')::uuid
    OR current_setting('app.user_id', true) IS NULL
    OR current_setting('app.user_id', true) = ''
  );

-- Users can only modify their own profile
CREATE POLICY users_update_policy ON users
  FOR UPDATE USING (id = NULLIF(current_setting('app.user_id', true), '')::uuid)
  WITH CHECK (id = NULLIF(current_setting('app.user_id', true), '')::uuid);

-- 4. Define robust non-blocking policies for sessions
DROP POLICY IF EXISTS sessions_isolation_policy ON sessions;
DROP POLICY IF EXISTS sessions_insert_policy ON sessions;
DROP POLICY IF EXISTS sessions_select_policy ON sessions;
DROP POLICY IF EXISTS sessions_update_policy ON sessions;
DROP POLICY IF EXISTS sessions_delete_policy ON sessions;

CREATE POLICY sessions_insert_policy ON sessions
  FOR INSERT WITH CHECK (true);

CREATE POLICY sessions_select_policy ON sessions
  FOR SELECT USING (
    user_id = NULLIF(current_setting('app.user_id', true), '')::uuid
    OR current_setting('app.user_id', true) IS NULL
    OR current_setting('app.user_id', true) = ''
  );

CREATE POLICY sessions_update_policy ON sessions
  FOR UPDATE USING (
    user_id = NULLIF(current_setting('app.user_id', true), '')::uuid
    OR current_setting('app.user_id', true) IS NULL
    OR current_setting('app.user_id', true) = ''
  );

CREATE POLICY sessions_delete_policy ON sessions
  FOR DELETE USING (
    user_id = NULLIF(current_setting('app.user_id', true), '')::uuid
    OR current_setting('app.user_id', true) IS NULL
    OR current_setting('app.user_id', true) = ''
  );

-- 5. Pre-authentication credential lookup function
CREATE OR REPLACE FUNCTION fn_lookup_user_for_auth(p_email TEXT)
RETURNS TABLE (
  id UUID,
  email TEXT,
  password_hash TEXT,
  display_name TEXT,
  preferred_language TEXT,
  disabled_at TIMESTAMPTZ
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT
    u.id,
    u.email,
    u.password_hash,
    u.display_name,
    u.preferred_language,
    u.disabled_at
  FROM users u
  WHERE lower(u.email) = lower(p_email)
  LIMIT 1;
END;
$$;

-- Pre-authentication session lookup by refresh token hash
CREATE OR REPLACE FUNCTION fn_lookup_session_by_token(p_token_hash TEXT)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  expires_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id,
    s.user_id,
    s.expires_at,
    s.revoked_at
  FROM sessions s
  WHERE s.refresh_token_hash = p_token_hash
  LIMIT 1;
END;
$$;
