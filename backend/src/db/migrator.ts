import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getPool } from './pool.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function runMigrations(): Promise<void> {
  const pool = getPool();
  if (!pool) {
    console.warn('[Migrator] DATABASE_URL not configured. Skipping migrations.');
    return;
  }

  const client = await pool.connect();
  try {
    console.log('[Migrator] Verifying database migration table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS _migrations (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);

    const potentialDirs = [
      path.resolve(process.cwd(), 'database/migrations'),
      path.resolve(process.cwd(), '../database/migrations'),
      path.resolve(process.cwd(), '../../database/migrations'),
      path.resolve(process.cwd(), 'backend/src/db/migrations'),
      path.resolve(process.cwd(), 'src/db/migrations'),
      path.resolve(process.cwd(), 'dist/db/migrations'),
      path.resolve(__dirname, './migrations'),
      path.resolve(__dirname, '../../../database/migrations'),
    ];

    let migrationsDir = potentialDirs.find((dir) => fs.existsSync(dir));
    if (!migrationsDir) {
      console.warn(`[Migrator] Migrations directory could not be located in any of:`, potentialDirs);
      return;
    }

    const files = fs
      .readdirSync(migrationsDir)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    for (const file of files) {
      const alreadyApplied = await client.query(
        'SELECT 1 FROM _migrations WHERE name = $1',
        [file]
      );

      if (alreadyApplied.rows.length === 0) {
        console.log(`[Migrator] Applying migration: ${file}...`);
        const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');

        await client.query('BEGIN');
        try {
          await client.query(sql);
          await client.query('INSERT INTO _migrations (name) VALUES ($1)', [file]);
          await client.query('COMMIT');
          console.log(`[Migrator] Migration ${file} successfully applied.`);
        } catch (err) {
          await client.query('ROLLBACK');
          console.error(`[Migrator] Failed applying migration ${file}:`, err);
          throw err;
        }
      }
    }
    console.log('[Migrator] All database migrations are up to date.');
  } finally {
    client.release();
  }
}
