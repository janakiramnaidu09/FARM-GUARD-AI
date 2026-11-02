import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl || databaseUrl.trim() === '') {
  console.error('[Database Seed] ERROR: DATABASE_URL is not set.');
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
  max: 2,
});

async function main() {
  console.log('====================================================');
  console.log('  🌱 FarmGuard AI - Database Seeder');
  console.log('====================================================');

  const client = await pool.connect();
  try {
    let migrationsDir = path.resolve(__dirname, '../migrations');
    if (!fs.existsSync(migrationsDir)) {
      migrationsDir = path.resolve(process.cwd(), 'migrations');
    }
    if (!fs.existsSync(migrationsDir)) {
      migrationsDir = path.resolve(process.cwd(), 'database/migrations');
    }

    const seedFiles = [
      '003_seed_crop_catalog.sql',
      '004_seed_demo_farmer.sql'
    ];

    for (const file of seedFiles) {
      const filePath = path.join(migrationsDir, file);
      if (fs.existsSync(filePath)) {
        console.log(`[Seed] Applying seed file: ${file}...`);
        const sql = fs.readFileSync(filePath, 'utf-8');
        await client.query('BEGIN');
        try {
          await client.query(sql);
          await client.query('COMMIT');
          console.log(`[Seed]  ${file} applied successfully.`);
        } catch (err) {
          await client.query('ROLLBACK');
          console.error(`[Seed] ❌ Failed to apply seed ${file}:`, err);
        }
      } else {
        console.warn(`[Seed] ⚠️ Seed file not found: ${filePath}`);
      }
    }
    console.log('[Seed] Seeding completed.');
  } finally {
    client.release();
    await pool.end();
  }
}

main();
