import { config } from '../config/env.js';
import { testConnection, getPool } from '../db/pool.js';

async function main() {
  console.log('========================================================');
  console.log('  🔍 FarmGuard AI — Database Connection Diagnostics');
  console.log('========================================================\n');

  if (!config.DATABASE_URL || config.DATABASE_URL.trim().length === 0) {
    console.error('❌ ERROR: DATABASE_URL is not set in your .env file.\n');
    console.log('To connect Supabase:');
    console.log('1. Go to your Supabase Project Dashboard (https://supabase.com/dashboard)');
    console.log('2. Click Settings (gear icon) -> Database');
    console.log('3. Under "Connection string", select "URI" (or "Connection pooling")');
    console.log('4. Copy the URI and replace [YOUR-PASSWORD] with your database password');
    console.log('5. Add it to your .env file:');
    console.log('   DATABASE_URL=postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?sslmode=require');
    console.log('   DATABASE_PROVIDER=supabase\n');
    process.exit(1);
  }

  if (config.DATABASE_URL.startsWith('http://') || config.DATABASE_URL.startsWith('https://')) {
    console.error('❌ ERROR: DATABASE_URL is an HTTP web URL (' + config.DATABASE_URL + ').');
    console.error('PostgreSQL connections require a database URI starting with postgresql://\n');
    console.log('For your Supabase project (nvmctsyyhojhwudaaron):');
    console.log('1. Open Supabase Dashboard: https://supabase.com/dashboard/project/nvmctsyyhojhwudaaron/settings/database');
    console.log('2. Scroll down to "Connection parameters" or "Connection string" -> select "URI"');
    console.log('3. Copy the URI. It will look like:');
    console.log('   postgresql://postgres.nvmctsyyhojhwudaaron:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres?sslmode=require');
    console.log('   (or direct: postgresql://postgres:[YOUR-PASSWORD]@db.nvmctsyyhojhwudaaron.supabase.co:5432/postgres?sslmode=require)');
    console.log('4. Paste that into your .env file under DATABASE_URL with your database password.\n');
    process.exit(1);
  }

  // Obfuscate credentials for safe terminal printing
  const maskedUrl = config.DATABASE_URL.replace(/:([^:@]+)@/, ':****@');
  console.log(`Connecting to: ${maskedUrl}`);
  console.log(`Database Provider: ${config.DATABASE_PROVIDER}\n`);

  console.log('Testing connection with SSL...');
  const connected = await testConnection();

  if (!connected) {
    console.error('\n❌ Connection Failed! Common Supabase troubleshooting steps:');
    console.log('1. Password: If your password has special characters, ensure they are URL-encoded.');
    console.log('2. Port: Try Session Pooler (port 5432) or Transaction Pooler (port 6543) if direct connection fails.');
    console.log('3. Network Restrictions: In Supabase -> Settings -> Database -> Network Restrictions, ensure your IP is allowed (or allowed from 0.0.0.0/0).');
    process.exit(1);
  }

  console.log('✅ Connection established successfully!\n');

  const pool = getPool();
  if (pool) {
    const client = await pool.connect();
    try {
      // Query database version & tables
      const versionRes = await client.query('SELECT version()');
      console.log(`Server Info: ${versionRes.rows[0].version}\n`);

      const tablesRes = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name;
      `);

      const tables = tablesRes.rows.map((r) => r.table_name);
      console.log(`Existing Public Tables (${tables.length}):`);
      if (tables.length > 0) {
        console.log(tables.map((t) => ` - ${t}`).join('\n'));
      } else {
        console.log(' (No tables found yet. Run `npm run db:migrate` to initialize schema!)');
      }

      // Check migration table
      if (tables.includes('_migrations')) {
        const migRes = await client.query('SELECT name, applied_at FROM _migrations ORDER BY id ASC');
        console.log(`\nApplied Migrations (${migRes.rows.length}):`);
        migRes.rows.forEach((m) => {
          console.log(` - ${m.name} (applied: ${m.applied_at.toISOString()})`);
        });
      }
    } finally {
      client.release();
    }
  }

  console.log('\n========================================================');
  console.log('  🎉 Supabase database is connected and ready!');
  console.log('========================================================\n');
  process.exit(0);
}

main().catch((err) => {
  console.error('Unhandled error testing database:', err);
  process.exit(1);
});

