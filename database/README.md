# FarmGuard AI — Database Service

This directory isolates the PostgreSQL database layer from the backend application logic. It contains database migrations, complete consolidated SQL schema, Row Level Security (RLS) policies, Docker Compose local database setup, and diagnostics/migration runners.

---

## Directory Structure

```
database/
├── migrations/                     # Versioned SQL migrations
│   ├── 001_initial_schema.sql      # Core tables, UUIDs, foreign keys, and indexes
│   ├── 002_row_level_security.sql  # Multi-tenant RLS policies (SET LOCAL app.user_id)
│   ├── 003_seed_crop_catalog.sql   # Agronomy seed data for Indian crops (ICAR/ANGRAU)
│   └── 004_seed_demo_farmer.sql    # Demo user (farmer@farmguard.ai) & demo farm
├── scripts/
│   ├── migrate.ts                  # Standalone migration runner with transaction safety
│   ├── test-connection.ts          # Database latency and diagnostics tester
│   └── seed.ts                     # Independent seed runner
├── docker-compose.yml              # Local PostgreSQL 16 container setup
├── schema.sql                      # Single consolidated SQL schema
├── package.json                    # Database workspace scripts
├── .env.example                    # Database environment variable templates
└── README.md                       # This documentation guide
```

---

## Quickstart

### Option 1: Using Local PostgreSQL with Docker Compose
1. Start the PostgreSQL container:
   ```bash
   docker compose up -d
   ```
2. Your PostgreSQL instance will be running on `localhost:5432` with database `farmguard`, user `postgres`, and password `postgrespassword`.
3. Test the connection:
   ```bash
   npm run test
   ```

### Option 2: Using Supabase or Managed PostgreSQL
1. Create a project at [Supabase](https://supabase.com).
2. Copy your connection URI to `database/.env`:
   ```bash
   DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?sslmode=require
   DATABASE_PROVIDER=supabase
   ```
3. Run the migrations:
   ```bash
   npm run migrate
   ```
4. Verify all tables and RLS policies:
   ```bash
   npm run test
   ```

---

## Available Commands

From within the `database` folder:
- `npm run test`: Test database connection, round-trip latency, public tables, and applied migrations.
- `npm run migrate`: Execute unapplied SQL migrations sequentially with tracking in `_migrations`.
- `npm run seed`: Apply crop catalog and demo farmer seed data.

From the root monorepo:
- `npm run db:test`: Run database connection diagnostics.
- `npm run db:migrate`: Run database migrations.
