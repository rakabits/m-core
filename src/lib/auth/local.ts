import { cookies } from 'next/headers';
import { createHash, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { prisma } from '@/core/database/prisma';

export const AUTH_COOKIE = 'mcore_session';
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

function hashPassword(password: string, salt = randomBytes(16).toString('hex')) {
  return `${salt}:${scryptSync(password, salt, 64).toString('hex')}`;
}

function verifyPassword(password: string, encoded: string) {
  const [salt, digest] = encoded.split(':');
  if (!salt || !digest) return false;
  const actual = scryptSync(password, salt, 64);
  const expected = Buffer.from(digest, 'hex');
  return expected.length === actual.length && timingSafeEqual(actual, expected);
}

export async function authenticate(identifier: string, password: string) {
  const normalized = identifier.trim().toLowerCase();
  const numeric = /^\d+$/.test(normalized) ? Number(normalized) : undefined;
  const profile = await prisma.userProfile.findFirst({
    where: { isActive: true, OR: [{ email: normalized }, ...(numeric !== undefined ? [{ student: { studentNumber: numeric } }] : []), { student: { nik: identifier.trim() } }, { teacher: { employeeCode: identifier.trim().toUpperCase() } }] },
    select: { id: true, email: true, passwordHash: true },
  });
  if (!profile?.passwordHash || !verifyPassword(password, profile.passwordHash)) return null;
  return profile;
}

export async function createSession(userId: string) {
  const token = randomBytes(32).toString('base64url');
  const digest = createHash('sha256').update(token).digest('hex');
  await prisma.authSession.create({ data: { userId, tokenHash: digest, expiresAt: new Date(Date.now() + SESSION_TTL_SECONDS * 1000) } });
  const store = await cookies();
  store.set(AUTH_COOKIE, token, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: SESSION_TTL_SECONDS });
}

export async function getCurrentUser() {
  const store = await cookies();
  const token = store.get(AUTH_COOKIE)?.value;
  if (!token) return null;
  const digest = createHash('sha256').update(token).digest('hex');
  const session = await prisma.authSession.findUnique({ where: { tokenHash: digest }, include: { user: true } });
  if (!session || session.expiresAt <= new Date() || !session.user.isActive) return null;
  return { id: session.user.authId, profileId: session.user.id, email: session.user.email };
}

export async function destroySession() {
  const store = await cookies();
  const token = store.get(AUTH_COOKIE)?.value;
  if (token) await prisma.authSession.deleteMany({ where: { tokenHash: createHash('sha256').update(token).digest('hex') } });
  store.delete(AUTH_COOKIE);
}

export function passwordHash(password: string) { return hashPassword(password); }
