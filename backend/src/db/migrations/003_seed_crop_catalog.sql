-- FarmGuard AI - Database Migration 003: Seed Indian Agronomic Crop Catalog
-- Attributable agricultural data verified against ICAR, PJTSAU, ANGRAU, and FAO agronomy manuals

INSERT INTO crop_catalog (
  crop_code,
  names,
  season_tags,
  climate_requirements,
  soil_requirements,
  irrigation_notes,
  region_codes,
  source_references,
  data_version,
  verified_at,
  active
) VALUES
(
  'rice',
  '{
    "en": "Rice (Paddy)",
    "te": "వరి (వరి ధాన్యం)",
    "botanical": "Oryza sativa"
  }'::jsonb,
  ARRAY['kharif', 'rabi'],
  '{
    "tempMinC": 20.0,
    "tempMaxC": 38.0,
    "optimalTempMinC": 24.0,
    "optimalTempMaxC": 32.0,
    "rainfallMinMm": 1000.0,
    "rainfallMaxMm": 2500.0
  }'::jsonb,
  '{
    "phMin": 5.0,
    "phMax": 8.0,
    "optimalPhMin": 6.0,
    "optimalPhMax": 7.0,
    "preferredSoilTypes": ["Clay loam", "Silty clay", "Alluvial", "Heavy black soil"],
    "nitrogenNeed": "high",
    "phosphorusNeed": "medium",
    "potassiumNeed": "medium",
    "drainageRequirement": "Poor to moderate drainage required to retain water; impervious subsoil is beneficial"
  }'::jsonb,
  '{
    "criticalStages": "Panicle initiation, flowering, milk stage",
    "method": "Continuous shallow ponding (2-5 cm) or Alternate Wetting and Drying (AWD)"
  }'::jsonb,
  ARRAY['IN-TG', 'IN-AP', 'IN-TN', 'IN-KA', 'IN-WB', 'IN-PB'],
  '[
    {
      "id": "ICAR-AGRI-2020-RICE",
      "title": "Handbook of Agriculture: Facts and Figures for Farmers, Students and All Interested on Farming",
      "publisher": "Indian Council of Agricultural Research (ICAR), New Delhi",
      "year": 2020
    },
    {
      "id": "PJTSAU-VYAVASAYA-2023",
      "title": "Vyavasaya Panchangam - Package of Practices for Field Crops",
      "publisher": "Professor Jayashankar Telangana State Agricultural University, Hyderabad",
      "year": 2023
    }
  ]'::jsonb,
  '2024.1',
  '2024-06-01T00:00:00Z',
  true
),
(
  'cotton',
  '{
    "en": "Cotton",
    "te": "పత్తి",
    "botanical": "Gossypium hirsutum"
  }'::jsonb,
  ARRAY['kharif'],
  '{
    "tempMinC": 18.0,
    "tempMaxC": 40.0,
    "optimalTempMinC": 25.0,
    "optimalTempMaxC": 35.0,
    "rainfallMinMm": 500.0,
    "rainfallMaxMm": 1000.0
  }'::jsonb,
  '{
    "phMin": 6.0,
    "phMax": 8.5,
    "optimalPhMin": 6.5,
    "optimalPhMax": 7.8,
    "preferredSoilTypes": ["Deep black cotton soil (Vertisols)", "Well-drained red loam"],
    "nitrogenNeed": "high",
    "phosphorusNeed": "medium",
    "potassiumNeed": "high",
    "drainageRequirement": "Excellent drainage mandatory; highly sensitive to waterlogging"
  }'::jsonb,
  '{
    "criticalStages": "Square formation, flowering, and boll development",
    "method": "Furrow or drip irrigation; avoid flooding close to harvest"
  }'::jsonb,
  ARRAY['IN-TG', 'IN-AP', 'IN-MH', 'IN-GJ', 'IN-KA'],
  '[
    {
      "id": "CICR-NAGPUR-2022",
      "title": "Cotton Production Technology & Integrated Pest Management",
      "publisher": "ICAR - Central Institute for Cotton Research (CICR), Nagpur",
      "year": 2022
    },
    {
      "id": "PJTSAU-COTTON-2023",
      "title": "Commercial Cotton Advisory and High Density Planting Systems",
      "publisher": "PJTSAU Research Directorate",
      "year": 2023
    }
  ]'::jsonb,
  '2024.1',
  '2024-06-01T00:00:00Z',
  true
),
(
  'maize',
  '{
    "en": "Maize (Corn)",
    "te": "మొక్కజొన్న",
    "botanical": "Zea mays"
  }'::jsonb,
  ARRAY['kharif', 'rabi', 'zaid'],
  '{
    "tempMinC": 15.0,
    "tempMaxC": 38.0,
    "optimalTempMinC": 21.0,
    "optimalTempMaxC": 30.0,
    "rainfallMinMm": 500.0,
    "rainfallMaxMm": 800.0
  }'::jsonb,
  '{
    "phMin": 5.5,
    "phMax": 8.0,
    "optimalPhMin": 6.0,
    "optimalPhMax": 7.5,
    "preferredSoilTypes": ["Sandy loam", "Loam", "Deep fertile alluvial soil"],
    "nitrogenNeed": "high",
    "phosphorusNeed": "medium",
    "potassiumNeed": "medium",
    "drainageRequirement": "Well-drained; seedling cannot withstand water stagnation for even 24 hours"
  }'::jsonb,
  '{
    "criticalStages": "Tasseling, silking, grain filling",
    "method": "Ridge and furrow or sprinkler"
  }'::jsonb,
  ARRAY['IN-TG', 'IN-AP', 'IN-KA', 'IN-BR', 'IN-MP'],
  '[
    {
      "id": "IIMR-LUDHIANA-2021",
      "title": "Maize Production Technologies in India",
      "publisher": "ICAR - Indian Institute of Maize Research, Ludhiana",
      "year": 2021
    }
  ]'::jsonb,
  '2024.1',
  '2024-06-01T00:00:00Z',
  true
),
(
  'groundnut',
  '{
    "en": "Groundnut (Peanut)",
    "te": "వేరుశనగ",
    "botanical": "Arachis hypogaea"
  }'::jsonb,
  ARRAY['kharif', 'rabi'],
  '{
    "tempMinC": 20.0,
    "tempMaxC": 35.0,
    "optimalTempMinC": 24.0,
    "optimalTempMaxC": 30.0,
    "rainfallMinMm": 450.0,
    "rainfallMaxMm": 700.0
  }'::jsonb,
  '{
    "phMin": 5.5,
    "phMax": 7.5,
    "optimalPhMin": 6.0,
    "optimalPhMax": 7.0,
    "preferredSoilTypes": ["Sandy loam", "Light red sandy soil (Chalka)", "Loamy sand"],
    "nitrogenNeed": "low",
    "phosphorusNeed": "medium",
    "potassiumNeed": "medium",
    "drainageRequirement": "Light loose texture essential for easy peg penetration and pod development"
  }'::jsonb,
  '{
    "criticalStages": "Flowering, pegging, pod development",
    "method": "Sprinkler or light furrow irrigation"
  }'::jsonb,
  ARRAY['IN-AP', 'IN-TG', 'IN-GJ', 'IN-TN', 'IN-KA'],
  '[
    {
      "id": "DGR-JUNAGADH-2022",
      "title": "Groundnut Cultivation Guidelines and Gypsum Management",
      "publisher": "ICAR - Directorate of Groundnut Research, Junagadh",
      "year": 2022
    }
  ]'::jsonb,
  '2024.1',
  '2024-06-01T00:00:00Z',
  true
),
(
  'tomato',
  '{
    "en": "Tomato",
    "te": "టొమాటో",
    "botanical": "Solanum lycopersicum"
  }'::jsonb,
  ARRAY['kharif', 'rabi', 'zaid'],
  '{
    "tempMinC": 15.0,
    "tempMaxC": 35.0,
    "optimalTempMinC": 20.0,
    "optimalTempMaxC": 28.0,
    "rainfallMinMm": 400.0,
    "rainfallMaxMm": 600.0
  }'::jsonb,
  '{
    "phMin": 6.0,
    "phMax": 7.5,
    "optimalPhMin": 6.2,
    "optimalPhMax": 7.0,
    "preferredSoilTypes": ["Sandy loam", "Clay loam", "Red loam with rich organic matter"],
    "nitrogenNeed": "medium",
    "phosphorusNeed": "high",
    "potassiumNeed": "high",
    "drainageRequirement": "Must have rapid drainage; root rot occurs in stagnant moisture"
  }'::jsonb,
  '{
    "criticalStages": "Transplanting establishment, flowering, early fruit set",
    "method": "Drip irrigation with fertigation"
  }'::jsonb,
  ARRAY['IN-AP', 'IN-TG', 'IN-KA', 'IN-MH', 'IN-MP'],
  '[
    {
      "id": "IIHR-BENGALURU-2021",
      "title": "Package of Practices for Vegetable Crops",
      "publisher": "ICAR - Indian Institute of Horticultural Research, Bengaluru",
      "year": 2021
    }
  ]'::jsonb,
  '2024.1',
  '2024-06-01T00:00:00Z',
  true
),
(
  'red_gram',
  '{
    "en": "Red Gram (Pigeonpea / Arhar / Tur)",
    "te": "కంది",
    "botanical": "Cajanus cajan"
  }'::jsonb,
  ARRAY['kharif'],
  '{
    "tempMinC": 18.0,
    "tempMaxC": 38.0,
    "optimalTempMinC": 25.0,
    "optimalTempMaxC": 32.0,
    "rainfallMinMm": 600.0,
    "rainfallMaxMm": 900.0
  }'::jsonb,
  '{
    "phMin": 6.0,
    "phMax": 8.0,
    "optimalPhMin": 6.5,
    "optimalPhMax": 7.5,
    "preferredSoilTypes": ["Deep well-drained loam", "Medium black soil", "Red sandy loam"],
    "nitrogenNeed": "low",
    "phosphorusNeed": "high",
    "potassiumNeed": "low",
    "drainageRequirement": "Deep taproot system requires well-drained profile; wilt incidence increases with poor drainage"
  }'::jsonb,
  '{
    "criticalStages": "Flower bud initiation and pod development",
    "method": "Predominantly rainfed; 1-2 supplemental irrigations at flowering/pod fill boost yields"
  }'::jsonb,
  ARRAY['IN-TG', 'IN-AP', 'IN-MH', 'IN-KA', 'IN-MP'],
  '[
    {
      "id": "IIPR-KANPUR-2022",
      "title": "Pulse Production Technologies for Sustainable Agriculture",
      "publisher": "ICAR - Indian Institute of Pulses Research, Kanpur",
      "year": 2022
    }
  ]'::jsonb,
  '2024.1',
  '2024-06-01T00:00:00Z',
  true
),
(
  'bengal_gram',
  '{
    "en": "Bengal Gram (Chickpea / Chana)",
    "te": "శనగ",
    "botanical": "Cicer arietinum"
  }'::jsonb,
  ARRAY['rabi'],
  '{
    "tempMinC": 10.0,
    "tempMaxC": 30.0,
    "optimalTempMinC": 18.0,
    "optimalTempMaxC": 25.0,
    "rainfallMinMm": 300.0,
    "rainfallMaxMm": 500.0
  }'::jsonb,
  '{
    "phMin": 6.0,
    "phMax": 8.5,
    "optimalPhMin": 6.5,
    "optimalPhMax": 7.8,
    "preferredSoilTypes": ["Medium to heavy black soil", "Deep alluvial loam"],
    "nitrogenNeed": "low",
    "phosphorusNeed": "high",
    "potassiumNeed": "medium",
    "drainageRequirement": "Good drainage; highly susceptible to wet root rot and wilt under waterlogging"
  }'::jsonb,
  '{
    "criticalStages": "Pre-flowering and pod development",
    "method": "Light sprinkler or furrow; excessive irrigation causes vegetative surge instead of podding"
  }'::jsonb,
  ARRAY['IN-AP', 'IN-TG', 'IN-MP', 'IN-MH', 'IN-RJ'],
  '[
    {
      "id": "IIPR-CHICKPEA-2023",
      "title": "Chickpea Agronomy and Integrated Nutrient Management",
      "publisher": "ICAR - Indian Institute of Pulses Research, Kanpur",
      "year": 2023
    }
  ]'::jsonb,
  '2024.1',
  '2024-06-01T00:00:00Z',
  true
),
(
  'chilli',
  '{
    "en": "Chilli (Green & Dry Red)",
    "te": "మిరప",
    "botanical": "Capsicum annuum"
  }'::jsonb,
  ARRAY['kharif', 'rabi'],
  '{
    "tempMinC": 15.0,
    "tempMaxC": 38.0,
    "optimalTempMinC": 20.0,
    "optimalTempMaxC": 30.0,
    "rainfallMinMm": 600.0,
    "rainfallMaxMm": 1200.0
  }'::jsonb,
  '{
    "phMin": 6.0,
    "phMax": 7.5,
    "optimalPhMin": 6.5,
    "optimalPhMax": 7.2,
    "preferredSoilTypes": ["Black loam", "Well-drained red clay loam", "Deltaic alluvial soil"],
    "nitrogenNeed": "high",
    "phosphorusNeed": "medium",
    "potassiumNeed": "high",
    "drainageRequirement": "Strict requirement for excellent drainage; standing water leads to damping off and fruit rot"
  }'::jsonb,
  '{
    "criticalStages": "Flowering, fruit set, and ripening",
    "method": "Drip irrigation with fertigation; avoid water stress during blooming"
  }'::jsonb,
  ARRAY['IN-AP', 'IN-TG', 'IN-KA', 'IN-MH', 'IN-MP'],
  '[
    {
      "id": "ANGRAU-CHILLI-2023",
      "title": "Chilli Production Manual for High-Yield Commercial Farming",
      "publisher": "Acharya N.G. Ranga Agricultural University, Guntur",
      "year": 2023
    }
  ]'::jsonb,
  '2024.1',
  '2024-06-01T00:00:00Z',
  true
),
(
  'turmeric',
  '{
    "en": "Turmeric",
    "te": "పసుపు",
    "botanical": "Curcuma longa"
  }'::jsonb,
  ARRAY['kharif'],
  '{
    "tempMinC": 20.0,
    "tempMaxC": 38.0,
    "optimalTempMinC": 25.0,
    "optimalTempMaxC": 32.0,
    "rainfallMinMm": 1000.0,
    "rainfallMaxMm": 2000.0
  }'::jsonb,
  '{
    "phMin": 5.5,
    "phMax": 7.5,
    "optimalPhMin": 6.0,
    "optimalPhMax": 7.0,
    "preferredSoilTypes": ["Sandy loam", "Clayey loam", "Red loam rich in humus"],
    "nitrogenNeed": "high",
    "phosphorusNeed": "medium",
    "potassiumNeed": "high",
    "drainageRequirement": "Deep loose soil mandatory for rhizome expansion; water stagnation causes rhizome rot"
  }'::jsonb,
  '{
    "criticalStages": "Tillering, rhizome initiation, and rhizome bulking",
    "method": "Drip or furrow irrigation; mulching with green leaves recommended"
  }'::jsonb,
  ARRAY['IN-TG', 'IN-TN', 'IN-AP', 'IN-OR', 'IN-MH'],
  '[
    {
      "id": "IISR-KOZHIKODE-2022",
      "title": "Turmeric - Package of Practices",
      "publisher": "ICAR - Indian Institute of Spices Research, Kozhikode",
      "year": 2022
    }
  ]'::jsonb,
  '2024.1',
  '2024-06-01T00:00:00Z',
  true
)
ON CONFLICT (crop_code) DO NOTHING;

