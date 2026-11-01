import path from 'path';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl || databaseUrl.trim() === '') {
  console.error('[Database Test] ERROR: DATABASE_URL is not set.');
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
  max: 2,
  connectionTimeoutMillis: 10000,
});

async function main() {
  console.log('====================================================');
  console.log('  🔍 FarmGuard AI - Database Diagnostics & Test');
  console.log('====================================================');

  const start = Date.now();
  try {
    const client = await pool.connect();
    try {
      const pingTime = Date.now() - start;
      const res = await client.query('SELECT current_database() as db_name, version() as db_version, now() as server_time');
      const row = res.rows[0];

      console.log(`[Database Test]  Connection successful! (Round-trip: ${pingTime}ms)`);
      console.log(`[Database Test]  Database Name : ${row.db_name}`);
      console.log(`[Database Test]  Server Time   : ${row.server_time}`);
      console.log(`[Database Test]  Version       : ${row.db_version.split('\n')[0]}`);

      // Query table list
      const tablesRes = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name;
      `);

      console.log(`\n[Database Test] Public Tables (${tablesRes.rows.length}):`);
      for (const t of tablesRes.rows) {
        console.log(`  - ${t.table_name}`);
      }

      // Check migration status
      const migCheck = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = '_migrations'
        );
      `);

      if (migCheck.rows[0].exists) {
        const migs = await client.query('SELECT name, applied_at FROM _migrations ORDER BY id ASC');
        console.log(`\n[Database Test] Applied Migrations (${migs.rows.length}):`);
        for (const m of migs.rows) {
          console.log(`   ${m.name} (${m.applied_at.toISOString()})`);
        }
      } else {
        console.log('\n[Database Test] ⚠️  _migrations table not found yet. Run `npm run migrate` to apply migrations.');
      }
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('[Database Test] ❌ Connection failed:', (error as Error).message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
