# FarmGuard AI — AI-Powered Agriculture Crop Advisory Assistant

[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61dafb.svg)](https://reactjs.org/)
[![Express.js](https://img.shields.io/badge/Express-4.19-green.svg)](https://expressjs.com/)
[![TensorFlow](https://img.shields.io/badge/TensorFlow-2.15-orange.svg)](https://www.tensorflow.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688.svg)](https://fastapi.tiangolo.com/)
[![PostgreSQL RLS](https://img.shields.io/badge/PostgreSQL-RLS%20Enforced-336791.svg)](https://www.postgresql.org/)
[![Bilingual](https://img.shields.io/badge/Languages-English%20%7C%20%E0%B0%A4%E0%B1%86%E0%B0%B2%E0%B1%81%E0%B0%97%E0%B1%81-brightgreen.svg)](#bilingual-experience-english--telugu)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)

**FarmGuard AI** is a production-grade, bilingual (English & Telugu), mobile-first agricultural advisory platform built for Indian farmers. It combines computer vision leaf disease diagnosis, deterministic agronomic crop planning, hyper-local weather alerts, real-time soil telemetry tracking, and an interactive voice-enabled AI assistant grounded in authoritative Indian university agronomy research.

---

## Table of Contents

- [Key Capabilities](#key-capabilities)
- [System Architecture](#system-architecture)
- [Monorepo Workspace Structure](#monorepo-workspace-structure)
- [Technology Stack](#technology-stack)
- [Quickstart & Local Setup](#quickstart--local-setup)
- [Demo Credentials](#demo-credentials)
- [Bilingual Experience (English & Telugu)](#bilingual-experience-english--telugu)
- [AI Leaf Disease Classification Service](#ai-leaf-disease-classification-service)
- [Deterministic Crop Recommendation Engine](#deterministic-crop-recommendation-engine)
- [Hyper-Local Weather & Agricultural Risk Alerts](#hyper-local-weather--agricultural-risk-alerts)
- [IoT & Soil Telemetry Ingestion](#iot--soil-telemetry-ingestion)
- [Data Sovereignty & Row Level Security (RLS)](#data-sovereignty--row-level-security-rls)
- [REST API Reference](#rest-api-reference)
- [Documentation Index](#documentation-index)
- [Verification & Health Checks](#verification--health-checks)
- [License](#license)

---

## Key Capabilities

1. **AI Crop Leaf Disease Detection**:
   - Private, authenticated image uploads with magic byte signature verification (JPEG, PNG, WebP).
   - Preprocessing with **OpenCV** (RGB conversion, dimension validation, aspect-preserving resizing).
   - Inference via **TensorFlow MobileNetV2** with calibrated confidence scoring.
   - **Calibrated Abstention Safety**: When confidence is below **75%** or an unrecognised plant part is uploaded, the model abstains rather than inventing misleading claims.
   - Non-chemical cultural control steps, photography guidance, and direct Krishi Vigyan Kendra (KVK) referral advice.

2. **Deterministic Soil Monitoring & IoT Ingestion**:
   - Records Moisture, pH, Soil Temperature, and NPK (Nitrogen, Phosphorus, Potassium).
   - Supports manual entry and authenticated device telemetry via `X-Device-Token`.
   - **Freshness Flagging**: Visual indicators for data currency: `< 7 days` (Fresh / Recent), `7–30 days` (Aging), and `> 30 days` (Stale / Update recommended).
   - High-contrast SVG trend charts showing moisture and pH over time.

3. **Hyper-Local Weather & Agricultural Alerts**:
   - Integration with **Open-Meteo** (free, no API key required, global coordinate coverage).
   - 7-day daily forecast and 24-hour hourly forecast with in-memory TTL caching.
   - Deterministic agricultural risk warnings:
     - Heavy Rain Warning ($\ge 35\text{ mm}$ precipitation)
     - Extreme Heat Stress ($\ge 39^\circ\text{C}$)
     - Frost / Chilling Hazard ($\le 7^\circ\text{C}$)
     - High Wind Warning ($\ge 35\text{ km/h}$)
     - Prolonged Dry Spell ($\ge 7\text{ consecutive dry days}$)

4. **Transparent Crop Suitability Scoring**:
   - Multi-factor deterministic scoring: Soil pH (25%), Soil Moisture (20%), Crop Season (20%), Air Temperature (20%), Soil NPK (15%).
   - Grounded in verified **ICAR**, **PJTSAU (Vyavasaya Panchangam)**, and **ANGRAU** agronomy guides.
   - Visual factor score breakdowns so farmers understand *why* a crop was recommended.
   - Natural language advisory powered server-side by Google Gemini with fallback offline guidance.

5. **Telugu Voice & Text Assistant**:
   - Conversational AI powered by `@google/genai` with strict grounding and safety disclaimers.
   - Full **Telugu (`te-IN`) Speech-to-Text** via browser Web Speech API with microphone level indicator.
   - Native **Telugu Text-to-Speech** voice player with pitch and rate controls.
   - Resilient non-speech fallback for older or unsupported browsers.

6. **Farmer Data Sovereignty & Multi-Tenancy**:
   - True multi-tenant data isolation enforced by **PostgreSQL Row Level Security (RLS)**.
   - Transaction-scoped tenant context via `SET LOCAL app.user_id`.
   - Complete GDPR/DPDP-compliant data export in unencrypted JSON.
   - Permanent cascading account deletion with confirmation phrase (`DELETE_MY_ACCOUNT`).

---

## System Architecture

```
                                  +---------------------------------------+
                                  |         Farmer Mobile / Web           |
                                  |    (React 18, Vite, Tailwind CSS,     |
                                  |     Bilingual English & Telugu)       |
                                  +---------------------------------------+
                                                      |
                                           HTTPS REST API & Cookies
                                                      v
+---------------------------------------------------------------------------------------------------+
| Node.js Express.js API Gateway (Port 3000)                                                        |
|                                                                                                   |
|  [Security & Middleware]                                                                          |
|  - Helmet CSP, CORS Whitelists, Request ID Tracker, Sliding-Window Rate Limiters                  |
|  - HTTP-Only SameSite Cookie Session Management, Bcrypt Password Hasher                           |
|                                                                                                   |
|  [Domain Services]                                                                                |
|  - AuthService: Session rotation, scoped pre-auth lookup via fn_lookup_user_for_auth               |
|  - StorageService: Magic byte signature checks (JPEG/PNG/WebP), private directory adapter         |
|  - WeatherService: Open-Meteo adapter, in-memory TTL caching, deterministic alert rules           |
|  - CropRankingService: Deterministic weighted scoring formula (pH, Moisture, Season, Temp, NPK)    |
|  - GeminiService (@google/genai): Server-side only, strict Zod schema validation, safe fallback   |
|  - DiseaseClient: Internal HTTP client for Python FastAPI inference microservice                  |
+---------------------------------------------------------------------------------------------------+
             |                                        |                              |
             v                                        v                              v
+------------------------+           +-----------------------------+     +------------------------+
| PostgreSQL with RLS    |           | FastAPI ML Microservice     |     | Open-Meteo API         |
| (Replit / Supabase /   |           | (Port 8001)                 |     | (Free Meteorological   |
|  Local Postgres)       |           | - OpenCV Image Decoder      |     |  Numerical Forecasts)  |
| - 12+ Relational Tables|           | - Dimension & Format Checks |     +------------------------+
| - Row Level Security   |           | - TensorFlow 2.15 Inferrer  |
| - SET LOCAL app.user_id|           | - Calibrated Confidence     |
| - Foreign Key Triggers |           | - Abstention Logic & Rules  |
+------------------------+           +-----------------------------+
```

---

## Monorepo Workspace Structure (Frontend, Backend, Database Separated)

```
QUANTUM CREW/
├── package.json                   # Root monorepo workspace definition
├── package-lock.json              # Monorepo dependency lockfile
├── .env.example                   # Complete monorepo environment template
├── .gitignore                     # Git ignore rules for node, python, uploads, logs
├── README.md                      # This comprehensive documentation guide
├── QUANTUM CREW AGRICULTURE.code-workspace # Multi-root VS Code workspace configuration
│
├── frontend/                      # [TIER 1: FRONTEND] React 18 + Vite + Tailwind CSS Web App
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── index.html
│   ├── .env.example
│   ├── README.md
│   └── src/
│       ├── main.tsx               # React root mount
│       ├── app/App.tsx            # App wrapper with Context providers
│       ├── app/routes.tsx         # Route definitions for all 14 screens
│       ├── context/               # Auth, Farm, and Language contexts
│       ├── i18n/                  # English (`en.ts`) and Telugu (`te.ts`) dictionaries
│       ├── lib/api.ts             # Typed fetch API client
│       ├── components/            # UI primitives, AppShell, Header, Sidebar, MobileNav
│       ├── features/              # VoiceRecorder, SpeechPlayer, SoilTrendChart, CropCard
│       └── pages/                 # 14 complete screens (Dashboard, Disease, Soil, etc.)
│
├── backend/                       # [TIER 2: BACKEND] Express.js REST API
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   ├── README.md
│   └── src/
│       ├── server.ts              # Server initialization & port binding
│       ├── app.ts                 # Express app setup, security headers, route mounting
│       ├── config/env.ts          # Strict Zod-validated environment config
│       ├── db/
│       │   ├── pool.ts            # PostgreSQL connection pool with connection test
│       │   ├── migrator.ts        # SQL migration runner
│       │   ├── withUserTransaction.ts # Scoped RLS transaction wrapper (SET LOCAL app.user_id)
│       │   └── repositories/      # Unified data repository with in-memory fallback
│       ├── middleware/            # Auth, RateLimiter, ErrorHandler
│       ├── routes/                # 12 REST route controllers
│       └── services/              # Auth, Storage, Weather, Gemini, Crops, Disease
│
├── database/                      # [TIER 3: DATABASE] PostgreSQL Schema, Migrations & Provisioning
│   ├── package.json
│   ├── docker-compose.yml          # Local PostgreSQL 16 container setup
│   ├── schema.sql                 # Consolidated single-file PostgreSQL DDL
│   ├── .env.example               # Database connection string templates
│   ├── README.md                  # Database documentation
│   ├── migrations/                # Versioned SQL migrations
│   │   ├── 001_initial_schema.sql # Core tables, UUIDs, foreign keys, and indexes
│   │   ├── 002_row_level_security.sql # Multi-tenant RLS policies
│   │   ├── 003_seed_crop_catalog.sql # Agronomy seed data for Indian crops
│   │   └── 004_seed_demo_farmer.sql # Demo user (farmer@farmguard.ai) & demo farm
│   └── scripts/
│       ├── migrate.ts             # Standalone migration runner
│       ├── test-connection.ts     # Database latency and diagnostics tester
│       └── seed.ts                # Independent seed runner
│
├── packages/
│   └── shared/                    # Shared TypeScript types & Zod validation schemas
│       ├── package.json
│       ├── tsconfig.json
│       └── src/
│           ├── index.ts
│           └── schemas/           # Common, Auth, Farm, Soil, Weather, Crops, Disease, Assistant
│
├── services/
│   └── disease-inference/         # Python FastAPI Computer Vision Microservice
│       ├── requirements.txt
│       ├── README.md
│       ├── app/
│       │   ├── main.py            # FastAPI endpoints (/health, /manifest, /predict)
│       │   ├── config.py          # Service settings and thresholds
│       │   ├── preprocessor.py    # OpenCV decode, dimension validation, RGB normalization
│       │   └── classifier.py      # TensorFlow model loader, calibrated prediction, abstention
│       ├── model/
│       │   ├── model_manifest.json# Model architecture, classes, metrics, and thresholds
│       │   └── manifest.schema.json
│       └── scripts/               # Dataset preparation, training, and evaluation scripts
│
├── docs/                          # Comprehensive architectural and agronomy documentation
│   ├── setup.md                   # Installation, configuration, and deployment guide
│   ├── architecture.md            # System architecture, security model, and data isolation
│   ├── model-card.md              # ML model architecture, dataset, performance, limitations
│   ├── crop-data-sources.md       # ICAR, PJTSAU, ANGRAU crop citations and agronomy formulas
│   └── privacy.md                 # Farmer data sovereignty, retention, and deletion policy
└── private-uploads/               # Private authenticated file directory for leaf photographs
```

---

## Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS, Lucide React, HTML5 Web Speech API |
| **Backend API** | Node.js, Express.js 4, TypeScript, Zod, Helmet, Bcrypt, Multer, Cookie-Parser |
| **AI & LLM** | Google Gemini (`@google/genai` 2.32+), Strict Zod Structured Output Parsing |
| **Computer Vision** | Python 3.11, FastAPI, OpenCV (cv2), TensorFlow 2.15 / Keras, NumPy, Pillow |
| **Database** | PostgreSQL 14+, Row Level Security (RLS), Parameterized SQL, Connection Pooling |
| **Weather** | Open-Meteo REST API (Hourly & Daily forecasts, WMO Weather Codes, In-memory TTL Cache) |
| **Security** | Multi-tenant RLS, Magic Byte file validation, Rate Limiting, HTTP-only SameSite Cookies |

---

## Quickstart & Local Setup

### 1. Prerequisites
- **Node.js**: `v20.x` or `v22.x+` (verified on Node `v26.13.0`)
- **Python**: `3.10+` or `3.11`
- **PostgreSQL**: PostgreSQL 14+ (optional for local testing; platform includes an automatic high-fidelity in-memory storage fallback)

### 2. Configure Environment & Supabase Database
```bash
cp .env.example .env
```

To connect Supabase PostgreSQL:
1. In your **Supabase Project Settings -> Database**, copy the **Connection string (URI)**.
2. Update `.env`:
```ini
DATABASE_URL=postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres?sslmode=require
DATABASE_PROVIDER=supabase
```
3. Test connectivity and run database migrations:
```bash
npm run db:test
npm run db:migrate
```

### 3. Install Node Dependencies & Build Workspaces
```bash
npm install
npm run build
```

### 4. Start Python Disease Inference Microservice
In a separate terminal:
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

### 5. Start Backend API & Frontend Web Application
In the root project directory:
```bash
# Start API (port 3000)
npm run dev:api

# In another terminal: Start Web Client (port 5173)
npm run dev:web
```

Open your browser at **`http://localhost:5173`**.

---

## Demo Credentials

For immediate exploration and testing without manual registration, use the pre-configured demo account (or click **"Quick Fill Demo Farmer"** on the login screen):

- **Email**: `farmer@farmguard.ai`
- **Password**: `FarmGuard123!`
- **Demo Data Pre-loaded**:
  - Farm: *Sri Lakshmi Farms* (Warangal, Telangana)
  - Fields: *North Paddy Field* (Rice) & *Cotton Patch* (Cotton)
  - Pre-loaded soil test measurements with freshness tracking
  - Sample disease assessments and recommendations

---

## Bilingual Experience (English & Telugu)

FarmGuard AI provides complete bilingual parity. Every UI string, form validation message, navigation item, and agricultural term is translated:

- **Instant Language Toggle**: Easily switch languages with one click from the header or mobile navigation (`English` $\leftrightarrow$ `తెలుగు`).
- **Persistent Preference**: Language selection is saved to the farmer's profile and localStorage.
- **Telugu Agronomic Terminology**:
  - Paddy / Rice $\rightarrow$ వరి
  - Cotton $\rightarrow$ పత్తి
  - Soil Moisture $\rightarrow$ నేల తేమ
  - Soil pH $\rightarrow$ నేల క్షారత (pH)
  - Fungal Blast $\rightarrow$ అగ్గి తెగులు
  - Leaf Blight $\rightarrow$ ఆకు ఎండు తెగులు
- **Voice Interactions in Telugu**: Web Speech recognition configured to locale code `te-IN` allows farmers to speak their farming queries naturally.

---

## AI Leaf Disease Classification Service

The microservice located in `services/disease-inference` provides dedicated computer vision diagnostics:

1. **Preprocessing Pipeline**:
   - Accepts raw multipart image uploads.
   - Decodes image bytes using OpenCV: `cv2.imdecode(np_arr, cv2.IMREAD_COLOR)`.
   - Checks dimensions ($100 \times 100\text{ px}$ minimum to $4096 \times 4096\text{ px}$ maximum).
   - Converts color space from OpenCV standard BGR to RGB.
   - Resizes using high-quality interpolation (`cv2.INTER_AREA` / `cv2.INTER_LINEAR`) to $(224, 224, 3)$.
   - Normalizes pixel values to $[0.0, 1.0]$.
2. **Supported Disease Classes**:
   - `tomato_early_blight`: Tomato Early Blight (*Alternaria solani*)
   - `tomato_late_blight`: Tomato Late Blight (*Phytophthora infestans*)
   - `tomato_healthy`: Healthy Tomato Leaf
   - `rice_blast`: Rice Blast (*Magnaporthe oryzae*)
   - `rice_brown_spot`: Rice Brown Spot (*Bipolaris oryzae*)
   - `rice_healthy`: Healthy Rice Leaf
   - `cotton_bacterial_blight`: Cotton Bacterial Blight (*Xanthomonas citri*)
   - `cotton_healthy`: Healthy Cotton Leaf
3. **Calibrated Safety & Abstention Rules**:
   - **Confidence Threshold**: $\ge 0.75$. If the top predicted class probability is $< 0.75$, the model abstains (`status: "uncertain"`).
   - Practical, non-chemical agronomy recommendations are displayed alongside instructions on how to take clear leaf photos and contact local agricultural extension officers.

---

## Deterministic Crop Recommendation Engine

Recommendations do not rely on ungrounded generative AI hallucinations. Suitability is computed deterministically using weighted agronomic criteria:

$$\text{Final Score} = 0.25 \cdot S_{\text{pH}} + 0.20 \cdot S_{\text{Moisture}} + 0.20 \cdot S_{\text{Season}} + 0.20 \cdot S_{\text{Temp}} + 0.15 \cdot S_{\text{NPK}}$$

- **Factor Breakdown**:
  - **pH Compatibility (25%)**: $1.0$ if within optimal range; linearly penalized down to $0.4$ in tolerable range; $0.0$ if outside tolerable range.
  - **Moisture Compatibility (20%)**: Matched against crop water requirements (submerged vs. drought-tolerant).
  - **Season Alignment (20%)**: Matches current month against Indian cropping seasons:
    - *Kharif* (June – October)
    - *Rabi* (November – March)
    - *Zaid* (April – May)
  - **Temperature Compatibility (20%)**: Compares current/forecast temperature against optimal thermal growth envelope.
  - **NPK Fertility Balance (15%)**: Assesses soil nutrient availability against crop requirements.

The crop catalog is pre-seeded with 9 staple Indian crops (Rice, Cotton, Maize, Groundnut, Tomato, Red Gram, Bengal Gram, Chilli, Turmeric) with full academic citations from **ICAR**, **PJTSAU**, and **ANGRAU**. See [docs/crop-data-sources.md](file:///docs/crop-data-sources.md).

---

## Hyper-Local Weather & Agricultural Risk Alerts

The weather engine integrates directly with **Open-Meteo**:
- **Automatic Coordinate Resolution**: Uses the coordinates associated with the selected farm or field.
- **In-Memory TTL Caching**: Forecasts are cached for 30 minutes to reduce external network overhead.
- **Deterministic Agricultural Alerts**:
  - **Heavy Rain Warning**: Precipitation forecast $\ge 35\text{ mm}$ in 24 hours. Action: Clear field drainage channels, suspend pesticide spraying.
  - **Extreme Heat Stress**: Maximum temperature $\ge 39^\circ\text{C}$. Action: Provide light evening irrigation, avoid midday fertilizer application.
  - **Frost / Cold Shock**: Minimum temperature $\le 7^\circ\text{C}$. Action: Protect nursery beds with plastic mulch or smoke mulching.
  - **High Wind Warning**: Wind gusts $\ge 35\text{ km/h}$. Action: Provide mechanical staking for horticultural crops, postpone aerial foliar spraying.
  - **Prolonged Dry Spell**: 7+ consecutive days with zero rainfall and soil moisture $< 35\%$. Action: Schedule urgent supplementary irrigation.

---

## IoT & Soil Telemetry Ingestion

FarmGuard AI allows fields to be monitored via automated sensor probes or manual testing:
- **Direct Sensor Ingestion**: IoT devices send readings directly via `POST /api/v1/sensors/telemetry`:
  ```http
  POST /api/v1/sensors/telemetry HTTP/1.1
  Host: localhost:3000
  Content-Type: application/json
  X-Device-Token: your_secret_device_token

  {
    "moisturePercentage": 48.5,
    "ph": 6.8,
    "temperatureCelsius": 28.2,
    "nitrogenPpm": 180,
    "phosphorusPpm": 42,
    "potassiumPpm": 210
  }
  ```
- **Freshness Indicators**:
  - `Fresh` ($< 7\text{ days}$): Displayed in vibrant emerald green.
  - `Aging` ($7–30\text{ days}$): Displayed in warm amber with advisory to re-test soon.
  - `Stale` ($> 30\text{ days}$): Displayed in rose red with a clear alert indicating out-of-date soil readings.

---

## Data Sovereignty & Row Level Security (RLS)

FarmGuard AI guarantees complete tenant data isolation:
- **PostgreSQL Row Level Security (RLS)** is enabled and forced on all user-owned tables (`farms`, `fields`, `soil_readings`, `disease_assessments`, `conversations`, etc.).
- Every database query executed via the repository runs wrapped in `withUserTransaction(userId, ...)` which executes:
  ```sql
  SET LOCAL app.user_id = '<authenticated_user_id>';
  ```
- Any unauthorized cross-tenant query attempt is rejected at the database engine level.
- **Data Export**: Farmers can export all their personal and farm records anytime as a single JSON file.
- **Permanent Account Deletion**: Cascading deletion permanently removes all profile information, fields, telemetry, conversations, and physical leaf photographs from the server.

---

## REST API Reference

| Endpoint | Method | Description | Auth Required |
| :--- | :---: | :--- | :---: |
| `/api/v1/health` | GET | Liveness health check | No |
| `/api/v1/ready` | GET | Readiness check (DB, Weather, Gemini, ML Service) | No |
| `/api/v1/auth/signup` | POST | Register farmer account | No |
| `/api/v1/auth/login` | POST | Authenticate & issue HTTP-only session cookie | No |
| `/api/v1/auth/logout` | POST | Destroy active session | Yes |
| `/api/v1/auth/me` | GET | Retrieve currently authenticated user profile | Yes |
| `/api/v1/farms` | GET, POST | List and create farms | Yes |
| `/api/v1/farms/:farmId` | GET, PUT, DELETE | Retrieve, update, or remove farm | Yes |
| `/api/v1/farms/:farmId/fields` | GET, POST | List and create fields in a farm | Yes |
| `/api/v1/fields/:fieldId/soil` | GET, POST | List soil history & record new soil reading | Yes |
| `/api/v1/sensors/telemetry` | POST | Ingest IoT sensor reading via `X-Device-Token` | Device Token |
| `/api/v1/disease/assess` | POST | Upload leaf image for disease classification | Yes |
| `/api/v1/disease/images/:id` | GET | Stream authenticated private leaf photograph | Yes |
| `/api/v1/weather/forecast` | GET | 7-day forecast & agricultural risk alerts | Yes |
| `/api/v1/recommendations/crops`| GET | Deterministic crop suitability ranking | Yes |
| `/api/v1/assistant/chat` | POST | Send voice transcript or text query to AI | Yes |
| `/api/v1/history` | GET | Searchable audit history across all farm events | Yes |
| `/api/v1/account/export` | GET | Full GDPR/DPDP farmer data export (JSON) | Yes |
| `/api/v1/account/delete` | POST | Permanent account and data deletion | Yes |

---

## Documentation Index

Explore the comprehensive guides located in the `docs/` folder:

- **[docs/setup.md](file:///docs/setup.md)**: Exhaustive setup guide covering node installation, Python virtualenv, environment variables, and migration instructions.
- **[docs/architecture.md](file:///docs/architecture.md)**: Deep dive into the multi-tier system architecture, PostgreSQL RLS policies, and security boundaries.
- **[docs/model-card.md](file:///docs/model-card.md)**: Complete model card for the MobileNetV2 disease classifier, training methodology, metrics, and safety abstention rules.
- **[docs/crop-data-sources.md](file:///docs/crop-data-sources.md)**: University citations (ICAR, PJTSAU, ANGRAU) and agronomic mathematical scoring formulas.
- **[docs/privacy.md](file:///docs/privacy.md)**: Farmer data sovereignty policy, telemetry privacy, and data retention guidelines.

---

## Verification & Health Checks

You can verify the status of the platform at any time:

```bash
# Verify API Liveness
curl http://localhost:3000/api/v1/health

# Verify Full System Readiness
curl http://localhost:3000/api/v1/ready
```

Expected readiness output:
```json
{
  "status": "ready",
  "database": { "connected": true, "type": "postgres_rls" },
  "weatherService": { "provider": "open-meteo", "healthy": true },
  "geminiService": { "configured": true, "model": "gemini-1.5-flash" },
  "mlService": { "url": "http://127.0.0.1:8001", "healthy": true }
}
```

---

## License

This project is licensed under the Apache License 2.0. See the `LICENSE` file for details. Built with care for the farming community.

