# FarmGuard AI — System Architecture & Design Specification

FarmGuard AI is engineered as a secure, modular, multi-tenant agricultural advisory platform. This document outlines its architectural layers, data flows, and security boundaries.

---

## 1. High-Level System Architecture

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

## 2. Security & Data Isolation Architecture

### Multi-Tenant Row Level Security (RLS)
PostgreSQL Row Level Security is enabled and forced on all user tables:
```sql
ALTER TABLE farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE farms FORCE ROW LEVEL SECURITY;

CREATE POLICY farms_isolation_policy ON farms
  USING (owner_id = NULLIF(current_setting('app.user_id', true), '')::uuid)
  WITH CHECK (owner_id = NULLIF(current_setting('app.user_id', true), '')::uuid);
```
All authenticated queries must be executed through `withUserTransaction(userId, callback)`, which sets `SET LOCAL app.user_id = $1` within the transaction context before running parameterized SQL queries.

### Pre-Authentication Lookup Isolation
To prevent disabling RLS globally for login, user credential lookup is restricted to a narrow `SECURITY DEFINER` function:
```sql
CREATE OR REPLACE FUNCTION fn_lookup_user_for_auth(p_email TEXT)
RETURNS TABLE (...)
SECURITY DEFINER
AS $$ ... $$;
```

### Storage Privacy Boundary
Uploaded leaf photographs are validated for magic byte signatures (`FF D8 FF` for JPEG, `89 50 4E 47` for PNG, `RIFF...WEBP` for WebP). Files are stored in private storage (or private Supabase Storage buckets). No permanent public URLs exist. Images can only be streamed to the user via authenticated short-lived endpoints (`/api/v1/disease-assessments/:id/image`) verified against the user's active session.

---

## 3. Generative AI Safety & Deterministic Bounds

Gemini 1.5 is integrated strictly through `@google/genai` on the server:
1. **Separation of Concerns**: Gemini **never** calculates crop rankings or disease classification scores. Crop suitability scores are calculated deterministically by `CropRankingService` based on ICAR agronomy thresholds.
2. **Explanations Only**: Gemini is tasked only with translating the deterministic score factors into natural farmer language (Telugu or English).
3. **Structured Outputs**: All responses are validated against Section 15 schemas using Zod before returning to the user.
4. **Offline / Unconfigured Fallback**: If `GEMINI_API_KEY` is not provided, the application automatically falls back to deterministic rule-based explanations without failing.

---

## 4. Frontend Architecture

The frontend is built with **React 18**, **TypeScript**, and **Tailwind CSS**:
- **Mobile First**: Optimized for smartphones with a persistent bottom navigation bar.
- **Bilingual Context**: Full English and Telugu localization across all 14 routes.
- **Web Speech API**: Real-time voice recording in Telugu (`te-IN`) with speech wave animation, accompanied by speech synthesis for audio playback.

