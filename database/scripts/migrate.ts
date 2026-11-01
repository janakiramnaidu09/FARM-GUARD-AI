import fs from 'fs';
import path from 'path';
import pg from 'pg';
import dotenv from 'dotenv';

// Load environment variables from local .env or parent .env
dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl || databaseUrl.trim() === '') {
  console.error('[Database Migrator] ERROR: DATABASE_URL is not set.');
  console.error('Please configure DATABASE_URL in database/.env or root .env');
  process.exit(1);
}

const isSupabase =
  process.env.DATABASE_PROVIDER === 'supabase' ||
  databaseUrl.includes('supabase.co') ||
  databaseUrl.includes('pooler.supabase.com') ||
  databaseUrl.includes('sslmode=require');

let connectionString = databaseUrl;
if (isSupabase) {
  connectionString = connectionString.replace(/[?&]sslmode=[^&]+/g, '');
}

const pool = new pg.Pool({
  connectionString,
  ssl: isSupabase ? { rejectUnauthorized: false } : undefined,
  max: 5,
  connectionTimeoutMillis: 10000,
});

async function main() {
  console.log('====================================================');
  console.log('  🗄️  FarmGuard AI - Standalone Database Migrator');
  console.log('====================================================');

  const client = await pool.connect();
  try {
    const dbInfo = await client.query('SELECT current_database() as db_name, version() as db_version');
    console.log(`[Migrator] Connected to database: ${dbInfo.rows[0].db_name}`);

    // Ensure _migrations tracker table exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS _migrations (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);

    // Find migrations folder
    let migrationsDir = path.resolve(__dirname, '../migrations');
    if (!fs.existsSync(migrationsDir)) {
      migrationsDir = path.resolve(process.cwd(), 'migrations');
    }
    if (!fs.existsSync(migrationsDir)) {
      migrationsDir = path.resolve(process.cwd(), 'database/migrations');
    }

    if (!fs.existsSync(migrationsDir)) {
      console.error(`[Migrator] Migrations directory not found at: ${migrationsDir}`);
      process.exit(1);
    }

    const files = fs
      .readdirSync(migrationsDir)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    console.log(`[Migrator] Found ${files.length} migration files in ${migrationsDir}`);

    let appliedCount = 0;
    for (const file of files) {
      const check = await client.query('SELECT 1 FROM _migrations WHERE name = $1', [file]);
      if (check.rows.length === 0) {
        console.log(`[Migrator] Applying: ${file}...`);
        const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');

        await client.query('BEGIN');
        try {
          await client.query(sql);
          await client.query('INSERT INTO _migrations (name) VALUES ($1)', [file]);
          await client.query('COMMIT');
          console.log(`[Migrator]  Migration ${file} applied successfully.`);
          appliedCount++;
        } catch (err) {
          await client.query('ROLLBACK');
          console.error(`[Migrator] ❌ Failed to apply ${file}:`, err);
          throw err;
        }
      } else {
        console.log(`[Migrator] ⏩ ${file} (already applied)`);
      }
    }

    console.log(`[Migrator] Done! ${appliedCount} new migrations applied. Database is up to date.`);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error('[Fatal Error]', err.message);
  process.exit(1);
});
