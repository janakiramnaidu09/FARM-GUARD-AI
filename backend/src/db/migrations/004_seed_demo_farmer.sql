-- FarmGuard AI - Database Migration 004: Seed Demo Farmer & Initial Farm Data
-- Seeds demo farmer Ramesh Reddy (farmer@farmguard.ai / FarmGuard123!) for immediate exploration

INSERT INTO users (id, email, password_hash, display_name, preferred_language, email_verified_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'farmer@farmguard.ai',
  '$2a$10$FIC0UiUNeFGoLfrr0bGW2OPVvvu8RCzuFj1HGlTE0Oc8x.iUQaDOa',
  'Ramesh Reddy (రమేష్ రెడ్డి)',
  'te',
  now()
)
ON CONFLICT (lower(email)) DO NOTHING;

-- Seed Farm
INSERT INTO farms (id, owner_id, name, country_code, state, district, locality, latitude, longitude, location_source, timezone, notes)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  '00000000-0000-0000-0000-000000000001',
  'Sri Venkateswara Farm (శ్రీ వెంకటేశ్వర క్షేత్రం)',
  'IN',
  'Telangana',
  'Siddipet',
  'Gajwel',
  17.8524,
  78.6833,
  'manual',
  'Asia/Kolkata',
  'Main agricultural holding with canal and borewell irrigation.'
)
ON CONFLICT (id) DO NOTHING;

-- Seed Fields
INSERT INTO fields (id, owner_id, farm_id, name, area_value, area_unit, soil_type, current_crop_code, planting_date, irrigation_type, notes)
VALUES (
  '22222222-2222-2222-2222-222222222221',
  '00000000-0000-0000-0000-000000000001',
  '11111111-1111-1111-1111-111111111111',
  'North Wet Field (వరి చేను - ఉత్తర మడి)',
  2.5,
  'acre',
  'Clayey alluvial loam',
  'rice',
  '2024-07-10',
  'Canal flood & tube well',
  'High water holding capacity, optimal for wet paddy.'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO fields (id, owner_id, farm_id, name, area_value, area_unit, soil_type, current_crop_code, planting_date, irrigation_type, notes)
VALUES (
  '22222222-2222-2222-2222-222222222222',
  '00000000-0000-0000-0000-000000000001',
  '11111111-1111-1111-1111-111111111111',
  'South Dry Patch (పత్తి చేను - దక్షిణ చేను)',
  4.0,
  'acre',
  'Deep black cotton soil',
  'cotton',
  '2024-06-25',
  'Drip system',
  'High drainage capability required.'
)
ON CONFLICT (id) DO NOTHING;

-- Seed Initial Soil Reading
INSERT INTO soil_readings (id, owner_id, field_id, observed_at, moisture_pct, temperature_c, ph, nitrogen_value, phosphorus_value, potassium_value, npk_unit, source, notes)
VALUES (
  '33333333-3333-3333-3333-333333333331',
  '00000000-0000-0000-0000-000000000001',
  '22222222-2222-2222-2222-222222222221',
  now() - interval '2 days',
  62.5,
  27.2,
  6.8,
  140.0,
  22.5,
  180.0,
  'kg_per_ha',
  'manual',
  'Post-transplanting baseline soil observation.'
)
ON CONFLICT (id) DO NOTHING;

-- Seed Alert Preferences
INSERT INTO alert_preferences (id, owner_id, farm_id, enabled, channels, thresholds)
VALUES (
  '44444444-4444-4444-4444-444444444441',
  '00000000-0000-0000-0000-000000000001',
  '11111111-1111-1111-1111-111111111111',
  true,
  '{"in_app": true, "sms": false, "email": false}'::jsonb,
  '{"heavyRainMm": 25, "extremeHeatC": 38, "frostC": 4, "highWindKmh": 35}'::jsonb
)
ON CONFLICT (owner_id, farm_id) DO NOTHING;

