# FarmGuard AI — Backend REST API

This directory contains the primary Express.js REST API service for FarmGuard AI. It provides authenticated farmer endpoints, deterministic agronomy advisory scoring, telemetry ingestion, weather alerts, Google Gemini conversational AI integration, and the client interface for the leaf disease detection machine learning service.

---

## Directory Structure

```
backend/
├── src/
│   ├── config/              # Validated environment variables (Zod schema)
│   ├── db/                  # PostgreSQL pool, transaction manager, and repository
│   │   ├── pool.ts          # Connection pool with health check
│   │   ├── withUserTransaction.ts # Multi-tenant RLS context wrapper
│   │   ├── migrator.ts      # Automated database migration runner
│   │   └── repositories/    # Data repositories with in-memory fallback
│   ├── middleware/          # Authentication, rate limiters, error handling
│   ├── routes/              # Express API route controllers (12+ resources)
│   ├── services/            # Domain services (Auth, Gemini, Weather, Crops, Storage)
│   ├── app.ts               # Express application builder and security setup
│   └── server.ts            # Entrypoint and HTTP server bootstrap
├── package.json             # Backend dependencies and scripts
├── tsconfig.json            # TypeScript configuration
├── .env.example             # Backend environment variable template
└── README.md                # This documentation guide
```

---

## Environment Variables

Copy `.env.example` to `.env` and fill in your credentials:
```bash
cp .env.example .env
```

Key variables:
- `PORT`: HTTP port (defaults to `3000`).
- `DATABASE_URL`: PostgreSQL connection string (direct or connection pooler).
- `GEMINI_API_KEY`: Server-side API key for Google Gemini conversational assistant.
- `ML_SERVICE_URL`: URL to the FastAPI leaf disease inference service (`http://127.0.0.1:8001`).

---

## Available Commands

From within the `backend` directory:
- `npm run dev`: Start backend in live development mode with hot-reload (`tsx watch src/server.ts`).
- `npm run build`: Compile TypeScript into JavaScript (`dist/`).
- `npm run start`: Run compiled production server (`node dist/server.js`).
- `npm run db:test`: Run database connection diagnostic test.
- `npm run db:migrate`: Run pending migrations against PostgreSQL.

From the root monorepo:
- `npm run dev:backend` or `npm run dev:api`: Start the backend server.
- `npm run build:backend` or `npm run build:api`: Build backend.
