-- FarmGuard AI - Database Migration 002: Row Level Security (RLS) & Multi-Tenant Data Isolation
-- Enforces server-verified transaction-local user identity via `app.user_id`

-- 1. Enable and Force RLS on all user-owned tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE users FORCE ROW LEVEL SECURITY;

ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions FORCE ROW LEVEL SECURITY;

ALTER TABLE farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE farms FORCE ROW LEVEL SECURITY;

ALTER TABLE fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE fields FORCE ROW LEVEL SECURITY;

ALTER TABLE soil_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE soil_readings FORCE ROW LEVEL SECURITY;

ALTER TABLE sensor_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE sensor_devices FORCE ROW LEVEL SECURITY;

ALTER TABLE disease_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE disease_assessments FORCE ROW LEVEL SECURITY;

ALTER TABLE weather_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE weather_snapshots FORCE ROW LEVEL SECURITY;

ALTER TABLE advisory_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE advisory_recommendations FORCE ROW LEVEL SECURITY;

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations FORCE ROW LEVEL SECURITY;

ALTER TABLE conversation_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_messages FORCE ROW LEVEL SECURITY;

ALTER TABLE alert_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_preferences FORCE ROW LEVEL SECURITY;

ALTER TABLE audit_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_events FORCE ROW LEVEL SECURITY;

ALTER TABLE crop_catalog ENABLE ROW LEVEL SECURITY;

-- 2. Define RLS Policies

-- Users: users can only view and update their own profile
DROP POLICY IF EXISTS users_isolation_policy ON users;
CREATE POLICY users_isolation_policy ON users
  USING (id = NULLIF(current_setting('app.user_id', true), '')::uuid)
  WITH CHECK (id = NULLIF(current_setting('app.user_id', true), '')::uuid);

-- Sessions: users can only manage their own sessions
DROP POLICY IF EXISTS sessions_isolation_policy ON sessions;
CREATE POLICY sessions_isolation_policy ON sessions
  USING (user_id = NULLIF(current_setting('app.user_id', true), '')::uuid)
  WITH CHECK (user_id = NULLIF(current_setting('app.user_id', true), '')::uuid);

-- Farms
DROP POLICY IF EXISTS farms_isolation_policy ON farms;
CREATE POLICY farms_isolation_policy ON farms
  USING (owner_id = NULLIF(current_setting('app.user_id', true), '')::uuid)
  WITH CHECK (owner_id = NULLIF(current_setting('app.user_id', true), '')::uuid);

-- Fields
DROP POLICY IF EXISTS fields_isolation_policy ON fields;
CREATE POLICY fields_isolation_policy ON fields
  USING (owner_id = NULLIF(current_setting('app.user_id', true), '')::uuid)
  WITH CHECK (owner_id = NULLIF(current_setting('app.user_id', true), '')::uuid);

-- Soil Readings
DROP POLICY IF EXISTS soil_readings_isolation_policy ON soil_readings;
CREATE POLICY soil_readings_isolation_policy ON soil_readings
  USING (owner_id = NULLIF(current_setting('app.user_id', true), '')::uuid)
  WITH CHECK (owner_id = NULLIF(current_setting('app.user_id', true), '')::uuid);

-- Sensor Devices
DROP POLICY IF EXISTS sensor_devices_isolation_policy ON sensor_devices;
CREATE POLICY sensor_devices_isolation_policy ON sensor_devices
  USING (owner_id = NULLIF(current_setting('app.user_id', true), '')::uuid)
  WITH CHECK (owner_id = NULLIF(current_setting('app.user_id', true), '')::uuid);

-- Disease Assessments
DROP POLICY IF EXISTS disease_assessments_isolation_policy ON disease_assessments;
CREATE POLICY disease_assessments_isolation_policy ON disease_assessments
  USING (owner_id = NULLIF(current_setting('app.user_id', true), '')::uuid)
  WITH CHECK (owner_id = NULLIF(current_setting('app.user_id', true), '')::uuid);

-- Weather Snapshots
DROP POLICY IF EXISTS weather_snapshots_isolation_policy ON weather_snapshots;
CREATE POLICY weather_snapshots_isolation_policy ON weather_snapshots
  USING (owner_id = NULLIF(current_setting('app.user_id', true), '')::uuid)
  WITH CHECK (owner_id = NULLIF(current_setting('app.user_id', true), '')::uuid);

-- Advisory Recommendations
DROP POLICY IF EXISTS recommendations_isolation_policy ON advisory_recommendations;
CREATE POLICY recommendations_isolation_policy ON advisory_recommendations
  USING (owner_id = NULLIF(current_setting('app.user_id', true), '')::uuid)
  WITH CHECK (owner_id = NULLIF(current_setting('app.user_id', true), '')::uuid);

-- Conversations
DROP POLICY IF EXISTS conversations_isolation_policy ON conversations;
CREATE POLICY conversations_isolation_policy ON conversations
  USING (owner_id = NULLIF(current_setting('app.user_id', true), '')::uuid)
  WITH CHECK (owner_id = NULLIF(current_setting('app.user_id', true), '')::uuid);

-- Conversation Messages
DROP POLICY IF EXISTS messages_isolation_policy ON conversation_messages;
CREATE POLICY messages_isolation_policy ON conversation_messages
  USING (owner_id = NULLIF(current_setting('app.user_id', true), '')::uuid)
  WITH CHECK (owner_id = NULLIF(current_setting('app.user_id', true), '')::uuid);

-- Alert Preferences
DROP POLICY IF EXISTS alert_preferences_isolation_policy ON alert_preferences;
CREATE POLICY alert_preferences_isolation_policy ON alert_preferences
  USING (owner_id = NULLIF(current_setting('app.user_id', true), '')::uuid)
  WITH CHECK (owner_id = NULLIF(current_setting('app.user_id', true), '')::uuid);

-- Audit Events
DROP POLICY IF EXISTS audit_events_isolation_policy ON audit_events;
CREATE POLICY audit_events_isolation_policy ON audit_events
  USING (owner_id = NULLIF(current_setting('app.user_id', true), '')::uuid)
  WITH CHECK (owner_id = NULLIF(current_setting('app.user_id', true), '')::uuid);

-- Crop Catalog: Read-only access for all authenticated or anonymous queries; mutations restricted
DROP POLICY IF EXISTS crop_catalog_read_policy ON crop_catalog;
CREATE POLICY crop_catalog_read_policy ON crop_catalog
  FOR SELECT
  USING (active = true);

-- 3. Narrowly Scoped Pre-Authentication Lookup Function
-- Securely verifies user credentials during login without requiring global bypass of RLS
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

-- Secure session lookup by refresh token hash
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

