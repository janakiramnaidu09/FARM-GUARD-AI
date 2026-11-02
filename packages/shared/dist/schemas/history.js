import { z } from 'zod';
import { SoilReadingSchema } from './soil.js';
import { DiseaseAssessmentRecordSchema } from './disease.js';
import { CropRecommendationResultSchema } from './crops.js';
import { WeatherSnapshotSchema } from './weather.js';
import { ConversationSchema } from './assistant.js';
export const HistoryQuerySchema = z.object({
    type: z.enum(['all', 'disease', 'soil', 'weather', 'recommendation', 'conversation']).default('all'),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().optional(),
    farmId: z.string().uuid().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional()
});
export const HistoryItemSchema = z.object({
    id: z.string().uuid(),
    type: z.enum(['disease', 'soil', 'weather', 'recommendation', 'conversation']),
    title: z.string(),
    summary: z.string(),
    farmName: z.string().optional().nullable(),
    fieldName: z.string().optional().nullable(),
    timestamp: z.string().datetime(),
    details: z.record(z.string(), z.any())
});
export const HistoryResponseSchema = z.object({
    items: z.array(HistoryItemSchema),
    totalCount: z.number().int(),
    page: z.number().int(),
    totalPages: z.number().int()
});
export const AccountDataExportSchema = z.object({
    user: z.record(z.string(), z.any()),
    farms: z.array(z.record(z.string(), z.any())),
    fields: z.array(z.record(z.string(), z.any())),
    soilReadings: z.array(SoilReadingSchema),
    diseaseAssessments: z.array(DiseaseAssessmentRecordSchema),
    cropRecommendations: z.array(CropRecommendationResultSchema),
    weatherSnapshots: z.array(WeatherSnapshotSchema),
    conversations: z.array(ConversationSchema),
    exportedAt: z.string().datetime()
});
export const DeleteAccountSchema = z.object({
    confirmation: z.literal('DELETE_MY_ACCOUNT'),
    password: z.string().min(1, 'Password is required to confirm account deletion')
});
//# sourceMappingURL=history.js.map