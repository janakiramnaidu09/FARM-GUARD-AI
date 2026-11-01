# FarmGuard AI — Complete Setup & Deployment Guide

This guide details the step-by-step installation, environment configuration, database migration, and runtime verification for the FarmGuard AI platform.

---

## 1. Prerequisites

- **Node.js**: `v20.x` or `v22.x+` (verified on Node `v26.13.0`)
- **Python**: `3.10+` or `3.11` (for internal disease inference service)
- **PostgreSQL**: PostgreSQL 14+ (compatible with Replit Postgres, Supabase, Neon, or local PostgreSQL)

---

## 2. Environment Configuration

Copy `.env.example` to `.env` in the project root:

```bash
cp .env.example .env
```

### Key Configuration Variables

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `NODE_ENV` | Runtime environment (`development`, `production`, `test`) | `development` |
| `PORT` | Node.js Express server port | `3000` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:pass@localhost:5432/farmguard` |
| `AUTH_SESSION_SECRET`| 32+ char secret for session tokens | Strong random string |
| `AUTH_COOKIE_NAME` | Cookie name for session storage | `farmguard_session` |
| `GEMINI_API_KEY` | Google Gemini API key from AI Studio | `AIzaSy...` (Optional, fallback provided) |
| `GEMINI_MODEL` | Gemini model name | `gemini-1.5-flash` |
| `WEATHER_PROVIDER` | Weather adapter provider | `open-meteo` (Free, no API key needed) |
| `ML_SERVICE_URL` | Python disease inference microservice URL | `http://127.0.0.1:8001` |
| `ML_SERVICE_TOKEN` | Bearer token for inference service | `dev-ml-token-change-in-production` |
| `LOCAL_PRIVATE_UPLOAD_DIR` | Directory for private leaf images | `./private-uploads` |

### Connecting Supabase PostgreSQL

To connect your Supabase database:
1. In your [Supabase Dashboard](https://supabase.com/dashboard), navigate to **Project Settings** (gear icon) -> **Database**.
2. Under **Connection string**, select **URI**.
3. Choose either:
   - **Session Pooler (Port 5432 - Recommended for IPv4 networks)**:
     ```ini
     DATABASE_URL=postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres?sslmode=require
     DATABASE_PROVIDER=supabase
     ```
   - **Transaction Pooler (Port 6543)**:
     ```ini
     DATABASE_URL=postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?sslmode=require
     DATABASE_PROVIDER=supabase
     ```
   - **Direct Connection (Port 5432 - IPv6 networks)**:
     ```ini
     DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?sslmode=require
     DATABASE_PROVIDER=supabase
     ```
4. Test connectivity:
   ```bash
   npm run db:test
   ```
5. Apply schema migrations:
   ```bash
   npm run db:migrate
   ```

---

## 3. Database Setup & Migrations

When `DATABASE_URL` is set, FarmGuard AI automatically executes versioned SQL migrations on startup:

1. **`001_initial_schema.sql`**:
   - Extensions: `pgcrypto`
   - Tables: `users`, `sessions`, `farms`, `fields`, `soil_readings`, `sensor_devices`, `crop_catalog`, `disease_assessments`, `weather_snapshots`, `advisory_recommendations`, `conversations`, `conversation_messages`, `alert_preferences`, `audit_events`.
   - Triggers: Automatic `updated_at` timestamps and cross-table ownership verification.
2. **`002_row_level_security.sql`**:
   - Enables and forces PostgreSQL Row Level Security (RLS) on all user-owned tables.
   - Restricts row access to `app.user_id = owner_id`.
   - Declares pre-auth functions `fn_lookup_user_for_auth` and `fn_lookup_session_by_token`.
3. **`003_seed_crop_catalog.sql`**:
   - Seeds verified Indian agronomic data for Rice, Cotton, Maize, Groundnut, Tomato, Red Gram, Bengal Gram, Chilli, and Turmeric with citations from ICAR, PJTSAU, and ANGRAU.

> **Note on Local Development without Postgres**: If `DATABASE_URL` is omitted, the API automatically runs in high-fidelity in-memory development mode pre-seeded with a demo farmer (`farmer@farmguard.ai` / `FarmGuard123!`), allowing complete UI, navigation, and API testing without blocking.

---

## 4. Launching the Services

### Step A: Install Node Dependencies
```bash
npm install
```

### Step B: Build TypeScript Packages
```bash
npm run build
```

### Step C: Run the Python Inference Service
```bash
cd services/disease-inference
python -m venv venv

# Windows
venv\Scripts\activate
# Linux/macOS
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --host 127.0.0.1 --port 8001
```

### Step D: Run the Node.js Express API
```bash
npm run start:api
# Or for hot-reloading dev mode:
npm run dev:api
```

### Step E: Run the React Web Frontend
```bash
npm run dev:web
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 5. Health & Readiness Verification

- **Liveness Probe**: `GET http://localhost:3000/api/v1/health`
  ```json
  {
    "status": "ok",
    "service": "farmguard-api",
    "uptimeSeconds": 120
  }
  ```
- **Readiness Probe**: `GET http://localhost:3000/api/v1/ready`
  Verifies database connectivity, Open-Meteo weather adapter, Gemini API key, and Python inference service status without exposing credentials.

