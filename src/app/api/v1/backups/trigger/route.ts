import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/local';
import { prisma } from '@/core/database/prisma';

const periodNow = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit' }).format(new Date());

async function admin() {
  const user = await getCurrentUser();
  if (!user) return null;
  const profile = await prisma.userProfile.findUnique({ where: { id: user.profileId }, include: { roles: { include: { role: true } } } });
  return profile?.isActive && profile.roles.some(({ role }) => role.name === 'SUPER_ADMIN' || role.name === 'ADMIN') ? profile : null;
}

export async function POST() {
  const user = await admin();
  if (!user) return NextResponse.json({ success: false, error: { code: 'FORBIDDEN' } }, { status: 403 });
  const period = periodNow();
  const existing = await prisma.backupHistory.findUnique({ where: { period } });
  if (existing?.status === 'success') return NextResponse.json({ success: true, data: existing, reused: true });
  const data = await prisma.backupHistory.upsert({ where: { period }, create: { period, status: 'pending', attempts: 0 }, update: { status: 'pending', errorMessage: null } });
  return NextResponse.json({ success: true, data, payloadUrl: '/api/v1/backups/payload' }, { status: 202 });
}
