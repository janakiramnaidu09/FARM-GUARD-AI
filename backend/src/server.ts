import { createApp } from './app.js';
import { config } from './config/env.js';
import { testConnection } from './db/pool.js';
import { runMigrations } from './db/migrator.js';

async function bootstrap() {
  console.log(`====================================================`);
  console.log(`  🌾 FarmGuard AI — Agriculture Advisory API`);
  console.log(`  Environment: ${config.NODE_ENV}`);
  console.log(`  Port: ${config.PORT}`);
  console.log(`====================================================`);

  // Attempt database connection & migration
  if (config.DATABASE_URL && config.DATABASE_URL.trim().length > 0) {
    console.log('[Startup] Connecting to PostgreSQL database...');
    const connected = await testConnection();
    if (connected) {
      console.log('[Startup] PostgreSQL connection verified. Running migrations...');
      try {
        await runMigrations();
      } catch (err) {
        console.error('[Startup] Migration execution error:', err);
      }
    } else {
      console.warn('[Startup] PostgreSQL connection could not be established. Operating in in-memory dev mode.');
    }
  } else {
    console.log('[Startup] Notice: DATABASE_URL not configured. Running in local memory development mode.');
  }

  const app = createApp();

  const server = app.listen(config.PORT, '0.0.0.0', () => {
    console.log(`[Startup] FarmGuard API successfully listening on http://localhost:${config.PORT}`);
    console.log(`[Startup] Health check: http://localhost:${config.PORT}/api/v1/health`);
    console.log(`[Startup] Readiness probe: http://localhost:${config.PORT}/api/v1/ready`);
  });

  const shutdown = () => {
    console.log('[Shutdown] Gracefully shutting down FarmGuard API...');
    server.close(() => {
      console.log('[Shutdown] HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

bootstrap().catch((err) => {
  console.error('[Fatal] Server failed to start:', err);
  process.exit(1);
});

