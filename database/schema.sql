-- FarmGuard AI - Database Migration 001: Initial Schema
-- Production PostgreSQL DDL with UUIDs, UTC Timestamps, and Constraints

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  password_hash TEXT,
  display_name TEXT NOT NULL,
  preferred_language TEXT NOT NULL DEFAULT 'en'
    CHECK (preferred_language IN ('en', 'te')),
  email_verified_at TIMESTAMPTZ,
  disabled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS users_email_lower_unique
  ON users (lower(email));

-- 2. Sessions
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  refresh_token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_used_at TIMESTAMPTZ,
  user_agent TEXT,
  ip_hash TEXT
);

CREATE INDEX IF NOT EXISTS sessions_user_active_idx
  ON sessions (user_id, expires_at)
  WHERE revoked_at IS NULL;

-- 3. Farms
CREATE TABLE IF NOT EXISTS farms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  country_code CHAR(2) NOT NULL DEFAULT 'IN',
  state TEXT,
  district TEXT,
  locality TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  location_source TEXT,
  timezone TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (latitude IS NULL OR latitude BETWEEN -90 AND 90),
  CHECK (longitude IS NULL OR longitude BETWEEN -180 AND 180)
);

CREATE INDEX IF NOT EXISTS farms_owner_updated_idx ON farms (owner_id, updated_at DESC);

-- 4. Fields
CREATE TABLE IF NOT EXISTS fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  area_value NUMERIC(12, 3),
  area_unit TEXT NOT NULL DEFAULT 'hectare',
  soil_type TEXT,
  current_crop_code TEXT,
  planting_date DATE,
  irrigation_type TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (area_value IS NULL OR area_value > 0),
  UNIQUE (id, owner_id)
);

CREATE INDEX IF NOT EXISTS fields_farm_owner_idx ON fields (farm_id, owner_id);

-- 5. Soil Readings
CREATE TABLE IF NOT EXISTS soil_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  field_id UUID NOT NULL REFERENCES fields(id) ON DELETE CASCADE,
  observed_at TIMESTAMPTZ NOT NULL,
  moisture_pct NUMERIC(5, 2),
  temperature_c NUMERIC(6, 2),
  ph NUMERIC(4, 2),
  nitrogen_value NUMERIC(10, 3),
  phosphorus_value NUMERIC(10, 3),
  potassium_value NUMERIC(10, 3),
  npk_unit TEXT,
  source TEXT NOT NULL CHECK (source IN ('manual', 'sensor', 'import')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (moisture_pct IS NULL OR moisture_pct BETWEEN 0 AND 100),
  CHECK (ph IS NULL OR ph BETWEEN 0 AND 14)
);

CREATE INDEX IF NOT EXISTS soil_readings_field_time_idx
  ON soil_readings (field_id, observed_at DESC);

CREATE INDEX IF NOT EXISTS soil_readings_owner_time_idx
  ON soil_readings (owner_id, observed_at DESC);

-- 6. Sensor Devices
CREATE TABLE IF NOT EXISTS sensor_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  field_id UUID NOT NULL REFERENCES fields(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  credential_hash TEXT NOT NULL UNIQUE,
  last_seen_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Crop Catalog
CREATE TABLE IF NOT EXISTS crop_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crop_code TEXT NOT NULL UNIQUE,
  names JSONB NOT NULL,
  season_tags TEXT[] NOT NULL DEFAULT '{}',
  climate_requirements JSONB NOT NULL DEFAULT '{}',
  soil_requirements JSONB NOT NULL DEFAULT '{}',
  irrigation_notes JSONB NOT NULL DEFAULT '{}',
  region_codes TEXT[] NOT NULL DEFAULT '{}',
  source_references JSONB NOT NULL,
  data_version TEXT NOT NULL,
  verified_at TIMESTAMPTZ,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (jsonb_typeof(names) = 'object'),
  CHECK (jsonb_typeof(source_references) = 'array')
);

-- 8. Disease Assessments
CREATE TABLE IF NOT EXISTS disease_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  field_id UUID REFERENCES fields(id) ON DELETE SET NULL,
  crop_code TEXT,
  storage_key TEXT NOT NULL,
  image_sha256 TEXT NOT NULL,
  predicted_class TEXT,
  confidence NUMERIC(6, 5),
  status TEXT NOT NULL CHECK (
    status IN ('completed', 'uncertain', 'unsupported', 'failed')
  ),
  class_probabilities JSONB NOT NULL DEFAULT '[]',
  next_steps JSONB NOT NULL DEFAULT '[]',
  model_version TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  CHECK (confidence IS NULL OR confidence BETWEEN 0 AND 1)
);

CREATE INDEX IF NOT EXISTS disease_assessments_owner_time_idx
  ON disease_assessments (owner_id, created_at DESC);

-- 9. Weather Snapshots
CREATE TABLE IF NOT EXISTS weather_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  forecast_start TIMESTAMPTZ NOT NULL,
  forecast_end TIMESTAMPTZ NOT NULL,
  forecast JSONB NOT NULL,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (forecast_end > forecast_start)
);

CREATE INDEX IF NOT EXISTS weather_snapshots_farm_fetched_idx
  ON weather_snapshots (farm_id, fetched_at DESC);

-- 10. Advisory Recommendations
CREATE TABLE IF NOT EXISTS advisory_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  field_id UUID REFERENCES fields(id) ON DELETE SET NULL,
  recommendation_type TEXT NOT NULL
    CHECK (recommendation_type IN ('crop', 'weather', 'irrigation', 'general')),
  input_snapshot JSONB NOT NULL,
  result JSONB NOT NULL,
  data_sources JSONB NOT NULL DEFAULT '[]',
  engine_version TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS recommendations_owner_time_idx
  ON advisory_recommendations (owner_id, created_at DESC);

-- 11. Conversations & Messages
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  farm_id UUID REFERENCES farms(id) ON DELETE SET NULL,
  field_id UUID REFERENCES fields(id) ON DELETE SET NULL,
  language TEXT NOT NULL CHECK (language IN ('en', 'te')),
  title TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS conversation_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  structured_advice JSONB,
  provider TEXT,
  model TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS conversation_messages_order_idx
  ON conversation_messages (conversation_id, created_at);

-- 12. Alert Preferences
CREATE TABLE IF NOT EXISTS alert_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  enabled BOOLEAN NOT NULL DEFAULT true,
  channels JSONB NOT NULL DEFAULT '{"in_app": true}',
  thresholds JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (owner_id, farm_id)
);

-- 13. Audit Events
CREATE TABLE IF NOT EXISTS audit_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS audit_events_owner_time_idx
  ON audit_events (owner_id, created_at DESC);

-- Helper trigger for automatic updated_at timestamp updating
CREATE OR REPLACE FUNCTION set_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION set_updated_at_column();

DROP TRIGGER IF EXISTS trg_farms_updated_at ON farms;
CREATE TRIGGER trg_farms_updated_at BEFORE UPDATE ON farms FOR EACH ROW EXECUTE FUNCTION set_updated_at_column();

DROP TRIGGER IF EXISTS trg_fields_updated_at ON fields;
CREATE TRIGGER trg_fields_updated_at BEFORE UPDATE ON fields FOR EACH ROW EXECUTE FUNCTION set_updated_at_column();

DROP TRIGGER IF EXISTS trg_crop_catalog_updated_at ON crop_catalog;
CREATE TRIGGER trg_crop_catalog_updated_at BEFORE UPDATE ON crop_catalog FOR EACH ROW EXECUTE FUNCTION set_updated_at_column();

DROP TRIGGER IF EXISTS trg_conversations_updated_at ON conversations;
CREATE TRIGGER trg_conversations_updated_at BEFORE UPDATE ON conversations FOR EACH ROW EXECUTE FUNCTION set_updated_at_column();

DROP TRIGGER IF EXISTS trg_alert_preferences_updated_at ON alert_preferences;
CREATE TRIGGER trg_alert_preferences_updated_at BEFORE UPDATE ON alert_preferences FOR EACH ROW EXECUTE FUNCTION set_updated_at_column();

-- Foreign ownership consistency trigger: ensures field.owner_id matches farm.owner_id
CREATE OR REPLACE FUNCTION check_field_farm_ownership()
RETURNS TRIGGER AS $$
DECLARE
  v_farm_owner UUID;
BEGIN
  SELECT owner_id INTO v_farm_owner FROM farms WHERE id = NEW.farm_id;
  IF v_farm_owner IS NULL OR v_farm_owner <> NEW.owner_id THEN
    RAISE EXCEPTION 'Field owner (%) does not match farm owner (%)', NEW.owner_id, v_farm_owner;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_check_field_farm_ownership ON fields;
CREATE TRIGGER trg_check_field_farm_ownership BEFORE INSERT OR UPDATE ON fields FOR EACH ROW EXECUTE FUNCTION check_field_farm_ownership();

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

