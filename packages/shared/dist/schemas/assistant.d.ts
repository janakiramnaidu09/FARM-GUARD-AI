import { z } from 'zod';
export declare const StructuredAssistantAdviceSchema: z.ZodObject<{
    answer: z.ZodString;
    language: z.ZodEnum<["en", "te"]>;
    uncertainty: z.ZodString;
    followUpQuestions: z.ZodArray<z.ZodString, "many">;
    sourceIds: z.ZodArray<z.ZodString, "many">;
    safetyNote: z.ZodString;
}, "strip", z.ZodTypeAny, {
    sourceIds: string[];
    uncertainty: string;
    answer: string;
    language: "en" | "te";
    followUpQuestions: string[];
    safetyNote: string;
}, {
    sourceIds: string[];
    uncertainty: string;
    answer: string;
    language: "en" | "te";
    followUpQuestions: string[];
    safetyNote: string;
}>;
export type StructuredAssistantAdvice = z.infer<typeof StructuredAssistantAdviceSchema>;
export declare const CreateConversationSchema: z.ZodObject<{
    farmId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    fieldId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    language: z.ZodDefault<z.ZodEnum<["en", "te"]>>;
    title: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    language: "en" | "te";
    farmId?: string | null | undefined;
    fieldId?: string | null | undefined;
    title?: string | undefined;
}, {
    farmId?: string | null | undefined;
    fieldId?: string | null | undefined;
    title?: string | undefined;
    language?: "en" | "te" | undefined;
}>;
export type CreateConversation = z.infer<typeof CreateConversationSchema>;
export declare const SendMessageSchema: z.ZodObject<{
    content: z.ZodString;
    language: z.ZodOptional<z.ZodEnum<["en", "te"]>>;
    latitude: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    longitude: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    locationName: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    content: string;
    latitude?: number | null | undefined;
    longitude?: number | null | undefined;
    language?: "en" | "te" | undefined;
    locationName?: string | null | undefined;
}, {
    content: string;
    latitude?: number | null | undefined;
    longitude?: number | null | undefined;
    language?: "en" | "te" | undefined;
    locationName?: string | null | undefined;
}>;
export type SendMessage = z.infer<typeof SendMessageSchema>;
export declare const ConversationMessageSchema: z.ZodObject<{
    id: z.ZodString;
    ownerId: z.ZodString;
    conversationId: z.ZodString;
    role: z.ZodEnum<["user", "assistant"]>;
    content: z.ZodString;
    structuredAdvice: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        answer: z.ZodString;
        language: z.ZodEnum<["en", "te"]>;
        uncertainty: z.ZodString;
        followUpQuestions: z.ZodArray<z.ZodString, "many">;
        sourceIds: z.ZodArray<z.ZodString, "many">;
        safetyNote: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        sourceIds: string[];
        uncertainty: string;
        answer: string;
        language: "en" | "te";
        followUpQuestions: string[];
        safetyNote: string;
    }, {
        sourceIds: string[];
        uncertainty: string;
        answer: string;
        language: "en" | "te";
        followUpQuestions: string[];
        safetyNote: string;
    }>>>;
    provider: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    model: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    createdAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: string;
    ownerId: string;
    content: string;
    conversationId: string;
    role: "user" | "assistant";
    provider?: string | null | undefined;
    structuredAdvice?: {
        sourceIds: string[];
        uncertainty: string;
        answer: string;
        language: "en" | "te";
        followUpQuestions: string[];
        safetyNote: string;
    } | null | undefined;
    model?: string | null | undefined;
}, {
    id: string;
    createdAt: string;
    ownerId: string;
    content: string;
    conversationId: string;
    role: "user" | "assistant";
    provider?: string | null | undefined;
    structuredAdvice?: {
        sourceIds: string[];
        uncertainty: string;
        answer: string;
        language: "en" | "te";
        followUpQuestions: string[];
        safetyNote: string;
    } | null | undefined;
    model?: string | null | undefined;
}>;
export type ConversationMessage = z.infer<typeof ConversationMessageSchema>;
export declare const ConversationSchema: z.ZodObject<{
    id: z.ZodString;
    ownerId: z.ZodString;
    farmId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    fieldId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    language: z.ZodEnum<["en", "te"]>;
    title: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
    messages: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        ownerId: z.ZodString;
        conversationId: z.ZodString;
        role: z.ZodEnum<["user", "assistant"]>;
        content: z.ZodString;
        structuredAdvice: z.ZodOptional<z.ZodNullable<z.ZodObject<{
            answer: z.ZodString;
            language: z.ZodEnum<["en", "te"]>;
            uncertainty: z.ZodString;
            followUpQuestions: z.ZodArray<z.ZodString, "many">;
            sourceIds: z.ZodArray<z.ZodString, "many">;
            safetyNote: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            sourceIds: string[];
            uncertainty: string;
            answer: string;
            language: "en" | "te";
            followUpQuestions: string[];
            safetyNote: string;
        }, {
            sourceIds: string[];
            uncertainty: string;
            answer: string;
            language: "en" | "te";
            followUpQuestions: string[];
            safetyNote: string;
        }>>>;
        provider: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        model: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        createdAt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
        createdAt: string;
        ownerId: string;
        content: string;
        conversationId: string;
        role: "user" | "assistant";
        provider?: string | null | undefined;
        structuredAdvice?: {
            sourceIds: string[];
            uncertainty: string;
            answer: string;
            language: "en" | "te";
            followUpQuestions: string[];
            safetyNote: string;
        } | null | undefined;
        model?: string | null | undefined;
    }, {
        id: string;
        createdAt: string;
        ownerId: string;
        content: string;
        conversationId: string;
        role: "user" | "assistant";
        provider?: string | null | undefined;
        structuredAdvice?: {
            sourceIds: string[];
            uncertainty: string;
            answer: string;
            language: "en" | "te";
            followUpQuestions: string[];
            safetyNote: string;
        } | null | undefined;
        model?: string | null | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: string;
    updatedAt: string;
    ownerId: string;
    language: "en" | "te";
    farmId?: string | null | undefined;
    fieldId?: string | null | undefined;
    title?: string | null | undefined;
    messages?: {
        id: string;
        createdAt: string;
        ownerId: string;
        content: string;
        conversationId: string;
        role: "user" | "assistant";
        provider?: string | null | undefined;
        structuredAdvice?: {
            sourceIds: string[];
            uncertainty: string;
            answer: string;
            language: "en" | "te";
            followUpQuestions: string[];
            safetyNote: string;
        } | null | undefined;
        model?: string | null | undefined;
    }[] | undefined;
}, {
    id: string;
    createdAt: string;
    updatedAt: string;
    ownerId: string;
    language: "en" | "te";
    farmId?: string | null | undefined;
    fieldId?: string | null | undefined;
    title?: string | null | undefined;
    messages?: {
        id: string;
        createdAt: string;
        ownerId: string;
        content: string;
        conversationId: string;
        role: "user" | "assistant";
        provider?: string | null | undefined;
        structuredAdvice?: {
            sourceIds: string[];
            uncertainty: string;
            answer: string;
            language: "en" | "te";
            followUpQuestions: string[];
            safetyNote: string;
        } | null | undefined;
        model?: string | null | undefined;
    }[] | undefined;
}>;
export type Conversation = z.infer<typeof ConversationSchema>;
//# sourceMappingURL=assistant.d.ts.map