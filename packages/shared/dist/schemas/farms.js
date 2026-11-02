import { z } from 'zod';
export const FarmSchema = z.object({
    id: z.string().uuid(),
    ownerId: z.string().uuid(),
    name: z.string().min(1, 'Farm name is required').max(150),
    countryCode: z.string().length(2).default('IN'),
    state: z.string().min(1, 'State is required').max(100),
    district: z.string().min(1, 'District is required').max(100),
    locality: z.string().max(150).optional().nullable(),
    latitude: z
        .number()
        .min(-90, 'Latitude must be between -90 and 90')
        .max(90, 'Latitude must be between -90 and 90')
        .optional()
        .nullable(),
    longitude: z
        .number()
        .min(-180, 'Longitude must be between -180 and 180')
        .max(180, 'Longitude must be between -180 and 180')
        .optional()
        .nullable(),
    locationSource: z.string().max(50).optional().nullable(),
    timezone: z.string().max(50).default('Asia/Kolkata'),
    notes: z.string().max(1000).optional().nullable(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime()
});
export const CreateFarmSchema = z.object({
    name: z.string().min(1, 'Farm name is required').max(150).trim(),
    countryCode: z.string().length(2).default('IN'),
    state: z.string().min(1, 'State is required').max(100).trim(),
    district: z.string().min(1, 'District is required').max(100).trim(),
    locality: z.string().max(150).trim().optional().nullable(),
    latitude: z.number().min(-90).max(90).optional().nullable(),
    longitude: z.number().min(-180).max(180).optional().nullable(),
    locationSource: z.string().max(50).optional().nullable(),
    timezone: z.string().max(50).default('Asia/Kolkata'),
    notes: z.string().max(1000).optional().nullable()
});
export const UpdateFarmSchema = CreateFarmSchema.partial();
export const FieldSchema = z.object({
    id: z.string().uuid(),
    ownerId: z.string().uuid(),
    farmId: z.string().uuid(),
    name: z.string().min(1, 'Field name is required').max(150),
    areaValue: z.number().positive('Area must be greater than 0').optional().nullable(),
    areaUnit: z.enum(['hectare', 'acre', 'gunta', 'sq_meter']).default('acre'),
    soilType: z.string().max(100).optional().nullable(),
    currentCropCode: z.string().max(50).optional().nullable(),
    plantingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD').optional().nullable(),
    irrigationType: z.string().max(100).optional().nullable(),
    notes: z.string().max(1000).optional().nullable(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime()
});
export const CreateFieldSchema = z.object({
    name: z.string().min(1, 'Field name is required').max(150).trim(),
    areaValue: z.number().positive('Area must be positive').optional().nullable(),
    areaUnit: z.enum(['hectare', 'acre', 'gunta', 'sq_meter']).default('acre'),
    soilType: z.string().max(100).trim().optional().nullable(),
    currentCropCode: z.string().max(50).trim().optional().nullable(),
    plantingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD').optional().nullable(),
    irrigationType: z.string().max(100).trim().optional().nullable(),
    notes: z.string().max(1000).trim().optional().nullable()
});
export const UpdateFieldSchema = CreateFieldSchema.partial();
//# sourceMappingURL=farms.js.map