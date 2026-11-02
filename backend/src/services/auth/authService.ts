import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { withAdminQuery, withUserTransaction } from '../../db/withUserTransaction.js';
import { getPool } from '../../db/pool.js';
import { User, SignupRequest, LoginRequest, UpdateProfile } from '@farmguard/shared';

export interface AuthSession {
  sessionId: string;
  refreshToken: string;
  expiresAt: string;
  user: User;
}

export class AuthError extends Error {
  public status: number;
  public code: string;
  constructor(message: string, status = 401, code = 'INVALID_CREDENTIALS') {
    super(message);
    this.name = 'AuthError';
    this.status = status;
    this.code = code;
  }
}

// Development in-memory user & session store when DATABASE_URL is not set
interface MemoryUser {
  id: string;
  email: string;
  passwordHash: string;
  displayName: string;
  preferredLanguage: 'en' | 'te';
  emailVerifiedAt?: string | null;
  disabledAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface MemorySession {
  id: string;
  userId: string;
  refreshTokenHash: string;
  expiresAt: string;
  revokedAt?: string | null;
  createdAt: string;
  lastUsedAt?: string | null;
}

const memoryUsers: Map<string, MemoryUser> = new Map();
const memorySessions: Map<string, MemorySession> = new Map();

// Seed a default demo farmer account in development memory store
const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001';
const demoPasswordHash = bcrypt.hashSync('FarmGuard123!', 10);

memoryUsers.set('farmer@farmguard.ai', {
  id: DEMO_USER_ID,
  email: 'farmer@farmguard.ai',
  passwordHash: demoPasswordHash,
  displayName: 'Ramesh Reddy (రమేష్ రెడ్డి)',
  preferredLanguage: 'te',
  emailVerifiedAt: new Date().toISOString(),
  disabledAt: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export class AuthService {
  async signup(req: SignupRequest, userAgent?: string, ip?: string): Promise<AuthSession> {
    const pool = getPool();
    const passwordHash = await bcrypt.hash(req.password, 10);
    const preferredLanguage = req.preferredLanguage || 'en';

    if (!pool) {
      // In-memory fallback
      if (memoryUsers.has(req.email.toLowerCase())) {
        throw new AuthError('An account with this email address already exists.', 409, 'EMAIL_EXISTS');
      }
      const userId = crypto.randomUUID();
      const now = new Date().toISOString();
      const user: MemoryUser = {
        id: userId,
        email: req.email.toLowerCase(),
        passwordHash,
        displayName: req.displayName,
        preferredLanguage,
        createdAt: now,
        updatedAt: now,
      };
      memoryUsers.set(req.email.toLowerCase(), user);

      return this.createMemorySession(user, userAgent, ip);
    }

    // PostgreSQL path using parameterized statements
    try {
      return await withAdminQuery(async (client) => {
        // Check existing email
        const existing = await client.query('SELECT id FROM users WHERE lower(email) = lower($1)', [req.email]);
        if (existing.rows.length > 0) {
          throw new AuthError('An account with this email address already exists.', 409, 'EMAIL_EXISTS');
        }

        const userRes = await client.query(
          `INSERT INTO users (email, password_hash, display_name, preferred_language)
           VALUES ($1, $2, $3, $4)
           RETURNING id, email, display_name, preferred_language, email_verified_at, disabled_at, created_at, updated_at`,
          [req.email.toLowerCase(), passwordHash, req.displayName, preferredLanguage]
        );

        const u = userRes.rows[0];
        const user: User = {
          id: u.id,
          email: u.email,
          displayName: u.display_name,
          preferredLanguage: u.preferred_language,
          emailVerifiedAt: u.email_verified_at ? u.email_verified_at.toISOString() : null,
          disabledAt: u.disabled_at ? u.disabled_at.toISOString() : null,
          createdAt: u.created_at.toISOString(),
          updatedAt: u.updated_at.toISOString(),
        };

        // Seed an initial farm for the new user so weather, fields, and dashboard work immediately
        try {
          await client.query("SELECT set_config('app.user_id', $1, true)", [user.id]);
          const farmRes = await client.query(
            `INSERT INTO farms (owner_id, name, country_code, state, district, locality, latitude, longitude, location_source, timezone)
             VALUES ($1, $2, 'IN', 'Telangana', 'Siddipet', 'Gajwel', 17.8524, 78.6833, 'default', 'Asia/Kolkata')
             RETURNING id`,
            [user.id, `${user.displayName}'s Farm`]
          );
          if (farmRes.rows.length > 0) {
            const farmId = farmRes.rows[0].id;
            await client.query(
              `INSERT INTO fields (owner_id, farm_id, name, area_value, area_unit, soil_type, current_crop_code, planting_date)
               VALUES ($1, $2, 'Main Field', 2.0, 'acre', 'Loam', 'rice', CURRENT_DATE)`,
              [user.id, farmId]
            );
            await client.query(
              `INSERT INTO alert_preferences (owner_id, farm_id, enabled, channels, thresholds)
               VALUES ($1, $2, true, '{"in_app":true,"sms":false,"email":false}'::jsonb, '{"heavyRainMm":25,"extremeHeatC":38,"frostC":4,"highWindKmh":35}'::jsonb)`,
              [user.id, farmId]
            );
          }
        } catch (fErr) {
          console.warn('[Auth] Note: Initial farm auto-creation skipped:', fErr);
        }

        return await this.createDbSession(client, user, userAgent, ip);
      });
    } catch (dbErr: any) {
      if (dbErr.code === 'DATABASE_UNAVAILABLE' || dbErr.name === 'DatabaseUnavailableError' || dbErr.code === 'ENOTFOUND') {
        console.warn('[Auth] Database unavailable during signup, creating memory session fallback:', dbErr.message);
        if (memoryUsers.has(req.email.toLowerCase())) {
          throw new AuthError('An account with this email address already exists.', 409, 'EMAIL_EXISTS');
        }
        const userId = crypto.randomUUID();
        const now = new Date().toISOString();
        const user: MemoryUser = {
          id: userId,
          email: req.email.toLowerCase(),
          passwordHash,
          displayName: req.displayName,
          preferredLanguage,
          createdAt: now,
          updatedAt: now,
        };
        memoryUsers.set(req.email.toLowerCase(), user);
        return this.createMemorySession(user, userAgent, ip);
      }
      throw dbErr;
    }
  }

  async login(req: LoginRequest, userAgent?: string, ip?: string): Promise<AuthSession> {
    const pool = getPool();

    if (!pool) {
      const u = memoryUsers.get(req.email.toLowerCase());
      if (!u || u.disabledAt) {
        throw new AuthError('Invalid email or password.', 401, 'INVALID_CREDENTIALS');
      }
      const valid = await bcrypt.compare(req.password, u.passwordHash);
      if (!valid) {
        throw new AuthError('Invalid email or password.', 401, 'INVALID_CREDENTIALS');
      }
      return this.createMemorySession(u, userAgent, ip);
    }

    try {
      return await withAdminQuery(async (client) => {
        let u: any = null;

        // Try stored function first
        try {
          const lookupRes = await client.query(
            'SELECT * FROM fn_lookup_user_for_auth($1)',
            [req.email.toLowerCase()]
          );
          if (lookupRes.rows.length > 0) {
            u = lookupRes.rows[0];
          }
        } catch (err: any) {
          console.warn('[Auth] fn_lookup_user_for_auth query failed, trying direct select:', err.message);
        }

        // If function did not exist or returned no rows, try direct query
        if (!u) {
          try {
            const directRes = await client.query(
              'SELECT id, email, password_hash, display_name, preferred_language, disabled_at FROM users WHERE lower(email) = lower($1) LIMIT 1',
              [req.email.toLowerCase()]
            );
            if (directRes.rows.length > 0) {
              u = directRes.rows[0];
            }
          } catch (dbErr: any) {
            console.warn('[Auth] Direct users query failed:', dbErr.message);
          }
        }

        // Check for demo farmer fallback if database wasn't seeded
        if (!u && req.email.toLowerCase() === 'farmer@farmguard.ai') {
          const valid = await bcrypt.compare(req.password, demoPasswordHash);
          if (valid) {
            console.log('[Auth] Authenticating demo farmer fallback into PostgreSQL...');
            try {
              const insRes = await client.query(
                `INSERT INTO users (id, email, password_hash, display_name, preferred_language, email_verified_at)
                 VALUES ($1, $2, $3, $4, 'te', now())
                 ON CONFLICT (lower(email)) DO UPDATE SET password_hash = EXCLUDED.password_hash
                 RETURNING id, email, display_name, preferred_language, disabled_at`,
                [DEMO_USER_ID, 'farmer@farmguard.ai', demoPasswordHash, 'Ramesh Reddy (రమేష్ రెడ్డి)']
              );
              u = insRes.rows[0];
            } catch (seedErr) {
              console.warn('[Auth] Demo user database seed failed, using in-memory demo session:', seedErr);
              return this.createMemorySession(memoryUsers.get('farmer@farmguard.ai')!, userAgent, ip);
            }
          }
        }

        if (!u) {
          throw new AuthError('Invalid email or password.', 401, 'INVALID_CREDENTIALS');
        }

        if (u.disabled_at) {
          throw new AuthError('This account has been deactivated.', 403, 'ACCOUNT_DEACTIVATED');
        }

        const valid = await bcrypt.compare(req.password, u.password_hash);
        if (!valid) {
          throw new AuthError('Invalid email or password.', 401, 'INVALID_CREDENTIALS');
        }

        const user: User = {
          id: u.id,
          email: u.email,
          displayName: u.display_name,
          preferredLanguage: u.preferred_language || 'en',
          emailVerifiedAt: null,
          disabledAt: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        try {
          return await this.createDbSession(client, user, userAgent, ip);
        } catch (sessionErr: any) {
          console.error('[Auth] Failed to create database session, falling back to memory session:', sessionErr.message);
          return this.createMemorySession(
            {
              id: user.id,
              email: user.email,
              passwordHash: u.password_hash,
              displayName: user.displayName,
              preferredLanguage: (user.preferredLanguage as any) || 'en',
              createdAt: user.createdAt,
              updatedAt: user.updatedAt,
            },
            userAgent,
            ip
          );
        }
      });
    } catch (connErr: any) {
      if (connErr.code === 'DATABASE_UNAVAILABLE' || connErr.name === 'DatabaseUnavailableError' || connErr.code === 'ENOTFOUND') {
        console.warn('[Auth] Database connection failed during login, using in-memory auth fallback:', connErr.message);
        const u = memoryUsers.get(req.email.toLowerCase());
        if (!u || u.disabledAt) {
          throw new AuthError('Invalid email or password.', 401, 'INVALID_CREDENTIALS');
        }
        const valid = await bcrypt.compare(req.password, u.passwordHash);
        if (!valid) {
          throw new AuthError('Invalid email or password.', 401, 'INVALID_CREDENTIALS');
        }
        return this.createMemorySession(u, userAgent, ip);
      }
      throw connErr;
    }
  }

  async refresh(refreshToken: string, userAgent?: string, ip?: string): Promise<AuthSession> {
    const tokenHash = hashToken(refreshToken);
    const pool = getPool();

    if (!pool) {
      const session = Array.from(memorySessions.values()).find(
        (s) => s.refreshTokenHash === tokenHash && !s.revokedAt && new Date(s.expiresAt) > new Date()
      );
      if (!session) {
        throw new AuthError('Invalid or expired session token.', 401, 'INVALID_SESSION');
      }
      const user = Array.from(memoryUsers.values()).find((u) => u.id === session.userId);
      if (!user) {
        throw new AuthError('User not found.', 404, 'USER_NOT_FOUND');
      }
      // Rotate session
      session.revokedAt = new Date().toISOString();
      return this.createMemorySession(user, userAgent, ip);
    }

    return await withAdminQuery(async (client) => {
      let s: any = null;
      try {
        const sessionRes = await client.query(
          'SELECT * FROM fn_lookup_session_by_token($1)',
          [tokenHash]
        );
        if (sessionRes.rows.length > 0) {
          s = sessionRes.rows[0];
        }
      } catch (err: any) {
        console.warn('[Auth] fn_lookup_session_by_token query failed, trying direct select:', err.message);
      }

      if (!s) {
        try {
          const directRes = await client.query(
            'SELECT id, user_id, expires_at, revoked_at FROM sessions WHERE refresh_token_hash = $1 LIMIT 1',
            [tokenHash]
          );
          if (directRes.rows.length > 0) {
            s = directRes.rows[0];
          }
        } catch (dbErr: any) {
          console.warn('[Auth] Direct session query failed:', dbErr.message);
        }
      }

      if (!s) {
        throw new AuthError('Invalid or expired session token.', 401, 'INVALID_SESSION');
      }
      if (s.revoked_at || new Date(s.expires_at) <= new Date()) {
        throw new AuthError('Session has expired or was revoked.', 401, 'SESSION_EXPIRED');
      }

      // Revoke old session (token rotation)
      await client.query('UPDATE sessions SET revoked_at = now() WHERE id = $1', [s.id]);

      // Set user id in transaction for RLS
      try {
        await client.query("SELECT set_config('app.user_id', $1, true)", [s.user_id]);
      } catch {}

      // Fetch user profile
      const userRes = await client.query('SELECT * FROM users WHERE id = $1', [s.user_id]);
      if (userRes.rows.length === 0) {
        throw new AuthError('User not found.', 404, 'USER_NOT_FOUND');
      }
      const u = userRes.rows[0];
      const user: User = {
        id: u.id,
        email: u.email,
        displayName: u.display_name,
        preferredLanguage: u.preferred_language,
        emailVerifiedAt: u.email_verified_at ? u.email_verified_at.toISOString() : null,
        disabledAt: u.disabled_at ? u.disabled_at.toISOString() : null,
        createdAt: u.created_at.toISOString(),
        updatedAt: u.updated_at.toISOString(),
      };

      return await this.createDbSession(client, user, userAgent, ip);
    });
  }

  async logout(refreshToken?: string): Promise<void> {
    if (!refreshToken) return;
    const tokenHash = hashToken(refreshToken);
    const pool = getPool();

    if (!pool) {
      for (const s of memorySessions.values()) {
        if (s.refreshTokenHash === tokenHash) {
          s.revokedAt = new Date().toISOString();
        }
      }
      return;
    }

    await withAdminQuery(async (client) => {
      await client.query('UPDATE sessions SET revoked_at = now() WHERE refresh_token_hash = $1', [tokenHash]);
    });
  }

  async getMe(userId: string): Promise<User> {
    const pool = getPool();
    if (!pool) {
      const u = Array.from(memoryUsers.values()).find((user) => user.id === userId);
      if (!u) throw new AuthError('User not found.', 404, 'USER_NOT_FOUND');
      return {
        id: u.id,
        email: u.email,
        displayName: u.displayName,
        preferredLanguage: u.preferredLanguage,
        emailVerifiedAt: u.emailVerifiedAt || null,
        disabledAt: u.disabledAt || null,
        createdAt: u.createdAt,
        updatedAt: u.updatedAt,
      };
    }

    return await withUserTransaction(userId, async (client) => {
      const res = await client.query('SELECT * FROM users WHERE id = $1', [userId]);
      if (res.rows.length === 0) throw new AuthError('User not found.', 404, 'USER_NOT_FOUND');
      const u = res.rows[0];
      return {
        id: u.id,
        email: u.email,
        displayName: u.display_name,
        preferredLanguage: u.preferred_language,
        emailVerifiedAt: u.email_verified_at ? u.email_verified_at.toISOString() : null,
        disabledAt: u.disabled_at ? u.disabled_at.toISOString() : null,
        createdAt: u.created_at.toISOString(),
        updatedAt: u.updated_at.toISOString(),
      };
    });
  }

  async updateProfile(userId: string, data: UpdateProfile): Promise<User> {
    const pool = getPool();
    if (!pool) {
      const u = Array.from(memoryUsers.values()).find((user) => user.id === userId);
      if (!u) throw new AuthError('User not found.', 404, 'USER_NOT_FOUND');
      if (data.displayName) u.displayName = data.displayName;
      if (data.preferredLanguage) u.preferredLanguage = data.preferredLanguage;
      u.updatedAt = new Date().toISOString();
      return {
        id: u.id,
        email: u.email,
        displayName: u.displayName,
        preferredLanguage: u.preferredLanguage,
        emailVerifiedAt: u.emailVerifiedAt || null,
        disabledAt: u.disabledAt || null,
        createdAt: u.createdAt,
        updatedAt: u.updatedAt,
      };
    }

    return await withUserTransaction(userId, async (client) => {
      const fields: string[] = [];
      const values: any[] = [];
      let idx = 1;

      if (data.displayName !== undefined) {
        fields.push(`display_name = $${idx++}`);
        values.push(data.displayName);
      }
      if (data.preferredLanguage !== undefined) {
        fields.push(`preferred_language = $${idx++}`);
        values.push(data.preferredLanguage);
      }

      if (fields.length === 0) {
        return this.getMe(userId);
      }

      values.push(userId);
      const query = `UPDATE users SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`;
      const res = await client.query(query, values);
      const u = res.rows[0];
      return {
        id: u.id,
        email: u.email,
        displayName: u.display_name,
        preferredLanguage: u.preferred_language,
        emailVerifiedAt: u.email_verified_at ? u.email_verified_at.toISOString() : null,
        disabledAt: u.disabled_at ? u.disabled_at.toISOString() : null,
        createdAt: u.created_at.toISOString(),
        updatedAt: u.updated_at.toISOString(),
      };
    });
  }

  private createMemorySession(user: MemoryUser, userAgent?: string, ip?: string): AuthSession {
    const refreshToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = hashToken(refreshToken);
    const sessionId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const session: MemorySession = {
      id: sessionId,
      userId: user.id,
      refreshTokenHash: tokenHash,
      expiresAt,
      createdAt: new Date().toISOString(),
      lastUsedAt: new Date().toISOString(),
    };
    memorySessions.set(sessionId, session);

    return {
      sessionId,
      refreshToken,
      expiresAt,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        preferredLanguage: user.preferredLanguage,
        emailVerifiedAt: user.emailVerifiedAt || null,
        disabledAt: user.disabledAt || null,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  }

  private async createDbSession(
    client: any,
    user: User,
    userAgent?: string,
    ip?: string
  ): Promise<AuthSession> {
    const refreshToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const ipHash = ip ? crypto.createHash('sha256').update(ip).digest('hex') : null;

    try {
      await client.query("SELECT set_config('app.user_id', $1, true)", [user.id]);
    } catch {}

    const sessionRes = await client.query(
      `INSERT INTO sessions (user_id, refresh_token_hash, expires_at, user_agent, ip_hash)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, expires_at`,
      [user.id, tokenHash, expiresAt, userAgent || null, ipHash]
    );

    return {
      sessionId: sessionRes.rows[0].id,
      refreshToken,
      expiresAt: sessionRes.rows[0].expires_at.toISOString(),
      user,
    };
  }
}

export const authService = new AuthService();

