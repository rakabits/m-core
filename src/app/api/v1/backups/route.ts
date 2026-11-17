import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/local';
import { prisma } from '@/core/database/prisma';

async function isBackupAdmin() {
  const user = await getCurrentUser();
  if (!user) return null;
  const profile = await prisma.userProfile.findUnique({ where: { id: user.profileId }, include: { roles: { include: { role: true } } } });
  if (!profile?.isActive || !profile.roles.some(({ role }) => role.name === 'SUPER_ADMIN' || role.name === 'ADMIN')) return null;
  return profile;
}

export async function GET() {
  if (!(await isBackupAdmin())) return NextResponse.json({ success: false, error: { code: 'FORBIDDEN' } }, { status: 403 });
  const data = await prisma.backupHistory.findMany({ orderBy: { createdAt: 'desc' }, take: 120 });
  return NextResponse.json({ success: true, data });
}
