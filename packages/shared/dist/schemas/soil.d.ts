import { z } from 'zod';
export declare const ReadingSourceSchema: z.ZodEnum<["manual", "sensor", "import"]>;
export type ReadingSource = z.infer<typeof ReadingSourceSchema>;
export declare const SoilReadingSchema: z.ZodObject<{
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
}>;
export type SoilReading = z.infer<typeof SoilReadingSchema>;
export declare const CreateSoilReadingSchema: z.ZodObject<{
    observedAt: z.ZodOptional<z.ZodString>;
    moisturePct: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    temperatureC: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    ph: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    nitrogenValue: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    phosphorusValue: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    potassiumValue: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    npkUnit: z.ZodNullable<z.ZodOptional<z.ZodDefault<z.ZodEnum<["kg_per_ha", "ppm", "mg_per_kg"]>>>>;
    source: z.ZodDefault<z.ZodEnum<["manual", "sensor", "import"]>>;
    notes: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    source: "manual" | "sensor" | "import";
    notes?: string | null | undefined;
    observedAt?: string | undefined;
    moisturePct?: number | null | undefined;
    temperatureC?: number | null | undefined;
    ph?: number | null | undefined;
    nitrogenValue?: number | null | undefined;
    phosphorusValue?: number | null | undefined;
    potassiumValue?: number | null | undefined;
    npkUnit?: "kg_per_ha" | "ppm" | "mg_per_kg" | null | undefined;
}, {
    notes?: string | null | undefined;
    observedAt?: string | undefined;
    moisturePct?: number | null | undefined;
    temperatureC?: number | null | undefined;
    ph?: number | null | undefined;
    nitrogenValue?: number | null | undefined;
    phosphorusValue?: number | null | undefined;
    potassiumValue?: number | null | undefined;
    npkUnit?: "kg_per_ha" | "ppm" | "mg_per_kg" | null | undefined;
    source?: "manual" | "sensor" | "import" | undefined;
}>;
export type CreateSoilReading = z.infer<typeof CreateSoilReadingSchema>;
export declare const SensorIngestPayloadSchema: z.ZodObject<{
    deviceToken: z.ZodString;
    fieldId: z.ZodString;
    timestamp: z.ZodOptional<z.ZodString>;
    readings: z.ZodObject<{
        moisturePct: z.ZodOptional<z.ZodNumber>;
        temperatureC: z.ZodOptional<z.ZodNumber>;
        ph: z.ZodOptional<z.ZodNumber>;
        nitrogenValue: z.ZodOptional<z.ZodNumber>;
        phosphorusValue: z.ZodOptional<z.ZodNumber>;
        potassiumValue: z.ZodOptional<z.ZodNumber>;
        npkUnit: z.ZodOptional<z.ZodDefault<z.ZodEnum<["kg_per_ha", "ppm", "mg_per_kg"]>>>;
    }, "strip", z.ZodTypeAny, {
        moisturePct?: number | undefined;
        temperatureC?: number | undefined;
        ph?: number | undefined;
        nitrogenValue?: number | undefined;
        phosphorusValue?: number | undefined;
        potassiumValue?: number | undefined;
        npkUnit?: "kg_per_ha" | "ppm" | "mg_per_kg" | undefined;
    }, {
        moisturePct?: number | undefined;
        temperatureC?: number | undefined;
        ph?: number | undefined;
        nitrogenValue?: number | undefined;
        phosphorusValue?: number | undefined;
        potassiumValue?: number | undefined;
        npkUnit?: "kg_per_ha" | "ppm" | "mg_per_kg" | undefined;
    }>;
    batteryPct: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    fieldId: string;
    deviceToken: string;
    readings: {
        moisturePct?: number | undefined;
        temperatureC?: number | undefined;
        ph?: number | undefined;
        nitrogenValue?: number | undefined;
        phosphorusValue?: number | undefined;
        potassiumValue?: number | undefined;
        npkUnit?: "kg_per_ha" | "ppm" | "mg_per_kg" | undefined;
    };
    timestamp?: string | undefined;
    batteryPct?: number | undefined;
}, {
    fieldId: string;
    deviceToken: string;
    readings: {
        moisturePct?: number | undefined;
        temperatureC?: number | undefined;
        ph?: number | undefined;
        nitrogenValue?: number | undefined;
        phosphorusValue?: number | undefined;
        potassiumValue?: number | undefined;
        npkUnit?: "kg_per_ha" | "ppm" | "mg_per_kg" | undefined;
    };
    timestamp?: string | undefined;
    batteryPct?: number | undefined;
}>;
export type SensorIngestPayload = z.infer<typeof SensorIngestPayloadSchema>;
//# sourceMappingURL=soil.d.ts.map