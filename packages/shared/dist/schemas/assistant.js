import { z } from 'zod';
import { PreferredLanguageSchema } from './auth.js';
export const StructuredAssistantAdviceSchema = z.object({
    answer: z.string(),
    language: PreferredLanguageSchema,
    uncertainty: z.string(),
    followUpQuestions: z.array(z.string()),
    sourceIds: z.array(z.string()),
    safetyNote: z.string()
});
export const CreateConversationSchema = z.object({
    farmId: z.string().uuid().optional().nullable(),
    fieldId: z.string().uuid().optional().nullable(),
    language: PreferredLanguageSchema.default('te'),
    title: z.string().max(100).optional()
});
export const SendMessageSchema = z.object({
    content: z.string().min(1, 'Message cannot be empty').max(3000),
    language: PreferredLanguageSchema.optional(),
    latitude: z.number().optional().nullable(),
    longitude: z.number().optional().nullable(),
    locationName: z.string().max(200).optional().nullable()
});
export const ConversationMessageSchema = z.object({
    id: z.string().uuid(),
    ownerId: z.string().uuid(),
    conversationId: z.string().uuid(),
    role: z.enum(['user', 'assistant']),
    content: z.string(),
    structuredAdvice: StructuredAssistantAdviceSchema.nullable().optional(),
    provider: z.string().nullable().optional(),
    model: z.string().nullable().optional(),
    createdAt: z.string().datetime()
});
export const ConversationSchema = z.object({
    id: z.string().uuid(),
    ownerId: z.string().uuid(),
    farmId: z.string().uuid().nullable().optional(),
    fieldId: z.string().uuid().nullable().optional(),
    language: PreferredLanguageSchema,
    title: z.string().nullable().optional(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    messages: z.array(ConversationMessageSchema).optional()
});
//# sourceMappingURL=assistant.js.map