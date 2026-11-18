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
  const webAppUrl = process.env.BACKUP_SCRIPT_WEB_APP_URL || 'https://script.google.com/macros/s/AKfycbztheVBXRpuZ7m2qgZjee-rA4Wi73TMKtBF0G_j5Efx9KSrmsxFFkZSnvLK1gIlfTiSpw/exec';
  const token = process.env.BACKUP_SCRIPT_TOKEN;
  if (!token) return NextResponse.json({ success: false, error: { code: 'BACKUP_SCRIPT_TOKEN_MISSING' } }, { status: 500 });
  try {
    const response = await fetch(webAppUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, period }), cache: 'no-store' });
    if (!response.ok) {
      const errorText = await response.text();
      await prisma.backupHistory.update({ where: { id: data.id }, data: { status: 'failed', errorMessage: `Apps Script HTTP ${response.status}: ${errorText.slice(0, 500)}`, completedAt: new Date() } });
      return NextResponse.json({ success: false, error: { code: 'BACKUP_SCRIPT_FAILED' } }, { status: 502 });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Apps Script tidak dapat dihubungi';
    await prisma.backupHistory.update({ where: { id: data.id }, data: { status: 'failed', errorMessage: message, completedAt: new Date() } });
    return NextResponse.json({ success: false, error: { code: 'BACKUP_SCRIPT_UNREACHABLE' } }, { status: 502 });
  }
  return NextResponse.json({ success: true, data, message: 'Backup sedang diproses oleh Google Apps Script.' }, { status: 202 });
}
