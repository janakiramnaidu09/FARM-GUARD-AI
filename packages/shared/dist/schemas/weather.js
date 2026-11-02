import { z } from 'zod';
export const WeatherAlertSeveritySchema = z.enum(['info', 'watch', 'warning']);
export const WeatherAlertSchema = z.object({
    alertCode: z.string(),
    severity: WeatherAlertSeveritySchema,
    message: z.string(),
    validFrom: z.string(),
    validTo: z.string(),
    sourceIds: z.array(z.string())
});
export const WeatherExplanationSchema = z.object({
    summary: z.string(),
    alerts: z.array(WeatherAlertSchema),
    uncertainty: z.string()
});
export const DailyForecastItemSchema = z.object({
    date: z.string(),
    temperatureMaxC: z.number(),
    temperatureMinC: z.number(),
    precipitationSumMm: z.number(),
    precipitationProbabilityPct: z.number().optional().nullable(),
    windSpeedMaxKmh: z.number(),
    humidityAvgPct: z.number().optional().nullable(),
    weatherCode: z.number(),
    conditionText: z.string()
});
export const HourlyForecastItemSchema = z.object({
    time: z.string(),
    temperatureC: z.number(),
    precipitationMm: z.number(),
    humidityPct: z.number(),
    windSpeedKmh: z.number(),
    weatherCode: z.number()
});
export const NormalizedForecastSchema = z.object({
    current: z.object({
        time: z.string(),
        temperatureC: z.number(),
        humidityPct: z.number(),
        windSpeedKmh: z.number(),
        precipitationMm: z.number(),
        weatherCode: z.number(),
        conditionText: z.string()
    }),
    daily: z.array(DailyForecastItemSchema),
    hourly: z.array(HourlyForecastItemSchema).optional()
});
export const WeatherSnapshotSchema = z.object({
    id: z.string().uuid(),
    ownerId: z.string().uuid(),
    farmId: z.string().uuid(),
    provider: z.string(),
    forecastStart: z.string().datetime(),
    forecastEnd: z.string().datetime(),
    forecast: NormalizedForecastSchema,
    fetchedAt: z.string().datetime()
});
export const AlertPreferencesSchema = z.object({
    id: z.string().uuid(),
    ownerId: z.string().uuid(),
    farmId: z.string().uuid(),
    enabled: z.boolean().default(true),
    channels: z.object({
        inApp: z.boolean().default(true),
        sms: z.boolean().default(false),
        email: z.boolean().default(false)
    }),
    thresholds: z
        .object({
        heavyRainMm: z.number().default(25),
        extremeHeatC: z.number().default(38),
        frostC: z.number().default(4),
        highWindKmh: z.number().default(35)
    })
        .default({
        heavyRainMm: 25,
        extremeHeatC: 38,
        frostC: 4,
        highWindKmh: 35
    }),
    updatedAt: z.string().datetime()
});
export const UpdateAlertPreferencesSchema = z.object({
    enabled: z.boolean().optional(),
    channels: z
        .object({
        inApp: z.boolean().optional(),
        sms: z.boolean().optional(),
        email: z.boolean().optional()
    })
        .optional(),
    thresholds: z
        .object({
        heavyRainMm: z.number().min(5).max(200).optional(),
        extremeHeatC: z.number().min(30).max(55).optional(),
        frostC: z.number().min(-10).max(15).optional(),
        highWindKmh: z.number().min(15).max(120).optional()
    })
        .optional()
});
//# sourceMappingURL=weather.js.map