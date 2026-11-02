import { z } from 'zod';
export declare const CropNamesSchema: z.ZodObject<{
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
export declare const ClimateRequirementsSchema: z.ZodObject<{
    tempMinC: z.ZodNumber;
    tempMaxC: z.ZodNumber;
    optimalTempMinC: z.ZodNumber;
    optimalTempMaxC: z.ZodNumber;
    rainfallMinMm: z.ZodNumber;
    rainfallMaxMm: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    tempMinC: number;
    tempMaxC: number;
    optimalTempMinC: number;
    optimalTempMaxC: number;
    rainfallMinMm: number;
    rainfallMaxMm: number;
}, {
    tempMinC: number;
    tempMaxC: number;
    optimalTempMinC: number;
    optimalTempMaxC: number;
    rainfallMinMm: number;
    rainfallMaxMm: number;
}>;
export declare const SoilRequirementsSchema: z.ZodObject<{
    phMin: z.ZodNumber;
    phMax: z.ZodNumber;
    optimalPhMin: z.ZodNumber;
    optimalPhMax: z.ZodNumber;
    preferredSoilTypes: z.ZodArray<z.ZodString, "many">;
    nitrogenNeed: z.ZodEnum<["low", "medium", "high"]>;
    phosphorusNeed: z.ZodEnum<["low", "medium", "high"]>;
    potassiumNeed: z.ZodEnum<["low", "medium", "high"]>;
    drainageRequirement: z.ZodString;
}, "strip", z.ZodTypeAny, {
    phMin: number;
    phMax: number;
    optimalPhMin: number;
    optimalPhMax: number;
    preferredSoilTypes: string[];
    nitrogenNeed: "low" | "medium" | "high";
    phosphorusNeed: "low" | "medium" | "high";
    potassiumNeed: "low" | "medium" | "high";
    drainageRequirement: string;
}, {
    phMin: number;
    phMax: number;
    optimalPhMin: number;
    optimalPhMax: number;
    preferredSoilTypes: string[];
    nitrogenNeed: "low" | "medium" | "high";
    phosphorusNeed: "low" | "medium" | "high";
    potassiumNeed: "low" | "medium" | "high";
    drainageRequirement: string;
}>;
export declare const SourceReferenceSchema: z.ZodObject<{
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
}>;
export declare const CropCatalogItemSchema: z.ZodObject<{
    id: z.ZodString;
    cropCode: z.ZodString;
    names: z.ZodObject<{
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
    seasonTags: z.ZodArray<z.ZodString, "many">;
    climateRequirements: z.ZodObject<{
        tempMinC: z.ZodNumber;
        tempMaxC: z.ZodNumber;
        optimalTempMinC: z.ZodNumber;
        optimalTempMaxC: z.ZodNumber;
        rainfallMinMm: z.ZodNumber;
        rainfallMaxMm: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        tempMinC: number;
        tempMaxC: number;
        optimalTempMinC: number;
        optimalTempMaxC: number;
        rainfallMinMm: number;
        rainfallMaxMm: number;
    }, {
        tempMinC: number;
        tempMaxC: number;
        optimalTempMinC: number;
        optimalTempMaxC: number;
        rainfallMinMm: number;
        rainfallMaxMm: number;
    }>;
    soilRequirements: z.ZodObject<{
        phMin: z.ZodNumber;
        phMax: z.ZodNumber;
        optimalPhMin: z.ZodNumber;
        optimalPhMax: z.ZodNumber;
        preferredSoilTypes: z.ZodArray<z.ZodString, "many">;
        nitrogenNeed: z.ZodEnum<["low", "medium", "high"]>;
        phosphorusNeed: z.ZodEnum<["low", "medium", "high"]>;
        potassiumNeed: z.ZodEnum<["low", "medium", "high"]>;
        drainageRequirement: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        phMin: number;
        phMax: number;
        optimalPhMin: number;
        optimalPhMax: number;
        preferredSoilTypes: string[];
        nitrogenNeed: "low" | "medium" | "high";
        phosphorusNeed: "low" | "medium" | "high";
        potassiumNeed: "low" | "medium" | "high";
        drainageRequirement: string;
    }, {
        phMin: number;
        phMax: number;
        optimalPhMin: number;
        optimalPhMax: number;
        preferredSoilTypes: string[];
        nitrogenNeed: "low" | "medium" | "high";
        phosphorusNeed: "low" | "medium" | "high";
        potassiumNeed: "low" | "medium" | "high";
        drainageRequirement: string;
    }>;
    irrigationNotes: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    regionCodes: z.ZodArray<z.ZodString, "many">;
    sourceReferences: z.ZodArray<z.ZodObject<{
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
    dataVersion: z.ZodString;
    verifiedAt: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    active: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    id: string;
    cropCode: string;
    names: {
        en: string;
        te: string;
        botanical?: string | undefined;
    };
    seasonTags: string[];
    climateRequirements: {
        tempMinC: number;
        tempMaxC: number;
        optimalTempMinC: number;
        optimalTempMaxC: number;
        rainfallMinMm: number;
        rainfallMaxMm: number;
    };
    soilRequirements: {
        phMin: number;
        phMax: number;
        optimalPhMin: number;
        optimalPhMax: number;
        preferredSoilTypes: string[];
        nitrogenNeed: "low" | "medium" | "high";
        phosphorusNeed: "low" | "medium" | "high";
        potassiumNeed: "low" | "medium" | "high";
        drainageRequirement: string;
    };
    regionCodes: string[];
    sourceReferences: {
        id: string;
        title: string;
        publisher: string;
        year?: number | undefined;
        url?: string | undefined;
    }[];
    dataVersion: string;
    active: boolean;
    irrigationNotes?: Record<string, string> | undefined;
    verifiedAt?: string | null | undefined;
}, {
    id: string;
    cropCode: string;
    names: {
        en: string;
        te: string;
        botanical?: string | undefined;
    };
    seasonTags: string[];
    climateRequirements: {
        tempMinC: number;
        tempMaxC: number;
        optimalTempMinC: number;
        optimalTempMaxC: number;
        rainfallMinMm: number;
        rainfallMaxMm: number;
    };
    soilRequirements: {
        phMin: number;
        phMax: number;
        optimalPhMin: number;
        optimalPhMax: number;
        preferredSoilTypes: string[];
        nitrogenNeed: "low" | "medium" | "high";
        phosphorusNeed: "low" | "medium" | "high";
        potassiumNeed: "low" | "medium" | "high";
        drainageRequirement: string;
    };
    regionCodes: string[];
    sourceReferences: {
        id: string;
        title: string;
        publisher: string;
        year?: number | undefined;
        url?: string | undefined;
    }[];
    dataVersion: string;
    irrigationNotes?: Record<string, string> | undefined;
    verifiedAt?: string | null | undefined;
    active?: boolean | undefined;
}>;
export type CropCatalogItem = z.infer<typeof CropCatalogItemSchema>;
export declare const CropRecommendationRequestSchema: z.ZodObject<{
    fieldId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    plannedSeason: z.ZodEnum<["kharif", "rabi", "zaid", "all_year"]>;
    currentCropRotation: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    hasIrrigation: z.ZodDefault<z.ZodBoolean>;
    soilOverrides: z.ZodOptional<z.ZodObject<{
        ph: z.ZodOptional<z.ZodNumber>;
        moisturePct: z.ZodOptional<z.ZodNumber>;
        nitrogenValue: z.ZodOptional<z.ZodNumber>;
        phosphorusValue: z.ZodOptional<z.ZodNumber>;
        potassiumValue: z.ZodOptional<z.ZodNumber>;
        soilType: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        soilType?: string | undefined;
        moisturePct?: number | undefined;
        ph?: number | undefined;
        nitrogenValue?: number | undefined;
        phosphorusValue?: number | undefined;
        potassiumValue?: number | undefined;
    }, {
        soilType?: string | undefined;
        moisturePct?: number | undefined;
        ph?: number | undefined;
        nitrogenValue?: number | undefined;
        phosphorusValue?: number | undefined;
        potassiumValue?: number | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    plannedSeason: "kharif" | "rabi" | "zaid" | "all_year";
    hasIrrigation: boolean;
    fieldId?: string | null | undefined;
    currentCropRotation?: string | null | undefined;
    soilOverrides?: {
        soilType?: string | undefined;
        moisturePct?: number | undefined;
        ph?: number | undefined;
        nitrogenValue?: number | undefined;
        phosphorusValue?: number | undefined;
        potassiumValue?: number | undefined;
    } | undefined;
}, {
    plannedSeason: "kharif" | "rabi" | "zaid" | "all_year";
    fieldId?: string | null | undefined;
    currentCropRotation?: string | null | undefined;
    hasIrrigation?: boolean | undefined;
    soilOverrides?: {
        soilType?: string | undefined;
        moisturePct?: number | undefined;
        ph?: number | undefined;
        nitrogenValue?: number | undefined;
        phosphorusValue?: number | undefined;
        potassiumValue?: number | undefined;
    } | undefined;
}>;
export type CropRecommendationRequest = z.infer<typeof CropRecommendationRequestSchema>;
export declare const CropScoreBreakdownSchema: z.ZodObject<{
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
}>;
export type CropScoreBreakdown = z.infer<typeof CropScoreBreakdownSchema>;
export declare const CropRecommendationExplanationSchema: z.ZodObject<{
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
export type CropRecommendationExplanation = z.infer<typeof CropRecommendationExplanationSchema>;
export declare const CropRecommendationResultSchema: z.ZodObject<{
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
}>;
export type CropRecommendationResult = z.infer<typeof CropRecommendationResultSchema>;
//# sourceMappingURL=crops.d.ts.map