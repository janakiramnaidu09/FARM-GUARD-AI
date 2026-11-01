import { runMigrations } from '../db/migrator.js';
import { testConnection } from '../db/pool.js';
import { config } from '../config/env.js';

async function main() {
  console.log('========================================================');
  console.log('  🚀 FarmGuard AI — Database Migration Runner');
  console.log('========================================================\n');

  if (!config.DATABASE_URL || config.DATABASE_URL.trim().length === 0) {
    console.error('❌ ERROR: DATABASE_URL is not set in your .env file.');
    console.log('Please set DATABASE_URL in .env before running migrations.\n');
    process.exit(1);
  }

  if (config.DATABASE_URL.startsWith('http://') || config.DATABASE_URL.startsWith('https://')) {
    console.error('❌ ERROR: DATABASE_URL is set to an HTTP web address (' + config.DATABASE_URL + ').');
    console.error('PostgreSQL requires a database URI starting with postgresql://\n');
    console.log('Find your connection string in: https://supabase.com/dashboard/project/nvmctsyyhojhwudaaron/settings/database\n');
    process.exit(1);
  }

  const maskedUrl = config.DATABASE_URL.replace(/:([^:@]+)@/, ':****@');
  console.log(`Target Database: ${maskedUrl}`);
  console.log(`Database Provider: ${config.DATABASE_PROVIDER}\n`);

  console.log('Verifying connection...');
  const connected = await testConnection();
  if (!connected) {
    console.error('❌ Could not connect to database. Check credentials and network.');
    process.exit(1);
  }

  console.log('Executing migrations...');
  await runMigrations();

  console.log('\n========================================================');
  console.log('  ✅ Database migrations successfully applied!');
  console.log('========================================================\n');
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});

