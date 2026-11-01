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
        throw new Error('An account with this email address already exists.');
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
    return await withAdminQuery(async (client) => {
      // Check existing email
      const existing = await client.query('SELECT id FROM users WHERE lower(email) = lower($1)', [req.email]);
      if (existing.rows.length > 0) {
        throw new Error('An account with this email address already exists.');
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

      return await this.createDbSession(client, user, userAgent, ip);
    });
  }

  async login(req: LoginRequest, userAgent?: string, ip?: string): Promise<AuthSession> {
    const pool = getPool();

    if (!pool) {
      const u = memoryUsers.get(req.email.toLowerCase());
      if (!u || u.disabledAt) {
        throw new Error('Invalid email or password.');
      }
      const valid = await bcrypt.compare(req.password, u.passwordHash);
      if (!valid) {
        throw new Error('Invalid email or password.');
      }
      return this.createMemorySession(u, userAgent, ip);
    }

    return await withAdminQuery(async (client) => {
      // Pre-auth lookup using secured database function
      const lookupRes = await client.query(
        'SELECT * FROM fn_lookup_user_for_auth($1)',
        [req.email.toLowerCase()]
      );

      if (lookupRes.rows.length === 0) {
        throw new Error('Invalid email or password.');
      }

      const u = lookupRes.rows[0];
      if (u.disabled_at) {
        throw new Error('This account has been deactivated.');
      }

      const valid = await bcrypt.compare(req.password, u.password_hash);
      if (!valid) {
        throw new Error('Invalid email or password.');
      }

      const user: User = {
        id: u.id,
        email: u.email,
        displayName: u.display_name,
        preferredLanguage: u.preferred_language,
        emailVerifiedAt: null,
        disabledAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      return await this.createDbSession(client, user, userAgent, ip);
    });
  }

  async refresh(refreshToken: string, userAgent?: string, ip?: string): Promise<AuthSession> {
    const tokenHash = hashToken(refreshToken);
    const pool = getPool();

    if (!pool) {
      const session = Array.from(memorySessions.values()).find(
        (s) => s.refreshTokenHash === tokenHash && !s.revokedAt && new Date(s.expiresAt) > new Date()
      );
      if (!session) {
        throw new Error('Invalid or expired session token.');
      }
      const user = Array.from(memoryUsers.values()).find((u) => u.id === session.userId);
      if (!user) {
        throw new Error('User not found.');
      }
      // Rotate session
      session.revokedAt = new Date().toISOString();
      return this.createMemorySession(user, userAgent, ip);
    }

    return await withAdminQuery(async (client) => {
      const sessionRes = await client.query(
        'SELECT * FROM fn_lookup_session_by_token($1)',
        [tokenHash]
      );
      if (sessionRes.rows.length === 0) {
        throw new Error('Invalid or expired session token.');
      }
      const s = sessionRes.rows[0];
      if (s.revoked_at || new Date(s.expires_at) <= new Date()) {
        throw new Error('Session has expired or was revoked.');
      }

      // Revoke old session (token rotation)
      await client.query('UPDATE sessions SET revoked_at = now() WHERE id = $1', [s.id]);

      // Fetch user profile
      const userRes = await client.query('SELECT * FROM users WHERE id = $1', [s.user_id]);
      if (userRes.rows.length === 0) {
        throw new Error('User not found.');
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
      if (!u) throw new Error('User not found.');
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
      if (res.rows.length === 0) throw new Error('User not found.');
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
      if (!u) throw new Error('User not found.');
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

