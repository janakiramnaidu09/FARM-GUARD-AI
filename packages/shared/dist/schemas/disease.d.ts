import { z } from 'zod';
export declare const AssessmentStatusSchema: z.ZodEnum<["completed", "uncertain", "unsupported", "failed"]>;
export type AssessmentStatus = z.infer<typeof AssessmentStatusSchema>;
export declare const ClassProbabilitySchema: z.ZodObject<{
    className: z.ZodString;
    displayName: z.ZodObject<{
        en: z.ZodString;
        te: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        en: string;
        te: string;
    }, {
        en: string;
        te: string;
    }>;
    crop: z.ZodString;
    probability: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    displayName: {
        en: string;
        te: string;
    };
    crop: string;
    className: string;
    probability: number;
}, {
    displayName: {
        en: string;
        te: string;
    };
    crop: string;
    className: string;
    probability: number;
}>;
export type ClassProbability = z.infer<typeof ClassProbabilitySchema>;
export declare const PracticalNextStepSchema: z.ZodObject<{
    action: z.ZodString;
    descriptionEn: z.ZodString;
    descriptionTe: z.ZodString;
    category: z.ZodEnum<["cultural_control", "sanitation", "monitoring", "expert_consultation", "retake_photo"]>;
}, "strip", z.ZodTypeAny, {
    action: string;
    descriptionEn: string;
    descriptionTe: string;
    category: "cultural_control" | "sanitation" | "monitoring" | "expert_consultation" | "retake_photo";
}, {
    action: string;
    descriptionEn: string;
    descriptionTe: string;
    category: "cultural_control" | "sanitation" | "monitoring" | "expert_consultation" | "retake_photo";
}>;
export type PracticalNextStep = z.infer<typeof PracticalNextStepSchema>;
export declare const DiseaseAssessmentResponseSchema: z.ZodObject<{
    status: z.ZodEnum<["completed", "uncertain", "unsupported", "failed"]>;
    predictedClass: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    predictedClassDisplayName: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        en: z.ZodString;
        te: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        en: string;
        te: string;
    }, {
        en: string;
        te: string;
    }>>>;
    confidence: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    classProbabilities: z.ZodDefault<z.ZodArray<z.ZodObject<{
        className: z.ZodString;
        displayName: z.ZodObject<{
            en: z.ZodString;
            te: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            en: string;
            te: string;
        }, {
            en: string;
            te: string;
        }>;
        crop: z.ZodString;
        probability: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        displayName: {
            en: string;
            te: string;
        };
        crop: string;
        className: string;
        probability: number;
    }, {
        displayName: {
            en: string;
            te: string;
        };
        crop: string;
        className: string;
        probability: number;
    }>, "many">>;
    modelVersion: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    abstentionReason: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    nextSteps: z.ZodDefault<z.ZodArray<z.ZodObject<{
        action: z.ZodString;
        descriptionEn: z.ZodString;
        descriptionTe: z.ZodString;
        category: z.ZodEnum<["cultural_control", "sanitation", "monitoring", "expert_consultation", "retake_photo"]>;
    }, "strip", z.ZodTypeAny, {
        action: string;
        descriptionEn: string;
        descriptionTe: string;
        category: "cultural_control" | "sanitation" | "monitoring" | "expert_consultation" | "retake_photo";
    }, {
        action: string;
        descriptionEn: string;
        descriptionTe: string;
        category: "cultural_control" | "sanitation" | "monitoring" | "expert_consultation" | "retake_photo";
    }>, "many">>;
    uncertaintyWarning: z.ZodString;
}, "strip", z.ZodTypeAny, {
    status: "completed" | "uncertain" | "unsupported" | "failed";
    classProbabilities: {
        displayName: {
            en: string;
            te: string;
        };
        crop: string;
        className: string;
        probability: number;
    }[];
    nextSteps: {
        action: string;
        descriptionEn: string;
        descriptionTe: string;
        category: "cultural_control" | "sanitation" | "monitoring" | "expert_consultation" | "retake_photo";
    }[];
    uncertaintyWarning: string;
    predictedClass?: string | null | undefined;
    predictedClassDisplayName?: {
        en: string;
        te: string;
    } | null | undefined;
    confidence?: number | null | undefined;
    modelVersion?: string | null | undefined;
    abstentionReason?: string | null | undefined;
}, {
    status: "completed" | "uncertain" | "unsupported" | "failed";
    uncertaintyWarning: string;
    predictedClass?: string | null | undefined;
    predictedClassDisplayName?: {
        en: string;
        te: string;
    } | null | undefined;
    confidence?: number | null | undefined;
    classProbabilities?: {
        displayName: {
            en: string;
            te: string;
        };
        crop: string;
        className: string;
        probability: number;
    }[] | undefined;
    modelVersion?: string | null | undefined;
    abstentionReason?: string | null | undefined;
    nextSteps?: {
        action: string;
        descriptionEn: string;
        descriptionTe: string;
        category: "cultural_control" | "sanitation" | "monitoring" | "expert_consultation" | "retake_photo";
    }[] | undefined;
}>;
export type DiseaseAssessmentResponse = z.infer<typeof DiseaseAssessmentResponseSchema>;
export declare const DiseaseAssessmentRecordSchema: z.ZodObject<{
    id: z.ZodString;
    ownerId: z.ZodString;
    fieldId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    cropCode: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    storageKey: z.ZodString;
    imageSha256: z.ZodString;
    predictedClass: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    confidence: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    status: z.ZodEnum<["completed", "uncertain", "unsupported", "failed"]>;
    abstentionReason: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    classProbabilities: z.ZodDefault<z.ZodArray<z.ZodObject<{
        className: z.ZodString;
        displayName: z.ZodObject<{
            en: z.ZodString;
            te: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            en: string;
            te: string;
        }, {
            en: string;
            te: string;
        }>;
        crop: z.ZodString;
        probability: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        displayName: {
            en: string;
            te: string;
        };
        crop: string;
        className: string;
        probability: number;
    }, {
        displayName: {
            en: string;
            te: string;
        };
        crop: string;
        className: string;
        probability: number;
    }>, "many">>;
    nextSteps: z.ZodDefault<z.ZodArray<z.ZodObject<{
        action: z.ZodString;
        descriptionEn: z.ZodString;
        descriptionTe: z.ZodString;
        category: z.ZodEnum<["cultural_control", "sanitation", "monitoring", "expert_consultation", "retake_photo"]>;
    }, "strip", z.ZodTypeAny, {
        action: string;
        descriptionEn: string;
        descriptionTe: string;
        category: "cultural_control" | "sanitation" | "monitoring" | "expert_consultation" | "retake_photo";
    }, {
        action: string;
        descriptionEn: string;
        descriptionTe: string;
        category: "cultural_control" | "sanitation" | "monitoring" | "expert_consultation" | "retake_photo";
    }>, "many">>;
    modelVersion: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    imageUrl: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodString;
    deletedAt: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    status: "completed" | "uncertain" | "unsupported" | "failed";
    id: string;
    createdAt: string;
    ownerId: string;
    classProbabilities: {
        displayName: {
            en: string;
            te: string;
        };
        crop: string;
        className: string;
        probability: number;
    }[];
    nextSteps: {
        action: string;
        descriptionEn: string;
        descriptionTe: string;
        category: "cultural_control" | "sanitation" | "monitoring" | "expert_consultation" | "retake_photo";
    }[];
    storageKey: string;
    imageSha256: string;
    fieldId?: string | null | undefined;
    cropCode?: string | null | undefined;
    predictedClass?: string | null | undefined;
    confidence?: number | null | undefined;
    modelVersion?: string | null | undefined;
    abstentionReason?: string | null | undefined;
    imageUrl?: string | undefined;
    deletedAt?: string | null | undefined;
}, {
    status: "completed" | "uncertain" | "unsupported" | "failed";
    id: string;
    createdAt: string;
    ownerId: string;
    storageKey: string;
    imageSha256: string;
    fieldId?: string | null | undefined;
    cropCode?: string | null | undefined;
    predictedClass?: string | null | undefined;
    confidence?: number | null | undefined;
    classProbabilities?: {
        displayName: {
            en: string;
            te: string;
        };
        crop: string;
        className: string;
        probability: number;
    }[] | undefined;
    modelVersion?: string | null | undefined;
    abstentionReason?: string | null | undefined;
    nextSteps?: {
        action: string;
        descriptionEn: string;
        descriptionTe: string;
        category: "cultural_control" | "sanitation" | "monitoring" | "expert_consultation" | "retake_photo";
    }[] | undefined;
    imageUrl?: string | undefined;
    deletedAt?: string | null | undefined;
}>;
export type DiseaseAssessmentRecord = z.infer<typeof DiseaseAssessmentRecordSchema>;
//# sourceMappingURL=disease.d.ts.map