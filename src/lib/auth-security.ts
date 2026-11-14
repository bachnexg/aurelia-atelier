import crypto from 'crypto';

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'admin';
  phone?: string;
  exp: number;
}

export const SESSION_COOKIE_NAME = 'aurelia_session';

// Production Admin Credentials (can be overridden in Vercel Environment Variables)
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'admin@aurelia-atelier.com').toLowerCase().trim();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Aurelia#Admin2026!Priv';
const AUTH_SECRET =
  process.env.AUTH_SECRET ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'aurelia-atelier-hmac-sha256-master-key-2026-prod-9f8e7d6c5b4a';

// In-memory brute-force rate limiter per IP
const loginAttempts = new Map<string, { count: number; lockUntil: number }>();
const MAX_ATTEMPTS = 5;
const LOCK_TIME_MS = 15 * 60 * 1000; // 15 minutes

export function checkRateLimit(ip: string): { allowed: boolean; retryAfterSeconds?: number } {
  const now = Date.now();
  const record = loginAttempts.get(ip);
  if (!record) return { allowed: true };

  if (record.lockUntil > now) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((record.lockUntil - now) / 1000),
    };
  }

  if (record.lockUntil !== 0 && record.lockUntil <= now) {
    loginAttempts.delete(ip);
  }
  return { allowed: true };
}

export function recordFailedAttempt(ip: string): void {
  const now = Date.now();
  const record = loginAttempts.get(ip) || { count: 0, lockUntil: 0 };
  record.count += 1;
  if (record.count >= MAX_ATTEMPTS) {
    record.lockUntil = now + LOCK_TIME_MS;
  }
  loginAttempts.set(ip, record);
}

export function clearFailedAttempts(ip: string): void {
  loginAttempts.delete(ip);
}

export function verifyAdminCredentials(email: string, password: string): boolean {
  const cleanEmail = email.toLowerCase().trim();
  const emailHashA = crypto.createHash('sha256').update(cleanEmail).digest();
  const emailHashB = crypto.createHash('sha256').update(ADMIN_EMAIL).digest();

  const passHashA = crypto.createHash('sha256').update(password).digest();
  const passHashB = crypto.createHash('sha256').update(ADMIN_PASSWORD).digest();

  const emailMatch = crypto.timingSafeEqual(emailHashA, emailHashB);
  const passMatch = crypto.timingSafeEqual(passHashA, passHashB);

  return emailMatch && passMatch;
}

export function signSessionToken(user: Omit<SessionUser, 'exp'>, ttlSeconds = 60 * 60 * 24): string {
  const payload: SessionUser = {
    ...user,
    exp: Math.floor(Date.now() / 1000) + ttlSeconds,
  };
  const payloadBase64 = Buffer.from(JSON.stringify(payload), 'utf-8').toString('base64url');
  const signature = crypto
    .createHmac('sha256', AUTH_SECRET)
    .update(payloadBase64)
    .digest('base64url');

  return `${payloadBase64}.${signature}`;
}

export function verifySessionToken(token?: string | null): SessionUser | null {
  if (!token || !token.includes('.')) return null;
  try {
    const [payloadBase64, signature] = token.split('.');
    if (!payloadBase64 || !signature) return null;

    const expectedSig = crypto
      .createHmac('sha256', AUTH_SECRET)
      .update(payloadBase64)
      .digest('base64url');

    const sigBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSig);
    if (
      sigBuffer.length !== expectedBuffer.length ||
      !crypto.timingSafeEqual(sigBuffer, expectedBuffer)
    ) {
      return null;
    }

    const decoded = JSON.parse(
      Buffer.from(payloadBase64, 'base64url').toString('utf-8')
    ) as SessionUser;

    if (!decoded.exp || decoded.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return decoded;
  } catch {
    return null;
  }
}
