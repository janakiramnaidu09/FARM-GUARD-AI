import { z } from 'zod';
export declare const WeatherAlertSeveritySchema: z.ZodEnum<["info", "watch", "warning"]>;
export type WeatherAlertSeverity = z.infer<typeof WeatherAlertSeveritySchema>;
export declare const WeatherAlertSchema: z.ZodObject<{
    alertCode: z.ZodString;
    severity: z.ZodEnum<["info", "watch", "warning"]>;
    message: z.ZodString;
    validFrom: z.ZodString;
    validTo: z.ZodString;
    sourceIds: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    message: string;
    alertCode: string;
    severity: "info" | "watch" | "warning";
    validFrom: string;
    validTo: string;
    sourceIds: string[];
}, {
    message: string;
    alertCode: string;
    severity: "info" | "watch" | "warning";
    validFrom: string;
    validTo: string;
    sourceIds: string[];
}>;
export type WeatherAlert = z.infer<typeof WeatherAlertSchema>;
export declare const WeatherExplanationSchema: z.ZodObject<{
    summary: z.ZodString;
    alerts: z.ZodArray<z.ZodObject<{
        alertCode: z.ZodString;
        severity: z.ZodEnum<["info", "watch", "warning"]>;
        message: z.ZodString;
        validFrom: z.ZodString;
        validTo: z.ZodString;
        sourceIds: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        message: string;
        alertCode: string;
        severity: "info" | "watch" | "warning";
        validFrom: string;
        validTo: string;
        sourceIds: string[];
    }, {
        message: string;
        alertCode: string;
        severity: "info" | "watch" | "warning";
        validFrom: string;
        validTo: string;
        sourceIds: string[];
    }>, "many">;
    uncertainty: z.ZodString;
}, "strip", z.ZodTypeAny, {
    summary: string;
    alerts: {
        message: string;
        alertCode: string;
        severity: "info" | "watch" | "warning";
        validFrom: string;
        validTo: string;
        sourceIds: string[];
    }[];
    uncertainty: string;
}, {
    summary: string;
    alerts: {
        message: string;
        alertCode: string;
        severity: "info" | "watch" | "warning";
        validFrom: string;
        validTo: string;
        sourceIds: string[];
    }[];
    uncertainty: string;
}>;
export type WeatherExplanation = z.infer<typeof WeatherExplanationSchema>;
export declare const DailyForecastItemSchema: z.ZodObject<{
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
}>;
export type DailyForecastItem = z.infer<typeof DailyForecastItemSchema>;
export declare const HourlyForecastItemSchema: z.ZodObject<{
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
}>;
export type HourlyForecastItem = z.infer<typeof HourlyForecastItemSchema>;
export declare const NormalizedForecastSchema: z.ZodObject<{
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
export type NormalizedForecast = z.infer<typeof NormalizedForecastSchema>;
export declare const WeatherSnapshotSchema: z.ZodObject<{
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
}>;
export type WeatherSnapshot = z.infer<typeof WeatherSnapshotSchema>;
export declare const AlertPreferencesSchema: z.ZodObject<{
    id: z.ZodString;
    ownerId: z.ZodString;
    farmId: z.ZodString;
    enabled: z.ZodDefault<z.ZodBoolean>;
    channels: z.ZodObject<{
        inApp: z.ZodDefault<z.ZodBoolean>;
        sms: z.ZodDefault<z.ZodBoolean>;
        email: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        email: boolean;
        inApp: boolean;
        sms: boolean;
    }, {
        email?: boolean | undefined;
        inApp?: boolean | undefined;
        sms?: boolean | undefined;
    }>;
    thresholds: z.ZodDefault<z.ZodObject<{
        heavyRainMm: z.ZodDefault<z.ZodNumber>;
        extremeHeatC: z.ZodDefault<z.ZodNumber>;
        frostC: z.ZodDefault<z.ZodNumber>;
        highWindKmh: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        heavyRainMm: number;
        extremeHeatC: number;
        frostC: number;
        highWindKmh: number;
    }, {
        heavyRainMm?: number | undefined;
        extremeHeatC?: number | undefined;
        frostC?: number | undefined;
        highWindKmh?: number | undefined;
    }>>;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    updatedAt: string;
    ownerId: string;
    farmId: string;
    enabled: boolean;
    channels: {
        email: boolean;
        inApp: boolean;
        sms: boolean;
    };
    thresholds: {
        heavyRainMm: number;
        extremeHeatC: number;
        frostC: number;
        highWindKmh: number;
    };
}, {
    id: string;
    updatedAt: string;
    ownerId: string;
    farmId: string;
    channels: {
        email?: boolean | undefined;
        inApp?: boolean | undefined;
        sms?: boolean | undefined;
    };
    enabled?: boolean | undefined;
    thresholds?: {
        heavyRainMm?: number | undefined;
        extremeHeatC?: number | undefined;
        frostC?: number | undefined;
        highWindKmh?: number | undefined;
    } | undefined;
}>;
export type AlertPreferences = z.infer<typeof AlertPreferencesSchema>;
export declare const UpdateAlertPreferencesSchema: z.ZodObject<{
    enabled: z.ZodOptional<z.ZodBoolean>;
    channels: z.ZodOptional<z.ZodObject<{
        inApp: z.ZodOptional<z.ZodBoolean>;
        sms: z.ZodOptional<z.ZodBoolean>;
        email: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        email?: boolean | undefined;
        inApp?: boolean | undefined;
        sms?: boolean | undefined;
    }, {
        email?: boolean | undefined;
        inApp?: boolean | undefined;
        sms?: boolean | undefined;
    }>>;
    thresholds: z.ZodOptional<z.ZodObject<{
        heavyRainMm: z.ZodOptional<z.ZodNumber>;
        extremeHeatC: z.ZodOptional<z.ZodNumber>;
        frostC: z.ZodOptional<z.ZodNumber>;
        highWindKmh: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        heavyRainMm?: number | undefined;
        extremeHeatC?: number | undefined;
        frostC?: number | undefined;
        highWindKmh?: number | undefined;
    }, {
        heavyRainMm?: number | undefined;
        extremeHeatC?: number | undefined;
        frostC?: number | undefined;
        highWindKmh?: number | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    enabled?: boolean | undefined;
    channels?: {
        email?: boolean | undefined;
        inApp?: boolean | undefined;
        sms?: boolean | undefined;
    } | undefined;
    thresholds?: {
        heavyRainMm?: number | undefined;
        extremeHeatC?: number | undefined;
        frostC?: number | undefined;
        highWindKmh?: number | undefined;
    } | undefined;
}, {
    enabled?: boolean | undefined;
    channels?: {
        email?: boolean | undefined;
        inApp?: boolean | undefined;
        sms?: boolean | undefined;
    } | undefined;
    thresholds?: {
        heavyRainMm?: number | undefined;
        extremeHeatC?: number | undefined;
        frostC?: number | undefined;
        highWindKmh?: number | undefined;
    } | undefined;
}>;
export type UpdateAlertPreferences = z.infer<typeof UpdateAlertPreferencesSchema>;
//# sourceMappingURL=weather.d.ts.map