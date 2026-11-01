import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load environment variables from local or workspace root .env if present
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });
dotenv.config();

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  APP_BASE_URL: z.string().url().default('http://localhost:3000'),
  ALLOWED_ORIGINS: z
    .string()
    .default('http://localhost:5173,http://localhost:3000')
    .transform((val) => val.split(',').map((s) => s.trim())),

  // Database
  DATABASE_URL: z.string().optional().default(''),
  DATABASE_PROVIDER: z.enum(['replit', 'supabase', 'postgres']).default('postgres'),

  // Auth
  AUTH_SESSION_SECRET: z.string().default('farmguard-development-session-secret-change-in-production-32chars'),
  AUTH_COOKIE_NAME: z.string().default('farmguard_session'),

  // Gemini
  GEMINI_API_KEY: z.string().optional().default(''),
  GEMINI_MODEL: z.string().default('gemini-1.5-flash'),

  // Weather
  WEATHER_PROVIDER: z.string().default('open-meteo'),
  WEATHER_API_KEY: z.string().optional().default(''),
  WEATHER_CACHE_TTL_SECONDS: z.coerce.number().default(900),

  // Storage
  SUPABASE_URL: z.string().optional().default(''),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional().default(''),
  SUPABASE_STORAGE_BUCKET: z.string().default('farmguard-private-images'),
  LOCAL_PRIVATE_UPLOAD_DIR: z.string().default('./private-uploads'),

  // Disease Inference Service
  ML_SERVICE_URL: z.string().url().default('http://127.0.0.1:8001'),
  ML_SERVICE_TOKEN: z.string().default('dev-ml-token-change-in-production'),
  MODEL_PATH: z.string().optional().default(''),
  MODEL_MANIFEST_PATH: z.string().default('model/model_manifest.json'),
  DISEASE_CONFIDENCE_THRESHOLD: z.coerce.number().default(0.75),
  MAX_IMAGE_BYTES: z.coerce.number().default(8388608),

  // Operations
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  REQUEST_TIMEOUT_MS: z.coerce.number().default(15000),
});

export type Config = z.infer<typeof EnvSchema>;

export function loadConfig(): Config {
  const result = EnvSchema.safeParse(process.env);
  if (!result.success) {
    const errorDetails = result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
    throw new Error(`Configuration validation failed: ${errorDetails}`);
  }
  return result.data;
}

export const config = loadConfig();

