import { z } from 'zod';
export declare const HistoryQuerySchema: z.ZodObject<{
    type: z.ZodDefault<z.ZodEnum<["all", "disease", "soil", "weather", "recommendation", "conversation"]>>;
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    search: z.ZodOptional<z.ZodString>;
    farmId: z.ZodOptional<z.ZodString>;
    startDate: z.ZodOptional<z.ZodString>;
    endDate: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: "all" | "disease" | "soil" | "weather" | "recommendation" | "conversation";
    page: number;
    limit: number;
    search?: string | undefined;
    farmId?: string | undefined;
    startDate?: string | undefined;
    endDate?: string | undefined;
}, {
    type?: "all" | "disease" | "soil" | "weather" | "recommendation" | "conversation" | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    search?: string | undefined;
    farmId?: string | undefined;
    startDate?: string | undefined;
    endDate?: string | undefined;
}>;
export type HistoryQuery = z.infer<typeof HistoryQuerySchema>;
export declare const HistoryItemSchema: z.ZodObject<{
    id: z.ZodString;
    type: z.ZodEnum<["disease", "soil", "weather", "recommendation", "conversation"]>;
    title: z.ZodString;
    summary: z.ZodString;
    farmName: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    fieldName: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    timestamp: z.ZodString;
    details: z.ZodRecord<z.ZodString, z.ZodAny>;
}, "strip", z.ZodTypeAny, {
    type: "disease" | "soil" | "weather" | "recommendation" | "conversation";
    details: Record<string, any>;
    timestamp: string;
    id: string;
    summary: string;
    title: string;
    farmName?: string | null | undefined;
    fieldName?: string | null | undefined;
}, {
    type: "disease" | "soil" | "weather" | "recommendation" | "conversation";
    details: Record<string, any>;
    timestamp: string;
    id: string;
    summary: string;
    title: string;
    farmName?: string | null | undefined;
    fieldName?: string | null | undefined;
}>;
export type HistoryItem = z.infer<typeof HistoryItemSchema>;
export declare const HistoryResponseSchema: z.ZodObject<{
    items: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        type: z.ZodEnum<["disease", "soil", "weather", "recommendation", "conversation"]>;
        title: z.ZodString;
        summary: z.ZodString;
        farmName: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        fieldName: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        timestamp: z.ZodString;
        details: z.ZodRecord<z.ZodString, z.ZodAny>;
    }, "strip", z.ZodTypeAny, {
        type: "disease" | "soil" | "weather" | "recommendation" | "conversation";
        details: Record<string, any>;
        timestamp: string;
        id: string;
        summary: string;
        title: string;
        farmName?: string | null | undefined;
        fieldName?: string | null | undefined;
    }, {
        type: "disease" | "soil" | "weather" | "recommendation" | "conversation";
        details: Record<string, any>;
        timestamp: string;
        id: string;
        summary: string;
        title: string;
        farmName?: string | null | undefined;
        fieldName?: string | null | undefined;
    }>, "many">;
    totalCount: z.ZodNumber;
    page: z.ZodNumber;
    totalPages: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    page: number;
    items: {
        type: "disease" | "soil" | "weather" | "recommendation" | "conversation";
        details: Record<string, any>;
        timestamp: string;
        id: string;
        summary: string;
        title: string;
        farmName?: string | null | undefined;
        fieldName?: string | null | undefined;
    }[];
    totalCount: number;
    totalPages: number;
}, {
    page: number;
    items: {
        type: "disease" | "soil" | "weather" | "recommendation" | "conversation";
        details: Record<string, any>;
        timestamp: string;
        id: string;
        summary: string;
        title: string;
        farmName?: string | null | undefined;
        fieldName?: string | null | undefined;
    }[];
    totalCount: number;
    totalPages: number;
}>;
export type HistoryResponse = z.infer<typeof HistoryResponseSchema>;
export declare const AccountDataExportSchema: z.ZodObject<{
    user: z.ZodRecord<z.ZodString, z.ZodAny>;
    farms: z.ZodArray<z.ZodRecord<z.ZodString, z.ZodAny>, "many">;
    fields: z.ZodArray<z.ZodRecord<z.ZodString, z.ZodAny>, "many">;
    soilReadings: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        ownerId: z.ZodString;
        fieldId: z.ZodString;
        observedAt: z.ZodString;
        moisturePct: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
        temperatureC: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
        ph: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
        nitrogenValue: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
        phosphorusValue: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
        potassiumValue: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
        npkUnit: z.ZodNullable<z.ZodOptional<z.ZodDefault<z.ZodEnum<["kg_per_ha", "ppm", "mg_per_kg"]>>>>;
        source: z.ZodDefault<z.ZodEnum<["manual", "sensor", "import"]>>;
        notes: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        createdAt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
        createdAt: string;
        ownerId: string;
        fieldId: string;
        observedAt: string;
        source: "manual" | "sensor" | "import";
        notes?: string | null | undefined;
        moisturePct?: number | null | undefined;
        temperatureC?: number | null | undefined;
        ph?: number | null | undefined;
        nitrogenValue?: number | null | undefined;
        phosphorusValue?: number | null | undefined;
        potassiumValue?: number | null | undefined;
        npkUnit?: "kg_per_ha" | "ppm" | "mg_per_kg" | null | undefined;
    }, {
        id: string;
        createdAt: string;
        ownerId: string;
        fieldId: string;
        observedAt: string;
        notes?: string | null | undefined;
        moisturePct?: number | null | undefined;
        temperatureC?: number | null | undefined;
        ph?: number | null | undefined;
        nitrogenValue?: number | null | undefined;
        phosphorusValue?: number | null | undefined;
        potassiumValue?: number | null | undefined;
        npkUnit?: "kg_per_ha" | "ppm" | "mg_per_kg" | null | undefined;
        source?: "manual" | "sensor" | "import" | undefined;
    }>, "many">;
    diseaseAssessments: z.ZodArray<z.ZodObject<{
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
    }>, "many">;
    cropRecommendations: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        ownerId: z.ZodString;
        farmId: z.ZodString;
        fieldId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        recommendationType: z.ZodLiteral<"crop">;
        inputSnapshot: z.ZodRecord<z.ZodString, z.ZodAny>;
        rankedCrops: z.ZodArray<z.ZodObject<{
            cropCode: z.ZodString;
            cropName: z.ZodObject<{
                en: z.ZodString;
                te: z.ZodString;
                botanical: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                en: string;
                te: string;
                botanical?: string | undefined;
            }, {
                en: string;
                te: string;
                botanical?: string | undefined;
            }>;
            overallScore: z.ZodNumber;
            suitabilityLevel: z.ZodEnum<["highly_suitable", "moderately_suitable", "marginally_suitable", "not_recommended"]>;
            scores: z.ZodObject<{
                phScore: z.ZodNumber;
                moistureScore: z.ZodNumber;
                seasonScore: z.ZodNumber;
                temperatureScore: z.ZodNumber;
                npkScore: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                phScore: number;
                moistureScore: number;
                seasonScore: number;
                temperatureScore: number;
                npkScore: number;
            }, {
                phScore: number;
                moistureScore: number;
                seasonScore: number;
                temperatureScore: number;
                npkScore: number;
            }>;
            supportingInputIds: z.ZodArray<z.ZodString, "many">;
            matchingFactors: z.ZodArray<z.ZodString, "many">;
            limitingFactors: z.ZodArray<z.ZodString, "many">;
            sources: z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                title: z.ZodString;
                publisher: z.ZodString;
                year: z.ZodOptional<z.ZodNumber>;
                url: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                id: string;
                title: string;
                publisher: string;
                year?: number | undefined;
                url?: string | undefined;
            }, {
                id: string;
                title: string;
                publisher: string;
                year?: number | undefined;
                url?: string | undefined;
            }>, "many">;
        }, "strip", z.ZodTypeAny, {
            cropCode: string;
            cropName: {
                en: string;
                te: string;
                botanical?: string | undefined;
            };
            overallScore: number;
            suitabilityLevel: "highly_suitable" | "moderately_suitable" | "marginally_suitable" | "not_recommended";
            scores: {
                phScore: number;
                moistureScore: number;
                seasonScore: number;
                temperatureScore: number;
                npkScore: number;
            };
            supportingInputIds: string[];
            matchingFactors: string[];
            limitingFactors: string[];
            sources: {
                id: string;
                title: string;
                publisher: string;
                year?: number | undefined;
                url?: string | undefined;
            }[];
        }, {
            cropCode: string;
            cropName: {
                en: string;
                te: string;
                botanical?: string | undefined;
            };
            overallScore: number;
            suitabilityLevel: "highly_suitable" | "moderately_suitable" | "marginally_suitable" | "not_recommended";
            scores: {
                phScore: number;
                moistureScore: number;
                seasonScore: number;
                temperatureScore: number;
                npkScore: number;
            };
            supportingInputIds: string[];
            matchingFactors: string[];
            limitingFactors: string[];
            sources: {
                id: string;
                title: string;
                publisher: string;
                year?: number | undefined;
                url?: string | undefined;
            }[];
        }>, "many">;
        explanation: z.ZodObject<{
            summary: z.ZodString;
            recommendationReasons: z.ZodArray<z.ZodObject<{
                cropCode: z.ZodString;
                reason: z.ZodString;
                supportingInputIds: z.ZodArray<z.ZodString, "many">;
            }, "strip", z.ZodTypeAny, {
                cropCode: string;
                supportingInputIds: string[];
                reason: string;
            }, {
                cropCode: string;
                supportingInputIds: string[];
                reason: string;
            }>, "many">;
            missingInputs: z.ZodArray<z.ZodString, "many">;
            sourceIds: z.ZodArray<z.ZodString, "many">;
            uncertainty: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            sourceIds: string[];
            summary: string;
            uncertainty: string;
            recommendationReasons: {
                cropCode: string;
                supportingInputIds: string[];
                reason: string;
            }[];
            missingInputs: string[];
        }, {
            sourceIds: string[];
            summary: string;
            uncertainty: string;
            recommendationReasons: {
                cropCode: string;
                supportingInputIds: string[];
                reason: string;
            }[];
            missingInputs: string[];
        }>;
        dataSources: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            title: z.ZodString;
            publisher: z.ZodString;
            year: z.ZodOptional<z.ZodNumber>;
            url: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            title: string;
            publisher: string;
            year?: number | undefined;
            url?: string | undefined;
        }, {
            id: string;
            title: string;
            publisher: string;
            year?: number | undefined;
            url?: string | undefined;
        }>, "many">;
        engineVersion: z.ZodString;
        createdAt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
        createdAt: string;
        ownerId: string;
        farmId: string;
        recommendationType: "crop";
        inputSnapshot: Record<string, any>;
        rankedCrops: {
            cropCode: string;
            cropName: {
                en: string;
                te: string;
                botanical?: string | undefined;
            };
            overallScore: number;
            suitabilityLevel: "highly_suitable" | "moderately_suitable" | "marginally_suitable" | "not_recommended";
            scores: {
                phScore: number;
                moistureScore: number;
                seasonScore: number;
                temperatureScore: number;
                npkScore: number;
            };
            supportingInputIds: string[];
            matchingFactors: string[];
            limitingFactors: string[];
            sources: {
                id: string;
                title: string;
                publisher: string;
                year?: number | undefined;
                url?: string | undefined;
            }[];
        }[];
        explanation: {
            sourceIds: string[];
            summary: string;
            uncertainty: string;
            recommendationReasons: {
                cropCode: string;
                supportingInputIds: string[];
                reason: string;
            }[];
            missingInputs: string[];
        };
        dataSources: {
            id: string;
            title: string;
            publisher: string;
            year?: number | undefined;
            url?: string | undefined;
        }[];
        engineVersion: string;
        fieldId?: string | null | undefined;
    }, {
        id: string;
        createdAt: string;
        ownerId: string;
        farmId: string;
        recommendationType: "crop";
        inputSnapshot: Record<string, any>;
        rankedCrops: {
            cropCode: string;
            cropName: {
                en: string;
                te: string;
                botanical?: string | undefined;
            };
            overallScore: number;
            suitabilityLevel: "highly_suitable" | "moderately_suitable" | "marginally_suitable" | "not_recommended";
            scores: {
                phScore: number;
                moistureScore: number;
                seasonScore: number;
                temperatureScore: number;
                npkScore: number;
            };
            supportingInputIds: string[];
            matchingFactors: string[];
            limitingFactors: string[];
            sources: {
                id: string;
                title: string;
                publisher: string;
                year?: number | undefined;
                url?: string | undefined;
            }[];
        }[];
        explanation: {
            sourceIds: string[];
            summary: string;
            uncertainty: string;
            recommendationReasons: {
                cropCode: string;
                supportingInputIds: string[];
                reason: string;
            }[];
            missingInputs: string[];
        };
        dataSources: {
            id: string;
            title: string;
            publisher: string;
            year?: number | undefined;
            url?: string | undefined;
        }[];
        engineVersion: string;
        fieldId?: string | null | undefined;
    }>, "many">;
    weatherSnapshots: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        ownerId: z.ZodString;
        farmId: z.ZodString;
        provider: z.ZodString;
        forecastStart: z.ZodString;
        forecastEnd: z.ZodString;
        forecast: z.ZodObject<{
            current: z.ZodObject<{
                time: z.ZodString;
                temperatureC: z.ZodNumber;
                humidityPct: z.ZodNumber;
                windSpeedKmh: z.ZodNumber;
                precipitationMm: z.ZodNumber;
                weatherCode: z.ZodNumber;
                conditionText: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                temperatureC: number;
                weatherCode: number;
                conditionText: string;
                time: string;
                precipitationMm: number;
                humidityPct: number;
                windSpeedKmh: number;
            }, {
                temperatureC: number;
                weatherCode: number;
                conditionText: string;
                time: string;
                precipitationMm: number;
                humidityPct: number;
                windSpeedKmh: number;
            }>;
            daily: z.ZodArray<z.ZodObject<{
                date: z.ZodString;
                temperatureMaxC: z.ZodNumber;
                temperatureMinC: z.ZodNumber;
                precipitationSumMm: z.ZodNumber;
                precipitationProbabilityPct: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
                windSpeedMaxKmh: z.ZodNumber;
                humidityAvgPct: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
                weatherCode: z.ZodNumber;
                conditionText: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                date: string;
                temperatureMaxC: number;
                temperatureMinC: number;
                precipitationSumMm: number;
                windSpeedMaxKmh: number;
                weatherCode: number;
                conditionText: string;
                precipitationProbabilityPct?: number | null | undefined;
                humidityAvgPct?: number | null | undefined;
            }, {
                date: string;
                temperatureMaxC: number;
                temperatureMinC: number;
                precipitationSumMm: number;
                windSpeedMaxKmh: number;
                weatherCode: number;
                conditionText: string;
                precipitationProbabilityPct?: number | null | undefined;
                humidityAvgPct?: number | null | undefined;
            }>, "many">;
            hourly: z.ZodOptional<z.ZodArray<z.ZodObject<{
                time: z.ZodString;
                temperatureC: z.ZodNumber;
                precipitationMm: z.ZodNumber;
                humidityPct: z.ZodNumber;
                windSpeedKmh: z.ZodNumber;
                weatherCode: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                temperatureC: number;
                weatherCode: number;
                time: string;
                precipitationMm: number;
                humidityPct: number;
                windSpeedKmh: number;
            }, {
                temperatureC: number;
                weatherCode: number;
                time: string;
                precipitationMm: number;
                humidityPct: number;
                windSpeedKmh: number;
            }>, "many">>;
        }, "strip", z.ZodTypeAny, {
            current: {
                temperatureC: number;
                weatherCode: number;
                conditionText: string;
                time: string;
                precipitationMm: number;
                humidityPct: number;
                windSpeedKmh: number;
            };
            daily: {
                date: string;
                temperatureMaxC: number;
                temperatureMinC: number;
                precipitationSumMm: number;
                windSpeedMaxKmh: number;
                weatherCode: number;
                conditionText: string;
                precipitationProbabilityPct?: number | null | undefined;
                humidityAvgPct?: number | null | undefined;
            }[];
            hourly?: {
                temperatureC: number;
                weatherCode: number;
                time: string;
                precipitationMm: number;
                humidityPct: number;
                windSpeedKmh: number;
            }[] | undefined;
        }, {
            current: {
                temperatureC: number;
                weatherCode: number;
                conditionText: string;
                time: string;
                precipitationMm: number;
                humidityPct: number;
                windSpeedKmh: number;
            };
            daily: {
                date: string;
                temperatureMaxC: number;
                temperatureMinC: number;
                precipitationSumMm: number;
                windSpeedMaxKmh: number;
                weatherCode: number;
                conditionText: string;
                precipitationProbabilityPct?: number | null | undefined;
                humidityAvgPct?: number | null | undefined;
            }[];
            hourly?: {
                temperatureC: number;
                weatherCode: number;
                time: string;
                precipitationMm: number;
                humidityPct: number;
                windSpeedKmh: number;
            }[] | undefined;
        }>;
        fetchedAt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
        ownerId: string;
        farmId: string;
        provider: string;
        forecastStart: string;
        forecastEnd: string;
        forecast: {
            current: {
                temperatureC: number;
                weatherCode: number;
                conditionText: string;
                time: string;
                precipitationMm: number;
                humidityPct: number;
                windSpeedKmh: number;
            };
            daily: {
                date: string;
                temperatureMaxC: number;
                temperatureMinC: number;
                precipitationSumMm: number;
                windSpeedMaxKmh: number;
                weatherCode: number;
                conditionText: string;
                precipitationProbabilityPct?: number | null | undefined;
                humidityAvgPct?: number | null | undefined;
            }[];
            hourly?: {
                temperatureC: number;
                weatherCode: number;
                time: string;
                precipitationMm: number;
                humidityPct: number;
                windSpeedKmh: number;
            }[] | undefined;
        };
        fetchedAt: string;
    }, {
        id: string;
        ownerId: string;
        farmId: string;
        provider: string;
        forecastStart: string;
        forecastEnd: string;
        forecast: {
            current: {
                temperatureC: number;
                weatherCode: number;
                conditionText: string;
                time: string;
                precipitationMm: number;
                humidityPct: number;
                windSpeedKmh: number;
            };
            daily: {
                date: string;
                temperatureMaxC: number;
                temperatureMinC: number;
                precipitationSumMm: number;
                windSpeedMaxKmh: number;
                weatherCode: number;
                conditionText: string;
                precipitationProbabilityPct?: number | null | undefined;
                humidityAvgPct?: number | null | undefined;
            }[];
            hourly?: {
                temperatureC: number;
                weatherCode: number;
                time: string;
                precipitationMm: number;
                humidityPct: number;
                windSpeedKmh: number;
            }[] | undefined;
        };
        fetchedAt: string;
    }>, "many">;
    conversations: z.ZodArray<z.ZodObject<{
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
    }>, "many">;
    exportedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    user: Record<string, any>;
    farms: Record<string, any>[];
    fields: Record<string, any>[];
    soilReadings: {
        id: string;
        createdAt: string;
        ownerId: string;
        fieldId: string;
        observedAt: string;
        source: "manual" | "sensor" | "import";
        notes?: string | null | undefined;
        moisturePct?: number | null | undefined;
        temperatureC?: number | null | undefined;
        ph?: number | null | undefined;
        nitrogenValue?: number | null | undefined;
        phosphorusValue?: number | null | undefined;
        potassiumValue?: number | null | undefined;
        npkUnit?: "kg_per_ha" | "ppm" | "mg_per_kg" | null | undefined;
    }[];
    diseaseAssessments: {
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
    }[];
    cropRecommendations: {
        id: string;
        createdAt: string;
        ownerId: string;
        farmId: string;
        recommendationType: "crop";
        inputSnapshot: Record<string, any>;
        rankedCrops: {
            cropCode: string;
            cropName: {
                en: string;
                te: string;
                botanical?: string | undefined;
            };
            overallScore: number;
            suitabilityLevel: "highly_suitable" | "moderately_suitable" | "marginally_suitable" | "not_recommended";
            scores: {
                phScore: number;
                moistureScore: number;
                seasonScore: number;
                temperatureScore: number;
                npkScore: number;
            };
            supportingInputIds: string[];
            matchingFactors: string[];
            limitingFactors: string[];
            sources: {
                id: string;
                title: string;
                publisher: string;
                year?: number | undefined;
                url?: string | undefined;
            }[];
        }[];
        explanation: {
            sourceIds: string[];
            summary: string;
            uncertainty: string;
            recommendationReasons: {
                cropCode: string;
                supportingInputIds: string[];
                reason: string;
            }[];
            missingInputs: string[];
        };
        dataSources: {
            id: string;
            title: string;
            publisher: string;
            year?: number | undefined;
            url?: string | undefined;
        }[];
        engineVersion: string;
        fieldId?: string | null | undefined;
    }[];
    weatherSnapshots: {
        id: string;
        ownerId: string;
        farmId: string;
        provider: string;
        forecastStart: string;
        forecastEnd: string;
        forecast: {
            current: {
                temperatureC: number;
                weatherCode: number;
                conditionText: string;
                time: string;
                precipitationMm: number;
                humidityPct: number;
                windSpeedKmh: number;
            };
            daily: {
                date: string;
                temperatureMaxC: number;
                temperatureMinC: number;
                precipitationSumMm: number;
                windSpeedMaxKmh: number;
                weatherCode: number;
                conditionText: string;
                precipitationProbabilityPct?: number | null | undefined;
                humidityAvgPct?: number | null | undefined;
            }[];
            hourly?: {
                temperatureC: number;
                weatherCode: number;
                time: string;
                precipitationMm: number;
                humidityPct: number;
                windSpeedKmh: number;
            }[] | undefined;
        };
        fetchedAt: string;
    }[];
    conversations: {
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
    }[];
    exportedAt: string;
}, {
    user: Record<string, any>;
    farms: Record<string, any>[];
    fields: Record<string, any>[];
    soilReadings: {
        id: string;
        createdAt: string;
        ownerId: string;
        fieldId: string;
        observedAt: string;
        notes?: string | null | undefined;
        moisturePct?: number | null | undefined;
        temperatureC?: number | null | undefined;
        ph?: number | null | undefined;
        nitrogenValue?: number | null | undefined;
        phosphorusValue?: number | null | undefined;
        potassiumValue?: number | null | undefined;
        npkUnit?: "kg_per_ha" | "ppm" | "mg_per_kg" | null | undefined;
        source?: "manual" | "sensor" | "import" | undefined;
    }[];
    diseaseAssessments: {
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
    }[];
    cropRecommendations: {
        id: string;
        createdAt: string;
        ownerId: string;
        farmId: string;
        recommendationType: "crop";
        inputSnapshot: Record<string, any>;
        rankedCrops: {
            cropCode: string;
            cropName: {
                en: string;
                te: string;
                botanical?: string | undefined;
            };
            overallScore: number;
            suitabilityLevel: "highly_suitable" | "moderately_suitable" | "marginally_suitable" | "not_recommended";
            scores: {
                phScore: number;
                moistureScore: number;
                seasonScore: number;
                temperatureScore: number;
                npkScore: number;
            };
            supportingInputIds: string[];
            matchingFactors: string[];
            limitingFactors: string[];
            sources: {
                id: string;
                title: string;
                publisher: string;
                year?: number | undefined;
                url?: string | undefined;
            }[];
        }[];
        explanation: {
            sourceIds: string[];
            summary: string;
            uncertainty: string;
            recommendationReasons: {
                cropCode: string;
                supportingInputIds: string[];
                reason: string;
            }[];
            missingInputs: string[];
        };
        dataSources: {
            id: string;
            title: string;
            publisher: string;
            year?: number | undefined;
            url?: string | undefined;
        }[];
        engineVersion: string;
        fieldId?: string | null | undefined;
    }[];
    weatherSnapshots: {
        id: string;
        ownerId: string;
        farmId: string;
        provider: string;
        forecastStart: string;
        forecastEnd: string;
        forecast: {
            current: {
                temperatureC: number;
                weatherCode: number;
                conditionText: string;
                time: string;
                precipitationMm: number;
                humidityPct: number;
                windSpeedKmh: number;
            };
            daily: {
                date: string;
                temperatureMaxC: number;
                temperatureMinC: number;
                precipitationSumMm: number;
                windSpeedMaxKmh: number;
                weatherCode: number;
                conditionText: string;
                precipitationProbabilityPct?: number | null | undefined;
                humidityAvgPct?: number | null | undefined;
            }[];
            hourly?: {
                temperatureC: number;
                weatherCode: number;
                time: string;
                precipitationMm: number;
                humidityPct: number;
                windSpeedKmh: number;
            }[] | undefined;
        };
        fetchedAt: string;
    }[];
    conversations: {
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
    }[];
    exportedAt: string;
}>;
export type AccountDataExport = z.infer<typeof AccountDataExportSchema>;
export declare const DeleteAccountSchema: z.ZodObject<{
    confirmation: z.ZodLiteral<"DELETE_MY_ACCOUNT">;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    password: string;
    confirmation: "DELETE_MY_ACCOUNT";
}, {
    password: string;
    confirmation: "DELETE_MY_ACCOUNT";
}>;
export type DeleteAccount = z.infer<typeof DeleteAccountSchema>;
//# sourceMappingURL=history.d.ts.map