import { z } from 'zod';
export const ApiErrorResponseSchema = z.object({
    success: z.literal(false),
    error: z.object({
        code: z.string(),
        message: z.string(),
        details: z.unknown().optional(),
        requestId: z.string().optional()
    })
});
export function createApiResponseSchema(dataSchema) {
    return z.object({
        success: z.literal(true),
        data: dataSchema,
        meta: z
            .object({
            requestId: z.string().optional(),
            timestamp: z.string().optional()
        })
            .optional()
    });
}
export const PaginationQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).default('desc')
});
//# sourceMappingURL=common.js.map