import { z } from 'zod';

export const CropNamesSchema = z.object({
  en: z.string(),
  te: z.string(),
  botanical: z.string().optional()
});

export const ClimateRequirementsSchema = z.object({
  tempMinC: z.number(),
  tempMaxC: z.number(),
  optimalTempMinC: z.number(),
  optimalTempMaxC: z.number(),
  rainfallMinMm: z.number(),
  rainfallMaxMm: z.number()
});

export const SoilRequirementsSchema = z.object({
  phMin: z.number(),
  phMax: z.number(),
  optimalPhMin: z.number(),
  optimalPhMax: z.number(),
  preferredSoilTypes: z.array(z.string()),
  nitrogenNeed: z.enum(['low', 'medium', 'high']),
  phosphorusNeed: z.enum(['low', 'medium', 'high']),
  potassiumNeed: z.enum(['low', 'medium', 'high']),
  drainageRequirement: z.string()
});

export const SourceReferenceSchema = z.object({
  id: z.string(),
  title: z.string(),
  publisher: z.string(),
  year: z.number().optional(),
  url: z.string().url().optional()
});

export const CropCatalogItemSchema = z.object({
  id: z.string().uuid(),
  cropCode: z.string(),
  names: CropNamesSchema,
  seasonTags: z.array(z.string()),
  climateRequirements: ClimateRequirementsSchema,
  soilRequirements: SoilRequirementsSchema,
  irrigationNotes: z.record(z.string(), z.string()).optional(),
  regionCodes: z.array(z.string()),
  sourceReferences: z.array(SourceReferenceSchema),
  dataVersion: z.string(),
  verifiedAt: z.string().datetime().optional().nullable(),
  active: z.boolean().default(true)
});

export type CropCatalogItem = z.infer<typeof CropCatalogItemSchema>;

export const CropRecommendationRequestSchema = z.object({
  fieldId: z.string().uuid().optional().nullable(),
  plannedSeason: z.enum(['kharif', 'rabi', 'zaid', 'all_year']),
  currentCropRotation: z.string().optional().nullable(),
  hasIrrigation: z.boolean().default(true),
  soilOverrides: z
    .object({
      ph: z.number().min(0).max(14).optional(),
      moisturePct: z.number().min(0).max(100).optional(),
      nitrogenValue: z.number().min(0).optional(),
      phosphorusValue: z.number().min(0).optional(),
      potassiumValue: z.number().min(0).optional(),
      soilType: z.string().optional()
    })
    .optional()
});

export type CropRecommendationRequest = z.infer<typeof CropRecommendationRequestSchema>;

export const CropScoreBreakdownSchema = z.object({
  cropCode: z.string(),
  cropName: CropNamesSchema,
  overallScore: z.number().min(0).max(100),
  suitabilityLevel: z.enum(['highly_suitable', 'moderately_suitable', 'marginally_suitable', 'not_recommended']),
  scores: z.object({
    phScore: z.number().min(0).max(100),
    moistureScore: z.number().min(0).max(100),
    seasonScore: z.number().min(0).max(100),
    temperatureScore: z.number().min(0).max(100),
    npkScore: z.number().min(0).max(100)
  }),
  supportingInputIds: z.array(z.string()),
  matchingFactors: z.array(z.string()),
  limitingFactors: z.array(z.string()),
  sources: z.array(SourceReferenceSchema)
});

export type CropScoreBreakdown = z.infer<typeof CropScoreBreakdownSchema>;

export const CropRecommendationExplanationSchema = z.object({
  summary: z.string(),
  recommendationReasons: z.array(
    z.object({
      cropCode: z.string(),
      reason: z.string(),
      supportingInputIds: z.array(z.string())
    })
  ),
  missingInputs: z.array(z.string()),
  sourceIds: z.array(z.string()),
  uncertainty: z.string()
});

export type CropRecommendationExplanation = z.infer<typeof CropRecommendationExplanationSchema>;

export const CropRecommendationResultSchema = z.object({
  id: z.string().uuid(),
  ownerId: z.string().uuid(),
  farmId: z.string().uuid(),
  fieldId: z.string().uuid().optional().nullable(),
  recommendationType: z.literal('crop'),
  inputSnapshot: z.record(z.string(), z.any()),
  rankedCrops: z.array(CropScoreBreakdownSchema),
  explanation: CropRecommendationExplanationSchema,
  dataSources: z.array(SourceReferenceSchema),
  engineVersion: z.string(),
  createdAt: z.string().datetime()
});

export type CropRecommendationResult = z.infer<typeof CropRecommendationResultSchema>;

