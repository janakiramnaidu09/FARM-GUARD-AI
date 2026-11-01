import { z } from 'zod';

export const ReadingSourceSchema = z.enum(['manual', 'sensor', 'import']);
export type ReadingSource = z.infer<typeof ReadingSourceSchema>;

export const SoilReadingSchema = z.object({
  id: z.string().uuid(),
  ownerId: z.string().uuid(),
  fieldId: z.string().uuid(),
  observedAt: z.string().datetime(),
  moisturePct: z
    .number()
    .min(0, 'Moisture must be at least 0%')
    .max(100, 'Moisture cannot exceed 100%')
    .optional()
    .nullable(),
  temperatureC: z
    .number()
    .min(-20, 'Temperature out of realistic agricultural range')
    .max(70, 'Temperature out of realistic agricultural range')
    .optional()
    .nullable(),
  ph: z
    .number()
    .min(0, 'pH must be between 0 and 14')
    .max(14, 'pH must be between 0 and 14')
    .optional()
    .nullable(),
  nitrogenValue: z.number().min(0, 'Nitrogen must be non-negative').optional().nullable(),
  phosphorusValue: z.number().min(0, 'Phosphorus must be non-negative').optional().nullable(),
  potassiumValue: z.number().min(0, 'Potassium must be non-negative').optional().nullable(),
  npkUnit: z.enum(['kg_per_ha', 'ppm', 'mg_per_kg']).default('kg_per_ha').optional().nullable(),
  source: ReadingSourceSchema.default('manual'),
  notes: z.string().max(1000).optional().nullable(),
  createdAt: z.string().datetime()
});

export type SoilReading = z.infer<typeof SoilReadingSchema>;

export const CreateSoilReadingSchema = z.object({
  observedAt: z.string().datetime().optional(),
  moisturePct: z.number().min(0).max(100).optional().nullable(),
  temperatureC: z.number().min(-20).max(70).optional().nullable(),
  ph: z.number().min(0).max(14).optional().nullable(),
  nitrogenValue: z.number().min(0).optional().nullable(),
  phosphorusValue: z.number().min(0).optional().nullable(),
  potassiumValue: z.number().min(0).optional().nullable(),
  npkUnit: z.enum(['kg_per_ha', 'ppm', 'mg_per_kg']).default('kg_per_ha').optional().nullable(),
  source: ReadingSourceSchema.default('manual'),
  notes: z.string().max(1000).optional().nullable()
});

export type CreateSoilReading = z.infer<typeof CreateSoilReadingSchema>;

export const SensorIngestPayloadSchema = z.object({
  deviceToken: z.string().min(16, 'Valid device token is required'),
  fieldId: z.string().uuid(),
  timestamp: z.string().datetime().optional(),
  readings: z.object({
    moisturePct: z.number().min(0).max(100).optional(),
    temperatureC: z.number().min(-20).max(70).optional(),
    ph: z.number().min(0).max(14).optional(),
    nitrogenValue: z.number().min(0).optional(),
    phosphorusValue: z.number().min(0).optional(),
    potassiumValue: z.number().min(0).optional(),
    npkUnit: z.enum(['kg_per_ha', 'ppm', 'mg_per_kg']).default('kg_per_ha').optional()
  }),
  batteryPct: z.number().min(0).max(100).optional()
});

export type SensorIngestPayload = z.infer<typeof SensorIngestPayloadSchema>;

