import pg from 'pg';
import { getPool, setIsConnected } from './pool.js';

export class DatabaseUnavailableError extends Error {
  public code = 'DATABASE_UNAVAILABLE';
  constructor(message = 'PostgreSQL database connection is not available. Please configure DATABASE_URL in .env.') {
    super(message);
    this.name = 'DatabaseUnavailableError';
  }
}

/**
 * Executes a callback within a scoped PostgreSQL transaction enforcing
 * multi-tenant Row Level Security via `SET LOCAL app.user_id = $1`.
 */
export async function withUserTransaction<T>(
  userId: string,
  callback: (client: pg.PoolClient) => Promise<T>
): Promise<T> {
  if (!userId || typeof userId !== 'string' || userId.trim() === '') {
    throw new Error('Invalid user ID provided to withUserTransaction');
  }

  const pool = getPool();
  if (!pool) {
    throw new DatabaseUnavailableError();
  }

  let client: pg.PoolClient;
  try {
    client = await pool.connect();
  } catch (err: any) {
    setIsConnected(false);
    throw new DatabaseUnavailableError(`PostgreSQL connection failed: ${err.message}`);
  }

  try {
    await client.query('BEGIN');
    // Set transaction-local setting for RLS policies using parameter-safe set_config
    await client.query("SELECT set_config('app.user_id', $1, true)", [userId]);

    const result = await callback(client);

    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Executes an administrative or pre-authentication query outside of user RLS,
 * such as credential lookup via fn_lookup_user_for_auth.
 */
export async function withAdminQuery<T>(
  callback: (client: pg.PoolClient) => Promise<T>
): Promise<T> {
  const pool = getPool();
  if (!pool) {
    throw new DatabaseUnavailableError();
  }

  let client: pg.PoolClient;
  try {
    client = await pool.connect();
  } catch (err: any) {
    setIsConnected(false);
    throw new DatabaseUnavailableError(`PostgreSQL connection failed: ${err.message}`);
  }

  try {
    return await callback(client);
  } finally {
    client.release();
  }
}

