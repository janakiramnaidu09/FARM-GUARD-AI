# FarmGuard AI — Privacy Policy & Data Sovereignty Charter

FarmGuard AI is built on the principle of **Farmer Data Sovereignty**. We believe that agricultural holdings, soil fertility records, field boundaries, and crop yields belong strictly to the farmer.

---

## 1. Data Collection & Usage Principles

### Farm & Field Location Data
- **Purpose**: GPS coordinates (latitude/longitude) are used strictly to query real meteorological forecast data from Open-Meteo and to determine regional climate suitability for crop recommendations.
- **Consent**: Browser geolocation requires explicit farmer consent. Manual entry of village, district, and state is always supported.

### Soil & Telemetry Data
- Soil moisture, pH, temperature, and NPK measurements are stored strictly within the farmer's private account.
- Telemetry from authenticated IoT sensors is linked only to the farmer's designated field via cryptographic device tokens.
- Sensor data is clearly distinguished from manual farmer entries and flagged for freshness.

### Leaf Disease Photographs
- Leaf images submitted for disease detection are scanned privately.
- Files are verified using file signatures (magic bytes) to reject non-image payloads.
- Images are stored in private local directories or private Supabase Storage buckets.
- Permanent public URLs are **never** created or exposed.
- Image streaming requires active session authentication.

### Voice & Audio Data
- Telugu and English voice interactions are processed in real-time through the browser's native Web Speech API.
- Raw voice audio recordings are **never** stored on FarmGuard servers.

---

## 2. Multi-Tenant Data Isolation

- Every relational table enforces PostgreSQL Row Level Security (RLS).
- All queries run under the transaction-local context `SET LOCAL app.user_id = '<user_id>'`.
- Attempting cross-account reads, updates, or deletes triggers an immediate database denial.

---

## 3. Data Retention & Deletion Rights

### Data Export
Under Settings, farmers can click **"Export My Farm Data"** at any time to download an unencrypted JSON archive containing all farms, fields, soil readings, disease assessments, and chat histories.

### Account & Data Deletion
Under Settings, farmers can request permanent account deletion by providing their password and typing the confirmation phrase `DELETE_MY_ACCOUNT`. This executes a cascading SQL delete:
- Deletes user profile
- Deletes all sessions
- Deletes all farms and fields
- Deletes all soil measurements
- Deletes all disease assessments and removes private image files from disk
- Deletes all recommendation and conversation records
- Clears session cookies immediately

