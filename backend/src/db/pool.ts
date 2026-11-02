import pg from 'pg';
import { config } from '../config/env.js';

const { Pool } = pg;

let pool: pg.Pool | null = null;
let isConnected = false;

const validPostgresProtocol =
  config.DATABASE_URL.startsWith('postgresql://') || config.DATABASE_URL.startsWith('postgres://');

if (config.DATABASE_URL && config.DATABASE_URL.trim().length > 0 && validPostgresProtocol) {
  const isSupabase =
    config.DATABASE_PROVIDER === 'supabase' ||
    config.DATABASE_URL.includes('supabase.co') ||
    config.DATABASE_URL.includes('pooler.supabase.com') ||
    config.DATABASE_URL.includes('sslmode=require');

  // If Supabase, strip sslmode parameter from the URL string so pg-connection-string
  // does not override ssl: { rejectUnauthorized: false }
  let connectionString = config.DATABASE_URL;
  if (isSupabase) {
    connectionString = connectionString.replace(/[?&]sslmode=[^&]+/g, '');
  }

  pool = new Pool({
    connectionString,
    ssl: isSupabase ? { rejectUnauthorized: false } : undefined,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });

  pool.on('error', (err) => {
    console.error('[DB] Unexpected error on idle client', err);
  });
}

export function getPool(): pg.Pool | null {
  return isConnected ? pool : null;
}

export function getRawPool(): pg.Pool | null {
  return pool;
}

export function setIsConnected(val: boolean): void {
  isConnected = val;
}

export async function testConnection(): Promise<boolean> {
  if (!pool) {
    isConnected = false;
    return false;
  }
  try {
    const client = await pool.connect();
    try {
      const res = await client.query("SELECT current_database() as db_name, version() as db_version");
      const dbInfo = res.rows[0];
      console.log(`[DB] Connected successfully to database: ${dbInfo.db_name}`);
      isConnected = true;
      return true;
    } finally {
      client.release();
    }
  } catch (error) {
    console.warn('[DB] Connection test failed:', (error as Error).message);
    isConnected = false;
    return false;
  }
}

export function isDbConnected(): boolean {
  return isConnected;
}

