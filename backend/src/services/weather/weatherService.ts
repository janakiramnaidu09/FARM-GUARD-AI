import {
  NormalizedForecast,
  WeatherAlert,
  WeatherSnapshot,
  AlertPreferences,
  DailyForecastItem,
  HourlyForecastItem
} from '@farmguard/shared';
import { config } from '../../config/env.js';

export interface WeatherProvider {
  name: string;
  fetchForecast(latitude: number, longitude: number): Promise<NormalizedForecast>;
}

// Weather condition codes (WMO standard used by Open-Meteo)
function wmoCodeToText(code: number): string {
  switch (code) {
    case 0:
      return 'Clear sky';
    case 1:
    case 2:
    case 3:
      return 'Mainly clear, partly cloudy';
    case 45:
    case 48:
      return 'Fog and depositing rime fog';
    case 51:
    case 53:
    case 55:
      return 'Drizzle (Light/Moderate/Dense)';
    case 61:
    case 63:
    case 65:
      return 'Rain (Slight/Moderate/Heavy)';
    case 71:
    case 73:
    case 75:
      return 'Snow fall (Slight/Moderate/Heavy)';
    case 80:
    case 81:
    case 82:
      return 'Rain showers (Slight/Moderate/Violent)';
    case 95:
      return 'Thunderstorm (Slight or moderate)';
    case 96:
    case 99:
      return 'Thunderstorm with heavy hail';
    default:
      return 'Cloudy with variable weather';
  }
}

export class OpenMeteoWeatherProvider implements WeatherProvider {
  public name = 'open-meteo';

  async fetchForecast(latitude: number, longitude: number): Promise<NormalizedForecast> {
    const url = new URL('https://api.open-meteo.com/v1/forecast');
    url.searchParams.set('latitude', latitude.toFixed(4));
    url.searchParams.set('longitude', longitude.toFixed(4));
    url.searchParams.set(
      'current',
      'temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m'
    );
    url.searchParams.set(
      'daily',
      'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max'
    );
    url.searchParams.set(
      'hourly',
      'temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,weather_code'
    );
    url.searchParams.set('timezone', 'auto');
    url.searchParams.set('forecast_days', '7');

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), config.REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(url.toString(), { signal: controller.signal });
      if (!response.ok) {
        throw new Error(`Open-Meteo returned HTTP ${response.status}: ${response.statusText}`);
      }
      const data = (await response.json()) as any;

      const current = {
        time: data.current.time,
        temperatureC: Number(data.current.temperature_2m),
        humidityPct: Number(data.current.relative_humidity_2m),
        windSpeedKmh: Number(data.current.wind_speed_10m),
        precipitationMm: Number(data.current.precipitation || 0),
        weatherCode: Number(data.current.weather_code),
        conditionText: wmoCodeToText(Number(data.current.weather_code)),
      };

      const daily: DailyForecastItem[] = [];
      const dates = data.daily?.time || [];
      for (let i = 0; i < dates.length; i++) {
        daily.push({
          date: dates[i],
          temperatureMaxC: Number(data.daily.temperature_2m_max[i]),
          temperatureMinC: Number(data.daily.temperature_2m_min[i]),
          precipitationSumMm: Number(data.daily.precipitation_sum[i] || 0),
          precipitationProbabilityPct: data.daily.precipitation_probability_max
            ? Number(data.daily.precipitation_probability_max[i])
            : null,
          windSpeedMaxKmh: Number(data.daily.wind_speed_10m_max[i]),
          humidityAvgPct: null,
          weatherCode: Number(data.daily.weather_code[i]),
          conditionText: wmoCodeToText(Number(data.daily.weather_code[i])),
        });
      }

      // Next 24 hours for hourly graph
      const hourly: HourlyForecastItem[] = [];
      const hourlyTimes = data.hourly?.time || [];
      const limit = Math.min(24, hourlyTimes.length);
      for (let i = 0; i < limit; i++) {
        hourly.push({
          time: hourlyTimes[i],
          temperatureC: Number(data.hourly.temperature_2m[i]),
          precipitationMm: Number(data.hourly.precipitation[i] || 0),
          humidityPct: Number(data.hourly.relative_humidity_2m[i]),
          windSpeedKmh: Number(data.hourly.wind_speed_10m[i]),
          weatherCode: Number(data.hourly.weather_code[i]),
        });
      }

      return {
        current,
        daily,
        hourly,
      };
    } finally {
      clearTimeout(timeout);
    }
  }
}

interface CacheEntry {
  forecast: NormalizedForecast;
  fetchedAt: number;
}

export class WeatherService {
  private provider: WeatherProvider;
  private cache: Map<string, CacheEntry> = new Map();

  constructor() {
    this.provider = new OpenMeteoWeatherProvider();
  }

  async getForecast(
    farmId: string,
    latitude: number,
    longitude: number,
    forceRefresh = false
  ): Promise<{ forecast: NormalizedForecast; fetchedAt: string; source: string; cached: boolean }> {
    const cacheKey = `${latitude.toFixed(3)},${longitude.toFixed(3)}`;
    const now = Date.now();
    const ttlMs = config.WEATHER_CACHE_TTL_SECONDS * 1000;

    const existing = this.cache.get(cacheKey);
    if (!forceRefresh && existing && now - existing.fetchedAt < ttlMs) {
      return {
        forecast: existing.forecast,
        fetchedAt: new Date(existing.fetchedAt).toISOString(),
        source: this.provider.name,
        cached: true,
      };
    }

    const forecast = await this.provider.fetchForecast(latitude, longitude);
    this.cache.set(cacheKey, {
      forecast,
      fetchedAt: now,
    });

    return {
      forecast,
      fetchedAt: new Date(now).toISOString(),
      source: this.provider.name,
      cached: false,
    };
  }

  /**
   * Deterministic rule-based agricultural weather alert evaluation
   */
  evaluateAlerts(
    forecast: NormalizedForecast,
    preferences?: AlertPreferences['thresholds']
  ): WeatherAlert[] {
    const alerts: WeatherAlert[] = [];
    const thresholds = {
      heavyRainMm: preferences?.heavyRainMm ?? 25,
      extremeHeatC: preferences?.extremeHeatC ?? 38,
      frostC: preferences?.frostC ?? 4,
      highWindKmh: preferences?.highWindKmh ?? 35,
    };

    // 1. Extreme Heat Check (current or upcoming 3 days)
    const heatDays = forecast.daily.filter((d) => d.temperatureMaxC >= thresholds.extremeHeatC);
    if (heatDays.length > 0) {
      alerts.push({
        alertCode: 'EXTREME_HEAT_ALERT',
        severity: heatDays[0].temperatureMaxC >= thresholds.extremeHeatC + 4 ? 'warning' : 'watch',
        message: `High temperature alert: Peak temperatures of ${heatDays[0].temperatureMaxC}°C expected on ${heatDays[0].date}. Implement midday irrigation conservation and shelter vulnerable seedlings.`,
        validFrom: heatDays[0].date,
        validTo: heatDays[heatDays.length - 1].date,
        sourceIds: ['OPEN_METEO_DAILY_MAX_TEMP'],
      });
    }

    // 2. Heavy Rain Alert
    const heavyRainDays = forecast.daily.filter((d) => d.precipitationSumMm >= thresholds.heavyRainMm);
    if (heavyRainDays.length > 0) {
      alerts.push({
        alertCode: 'HEAVY_RAINFALL_ALERT',
        severity: heavyRainDays[0].precipitationSumMm >= thresholds.heavyRainMm * 2 ? 'warning' : 'watch',
        message: `Heavy rainfall warning: ${heavyRainDays[0].precipitationSumMm} mm predicted on ${heavyRainDays[0].date}. Clear field drainage ditches immediately and delay scheduled fertilizer top-dressing to prevent leaching.`,
        validFrom: heavyRainDays[0].date,
        validTo: heavyRainDays[heavyRainDays.length - 1].date,
        sourceIds: ['OPEN_METEO_DAILY_PRECIP_SUM'],
      });
    }

    // 3. High Wind Alert
    const windyDays = forecast.daily.filter((d) => d.windSpeedMaxKmh >= thresholds.highWindKmh);
    if (windyDays.length > 0) {
      alerts.push({
        alertCode: 'HIGH_WIND_ADVISORY',
        severity: windyDays[0].windSpeedMaxKmh >= thresholds.highWindKmh + 20 ? 'warning' : 'watch',
        message: `High wind advisory: Gusts up to ${windyDays[0].windSpeedMaxKmh} km/h expected on ${windyDays[0].date}. Postpone foliar pesticide spraying and provide staking support for banana, tomato, or tall crops.`,
        validFrom: windyDays[0].date,
        validTo: windyDays[windyDays.length - 1].date,
        sourceIds: ['OPEN_METEO_WIND_SPEED_MAX'],
      });
    }

    // 4. Frost Alert
    const coldDays = forecast.daily.filter((d) => d.temperatureMinC <= thresholds.frostC);
    if (coldDays.length > 0) {
      alerts.push({
        alertCode: 'FROST_CHILL_ALERT',
        severity: 'warning',
        message: `Cold / Frost risk: Minimum temperatures dropping to ${coldDays[0].temperatureMinC}°C on ${coldDays[0].date}. Apply light night irrigation or smoke cover to protect sensitive vegetable blossoms.`,
        validFrom: coldDays[0].date,
        validTo: coldDays[coldDays.length - 1].date,
        sourceIds: ['OPEN_METEO_MIN_TEMP'],
      });
    }

    // 5. Dry Spell Info
    const total7DayRain = forecast.daily.reduce((sum, d) => sum + d.precipitationSumMm, 0);
    if (total7DayRain < 2.0 && forecast.current.temperatureC > 30) {
      alerts.push({
        alertCode: 'DRY_SPELL_MONITORING',
        severity: 'info',
        message: `Dry conditions persisting: Less than 2 mm precipitation forecast across the next 7 days. Monitor soil root-zone moisture closely and schedule standard furrow or drip irrigations.`,
        validFrom: forecast.daily[0].date,
        validTo: forecast.daily[forecast.daily.length - 1].date,
        sourceIds: ['OPEN_METEO_WEEKLY_PRECIP'],
      });
    }

    return alerts;
  }
}

export const weatherService = new WeatherService();

