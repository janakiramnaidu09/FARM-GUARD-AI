import {
  CropCatalogItem,
  CropScoreBreakdown,
  CropRecommendationRequest,
  SourceReferenceSchema,
  CropRecommendationResult
} from '@farmguard/shared';
import { geminiService } from '../gemini/geminiService.js';
import { getPool } from '../../db/pool.js';
import { withAdminQuery } from '../../db/withUserTransaction.js';

// Static catalog seed fallback in case database query is not available
const FALLBACK_CATALOG: CropCatalogItem[] = [
  {
    id: '10000000-0000-0000-0000-000000000001',
    cropCode: 'rice',
    names: { en: 'Rice (Paddy)', te: 'వరి (వరి ధాన్యం)', botanical: 'Oryza sativa' },
    seasonTags: ['kharif', 'rabi'],
    climateRequirements: { tempMinC: 20, tempMaxC: 38, optimalTempMinC: 24, optimalTempMaxC: 32, rainfallMinMm: 1000, rainfallMaxMm: 2500 },
    soilRequirements: { phMin: 5.0, phMax: 8.0, optimalPhMin: 6.0, optimalPhMax: 7.0, preferredSoilTypes: ['Clay loam', 'Alluvial', 'Heavy black soil'], nitrogenNeed: 'high', phosphorusNeed: 'medium', potassiumNeed: 'medium', drainageRequirement: 'Clayey soil retaining water' },
    regionCodes: ['IN-TG', 'IN-AP', 'IN-TN', 'IN-KA', 'IN'],
    sourceReferences: [
      { id: 'ICAR-AGRI-2020-RICE', title: 'Handbook of Agriculture (ICAR, New Delhi)', publisher: 'ICAR', year: 2020 },
      { id: 'PJTSAU-VYAVASAYA-2023', title: 'Vyavasaya Panchangam (PJTSAU, Hyderabad)', publisher: 'PJTSAU', year: 2023 }
    ],
    dataVersion: '2024.1',
    active: true
  },
  {
    id: '10000000-0000-0000-0000-000000000002',
    cropCode: 'cotton',
    names: { en: 'Cotton', te: 'పత్తి', botanical: 'Gossypium hirsutum' },
    seasonTags: ['kharif'],
    climateRequirements: { tempMinC: 18, tempMaxC: 40, optimalTempMinC: 25, optimalTempMaxC: 35, rainfallMinMm: 500, rainfallMaxMm: 1000 },
    soilRequirements: { phMin: 6.0, phMax: 8.5, optimalPhMin: 6.5, optimalPhMax: 7.8, preferredSoilTypes: ['Deep black cotton soil', 'Red loam'], nitrogenNeed: 'high', phosphorusNeed: 'medium', potassiumNeed: 'high', drainageRequirement: 'Well-drained; zero waterlogging' },
    regionCodes: ['IN-TG', 'IN-AP', 'IN-MH', 'IN-GJ', 'IN'],
    sourceReferences: [
      { id: 'CICR-NAGPUR-2022', title: 'Cotton Production Technology (CICR Nagpur)', publisher: 'ICAR-CICR', year: 2022 }
    ],
    dataVersion: '2024.1',
    active: true
  },
  {
    id: '10000000-0000-0000-0000-000000000003',
    cropCode: 'maize',
    names: { en: 'Maize (Corn)', te: 'మొక్కజొన్న', botanical: 'Zea mays' },
    seasonTags: ['kharif', 'rabi', 'zaid'],
    climateRequirements: { tempMinC: 15, tempMaxC: 38, optimalTempMinC: 21, optimalTempMaxC: 30, rainfallMinMm: 500, rainfallMaxMm: 800 },
    soilRequirements: { phMin: 5.5, phMax: 8.0, optimalPhMin: 6.0, optimalPhMax: 7.5, preferredSoilTypes: ['Sandy loam', 'Loam', 'Alluvial'], nitrogenNeed: 'high', phosphorusNeed: 'medium', potassiumNeed: 'medium', drainageRequirement: 'Well-drained soil' },
    regionCodes: ['IN-TG', 'IN-AP', 'IN-KA', 'IN-BR', 'IN'],
    sourceReferences: [
      { id: 'IIMR-LUDHIANA-2021', title: 'Maize Production Technologies (ICAR-IIMR)', publisher: 'ICAR', year: 2021 }
    ],
    dataVersion: '2024.1',
    active: true
  },
  {
    id: '10000000-0000-0000-0000-000000000004',
    cropCode: 'groundnut',
    names: { en: 'Groundnut (Peanut)', te: 'వేరుశనగ', botanical: 'Arachis hypogaea' },
    seasonTags: ['kharif', 'rabi'],
    climateRequirements: { tempMinC: 20, tempMaxC: 35, optimalTempMinC: 24, optimalTempMaxC: 30, rainfallMinMm: 450, rainfallMaxMm: 700 },
    soilRequirements: { phMin: 5.5, phMax: 7.5, optimalPhMin: 6.0, optimalPhMax: 7.0, preferredSoilTypes: ['Sandy loam', 'Light red sandy soil (Chalka)'], nitrogenNeed: 'low', phosphorusNeed: 'medium', potassiumNeed: 'medium', drainageRequirement: 'Loose friable soil' },
    regionCodes: ['IN-AP', 'IN-TG', 'IN-GJ', 'IN-TN', 'IN'],
    sourceReferences: [
      { id: 'DGR-JUNAGADH-2022', title: 'Groundnut Cultivation Guidelines (ICAR-DGR)', publisher: 'ICAR', year: 2022 }
    ],
    dataVersion: '2024.1',
    active: true
  },
  {
    id: '10000000-0000-0000-0000-000000000005',
    cropCode: 'red_gram',
    names: { en: 'Red Gram (Pigeonpea / Kandi)', te: 'కంది', botanical: 'Cajanus cajan' },
    seasonTags: ['kharif'],
    climateRequirements: { tempMinC: 18, tempMaxC: 38, optimalTempMinC: 25, optimalTempMaxC: 32, rainfallMinMm: 600, rainfallMaxMm: 900 },
    soilRequirements: { phMin: 6.0, phMax: 8.0, optimalPhMin: 6.5, optimalPhMax: 7.5, preferredSoilTypes: ['Deep well-drained loam', 'Medium black soil'], nitrogenNeed: 'low', phosphorusNeed: 'high', potassiumNeed: 'low', drainageRequirement: 'Deep well-drained' },
    regionCodes: ['IN-TG', 'IN-AP', 'IN-MH', 'IN-KA', 'IN'],
    sourceReferences: [
      { id: 'IIPR-KANPUR-2022', title: 'Pulse Production Technologies (ICAR-IIPR)', publisher: 'ICAR', year: 2022 }
    ],
    dataVersion: '2024.1',
    active: true
  },
  {
    id: '10000000-0000-0000-0000-000000000006',
    cropCode: 'bengal_gram',
    names: { en: 'Bengal Gram (Chickpea / Senagalu)', te: 'శనగ', botanical: 'Cicer arietinum' },
    seasonTags: ['rabi'],
    climateRequirements: { tempMinC: 10, tempMaxC: 30, optimalTempMinC: 18, optimalTempMaxC: 25, rainfallMinMm: 300, rainfallMaxMm: 500 },
    soilRequirements: { phMin: 6.0, phMax: 8.5, optimalPhMin: 6.5, optimalPhMax: 7.8, preferredSoilTypes: ['Medium to heavy black soil', 'Alluvial loam'], nitrogenNeed: 'low', phosphorusNeed: 'high', potassiumNeed: 'medium', drainageRequirement: 'Good drainage mandatory' },
    regionCodes: ['IN-AP', 'IN-TG', 'IN-MP', 'IN-MH', 'IN'],
    sourceReferences: [
      { id: 'IIPR-CHICKPEA-2023', title: 'Chickpea Agronomy (ICAR-IIPR Kanpur)', publisher: 'ICAR', year: 2023 }
    ],
    dataVersion: '2024.1',
    active: true
  },
  {
    id: '10000000-0000-0000-0000-000000000007',
    cropCode: 'tomato',
    names: { en: 'Tomato', te: 'టొమాటో', botanical: 'Solanum lycopersicum' },
    seasonTags: ['kharif', 'rabi', 'zaid'],
    climateRequirements: { tempMinC: 15, tempMaxC: 35, optimalTempMinC: 20, optimalTempMaxC: 28, rainfallMinMm: 400, rainfallMaxMm: 600 },
    soilRequirements: { phMin: 6.0, phMax: 7.5, optimalPhMin: 6.2, optimalPhMax: 7.0, preferredSoilTypes: ['Sandy loam', 'Clay loam', 'Red loam'], nitrogenNeed: 'medium', phosphorusNeed: 'high', potassiumNeed: 'high', drainageRequirement: 'Rapid drainage' },
    regionCodes: ['IN-AP', 'IN-TG', 'IN-KA', 'IN-MH', 'IN'],
    sourceReferences: [
      { id: 'IIHR-BENGALURU-2021', title: 'Vegetable Production Guide (ICAR-IIHR)', publisher: 'ICAR', year: 2021 }
    ],
    dataVersion: '2024.1',
    active: true
  },
  {
    id: '10000000-0000-0000-0000-000000000008',
    cropCode: 'chilli',
    names: { en: 'Chilli (Mirapa)', te: 'మిరప', botanical: 'Capsicum annuum' },
    seasonTags: ['kharif', 'rabi'],
    climateRequirements: { tempMinC: 15, tempMaxC: 38, optimalTempMinC: 20, optimalTempMaxC: 30, rainfallMinMm: 600, rainfallMaxMm: 1200 },
    soilRequirements: { phMin: 6.0, phMax: 7.5, optimalPhMin: 6.5, optimalPhMax: 7.2, preferredSoilTypes: ['Black loam', 'Red clay loam'], nitrogenNeed: 'high', phosphorusNeed: 'medium', potassiumNeed: 'high', drainageRequirement: 'Excellent drainage' },
    regionCodes: ['IN-AP', 'IN-TG', 'IN-KA', 'IN-MH', 'IN'],
    sourceReferences: [
      { id: 'ANGRAU-CHILLI-2023', title: 'Commercial Chilli Production (ANGRAU Guntur)', publisher: 'ANGRAU', year: 2023 }
    ],
    dataVersion: '2024.1',
    active: true
  }
];

export class CropRankingService {
  async getCropCatalog(): Promise<CropCatalogItem[]> {
    const pool = getPool();
    if (!pool) return FALLBACK_CATALOG;

    try {
      return await withAdminQuery(async (client) => {
        const res = await client.query('SELECT * FROM crop_catalog WHERE active = true ORDER BY crop_code');
        if (res.rows.length === 0) return FALLBACK_CATALOG;
        return res.rows.map((r) => ({
          id: r.id,
          cropCode: r.crop_code,
          names: r.names,
          seasonTags: r.season_tags,
          climateRequirements: r.climate_requirements,
          soilRequirements: r.soil_requirements,
          irrigationNotes: r.irrigation_notes,
          regionCodes: r.region_codes,
          sourceReferences: r.source_references,
          dataVersion: r.data_version,
          verifiedAt: r.verified_at ? r.verified_at.toISOString() : null,
          active: r.active,
        }));
      });
    } catch {
      return FALLBACK_CATALOG;
    }
  }

  async rankCrops(params: {
    request: CropRecommendationRequest;
    soilReading?: {
      moisturePct?: number | null;
      ph?: number | null;
      nitrogenValue?: number | null;
      phosphorusValue?: number | null;
      potassiumValue?: number | null;
    } | null;
    forecastAvgTempC?: number | null;
    language?: 'en' | 'te';
  }): Promise<{
    rankedCrops: CropScoreBreakdown[];
    missingInputs: string[];
    explanation: any;
    dataSources: any[];
  }> {
    const { request, soilReading, forecastAvgTempC, language = 'en' } = params;
    const catalog = await this.getCropCatalog();

    // Determine final input values (explicit overrides take precedence over stored reading)
    const ph = request.soilOverrides?.ph ?? soilReading?.ph ?? null;
    const moisture = request.soilOverrides?.moisturePct ?? soilReading?.moisturePct ?? null;
    const nitrogen = request.soilOverrides?.nitrogenValue ?? soilReading?.nitrogenValue ?? null;
    const phosphorus = request.soilOverrides?.phosphorusValue ?? soilReading?.phosphorusValue ?? null;
    const potassium = request.soilOverrides?.potassiumValue ?? soilReading?.potassiumValue ?? null;
    const plannedSeason = request.plannedSeason;
    const hasIrrigation = request.hasIrrigation;

    // Track missing inputs
    const missingInputs: string[] = [];
    if (ph === null) missingInputs.push('Soil pH');
    if (moisture === null) missingInputs.push('Soil moisture');
    if (nitrogen === null || phosphorus === null || potassium === null) missingInputs.push('Soil NPK nutrients');
    if (forecastAvgTempC === null || forecastAvgTempC === undefined) missingInputs.push('Local weather forecast');

    const rankedCrops: CropScoreBreakdown[] = [];

    for (const crop of catalog) {
      const supportingInputIds: string[] = [];
      const matchingFactors: string[] = [];
      const limitingFactors: string[] = [];

      // 1. pH Score (25%)
      let phScore = 70; // baseline if unmeasured
      if (ph !== null) {
        supportingInputIds.push('INPUT_SOIL_PH');
        if (ph >= crop.soilRequirements.optimalPhMin && ph <= crop.soilRequirements.optimalPhMax) {
          phScore = 100;
          matchingFactors.push(`Soil pH (${ph}) is within the optimal zone (${crop.soilRequirements.optimalPhMin}-${crop.soilRequirements.optimalPhMax})`);
        } else if (ph >= crop.soilRequirements.phMin && ph <= crop.soilRequirements.phMax) {
          phScore = 75;
          matchingFactors.push(`Soil pH (${ph}) is tolerable (${crop.soilRequirements.phMin}-${crop.soilRequirements.phMax})`);
        } else {
          phScore = 30;
          limitingFactors.push(`Soil pH (${ph}) is outside favorable range (${crop.soilRequirements.phMin}-${crop.soilRequirements.phMax})`);
        }
      }

      // 2. Season Score (25%)
      let seasonScore = 30;
      if (crop.seasonTags.includes(plannedSeason) || crop.seasonTags.includes('all_year') || plannedSeason === 'all_year') {
        seasonScore = 100;
        supportingInputIds.push('INPUT_PLANNED_SEASON');
        matchingFactors.push(`Planned season (${plannedSeason.toUpperCase()}) matches recommended agronomic sowing window`);
      } else {
        seasonScore = 20;
        limitingFactors.push(`Crop is traditionally suited for ${crop.seasonTags.join(', ').toUpperCase()}, not ${plannedSeason.toUpperCase()}`);
      }

      // 3. Moisture & Irrigation Score (20%)
      let moistureScore = 70;
      supportingInputIds.push('INPUT_IRRIGATION_FACILITY');
      if (hasIrrigation) {
        moistureScore = 95;
        matchingFactors.push('Irrigation availability satisfies moisture requirements');
      } else {
        if (crop.climateRequirements.rainfallMinMm > 800) {
          moistureScore = 40;
          limitingFactors.push('Crop has high water requirements but no assured irrigation was specified');
        } else {
          moistureScore = 80;
          matchingFactors.push('Crop exhibits moderate drought tolerance suitable for rainfed cultivation');
        }
      }

      // 4. Temperature Score (15%)
      let tempScore = 75;
      if (forecastAvgTempC !== null && forecastAvgTempC !== undefined) {
        supportingInputIds.push('INPUT_WEATHER_TEMPERATURE');
        if (
          forecastAvgTempC >= crop.climateRequirements.optimalTempMinC &&
          forecastAvgTempC <= crop.climateRequirements.optimalTempMaxC
        ) {
          tempScore = 100;
          matchingFactors.push(`Current temperature (${forecastAvgTempC}°C) is in optimal growth range`);
        } else if (
          forecastAvgTempC >= crop.climateRequirements.tempMinC &&
          forecastAvgTempC <= crop.climateRequirements.tempMaxC
        ) {
          tempScore = 70;
        } else {
          tempScore = 35;
          limitingFactors.push(`Temperature (${forecastAvgTempC}°C) is outside ideal range (${crop.climateRequirements.tempMinC}-${crop.climateRequirements.tempMaxC}°C)`);
        }
      }

      // 5. NPK Nutrient Score (15%)
      let npkScore = 75;
      if (nitrogen !== null || phosphorus !== null || potassium !== null) {
        supportingInputIds.push('INPUT_SOIL_NPK');
        if (crop.soilRequirements.nitrogenNeed === 'low' && crop.cropCode.includes('gram')) {
          npkScore = 90;
          matchingFactors.push('Pulse crop fixes atmospheric nitrogen, performing well in low-N soils');
        }
      }

      // Overall Score Calculation (Deterministic weighted formula)
      const overallScore = Math.round(
        phScore * 0.25 + seasonScore * 0.25 + moistureScore * 0.20 + tempScore * 0.15 + npkScore * 0.15
      );

      let suitabilityLevel: CropScoreBreakdown['suitabilityLevel'] = 'not_recommended';
      if (overallScore >= 80) suitabilityLevel = 'highly_suitable';
      else if (overallScore >= 65) suitabilityLevel = 'moderately_suitable';
      else if (overallScore >= 45) suitabilityLevel = 'marginally_suitable';

      rankedCrops.push({
        cropCode: crop.cropCode,
        cropName: crop.names,
        overallScore,
        suitabilityLevel,
        scores: {
          phScore,
          moistureScore,
          seasonScore,
          temperatureScore: tempScore,
          npkScore,
        },
        supportingInputIds: Array.from(new Set(supportingInputIds)),
        matchingFactors,
        limitingFactors,
        sources: crop.sourceReferences,
      });
    }

    // Sort descending by overall score
    rankedCrops.sort((a, b) => b.overallScore - a.overallScore);

    // Call Gemini to explain the deterministic ranking without modifying scores
    const explanation = await geminiService.explainCropRecommendations({
      rankedCrops,
      missingInputs,
      language,
    });

    const dataSources = Array.from(
      new Map(
        rankedCrops.flatMap((c) => c.sources).map((s) => [s.id, s])
      ).values()
    );

    return {
      rankedCrops,
      missingInputs,
      explanation,
      dataSources,
    };
  }
}

export const cropRankingService = new CropRankingService();
