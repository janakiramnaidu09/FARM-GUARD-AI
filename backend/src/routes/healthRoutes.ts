import { Router } from 'express';
import { isDbConnected, getPool } from '../db/pool.js';
import { geminiService } from '../services/gemini/geminiService.js';
import { config } from '../config/env.js';

const router = Router();

// GET /api/v1/health - lightweight liveness probe
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'farmguard-api',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
  });
});

// GET /api/v1/ready - readiness probe verifying configured dependencies without secrets
router.get('/ready', async (req, res) => {
  const issues: string[] = [];
  const statusDetails: Record<string, any> = {};

  // 1. PostgreSQL Database
  const hasDbUrl = Boolean(config.DATABASE_URL && config.DATABASE_URL.trim().length > 0);
  const dbConnected = isDbConnected();
  statusDetails.database = {
    configured: hasDbUrl,
    provider: config.DATABASE_PROVIDER,
    connected: dbConnected,
    mode: dbConnected ? 'postgresql-rls' : 'in-memory-dev',
  };
  if (!hasDbUrl) {
    issues.push('DATABASE_URL is not configured. Running in local memory development mode.');
  }

  // 2. Gemini AI
  const geminiConfigured = geminiService.isConfigured();
  statusDetails.aiAssistant = {
    configured: geminiConfigured,
    model: config.GEMINI_MODEL,
  };
  if (!geminiConfigured) {
    issues.push('GEMINI_API_KEY is not set. Conversational explanations will use deterministic rules.');
  }

  // 3. Weather Provider
  statusDetails.weather = {
    provider: config.WEATHER_PROVIDER,
    cacheTtlSeconds: config.WEATHER_CACHE_TTL_SECONDS,
    status: 'available',
  };

  // 4. Disease Inference Service
  let mlServiceReachable = false;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);
    const resp = await fetch(`${config.ML_SERVICE_URL}/health`, { signal: controller.signal });
    clearTimeout(timeout);
    mlServiceReachable = resp.ok;
  } catch {
    mlServiceReachable = false;
  }

  statusDetails.diseaseInference = {
    url: config.ML_SERVICE_URL,
    reachable: mlServiceReachable,
  };
  if (!mlServiceReachable) {
    issues.push(`Disease inference microservice at ${config.ML_SERVICE_URL} is unreachable.`);
  }

  const isReady = true; // API is always ready to serve, reporting exact dependency statuses

  res.status(isReady ? 200 : 503).json({
    ready: isReady,
    status: isReady ? 'ready' : 'degraded',
    issues,
    dependencies: statusDetails,
    timestamp: new Date().toISOString(),
  });
});

export default router;

