import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/local';
import { prisma } from '@/core/database/prisma';

const periodNow = () => {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit' }).formatToParts(new Date());
  const year = parts.find(part => part.type === 'year')?.value;
  const month = parts.find(part => part.type === 'month')?.value;
  return `${year}-${month}`;
};

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
  const webAppUrl = process.env.BACKUP_SCRIPT_WEB_APP_URL;
  const token = process.env.BACKUP_SCRIPT_TOKEN;
  if (!webAppUrl) return NextResponse.json({ success: false, error: { code: 'BACKUP_SCRIPT_URL_MISSING' } }, { status: 500 });
  if (!token) return NextResponse.json({ success: false, error: { code: 'BACKUP_SCRIPT_TOKEN_MISSING' } }, { status: 500 });
  const data = await prisma.backupHistory.create({ data: { period, status: 'pending', attempts: 1, startedAt: new Date() } });
  try {
    const response = await fetch(webAppUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, period, backupId: data.id }), cache: 'no-store' });
    const responseText = await response.text();
    let scriptResult: { success?: boolean; error?: string } = {};
    try { scriptResult = JSON.parse(responseText) as { success?: boolean; error?: string }; } catch { /* Apps Script may return a non-JSON error page. */ }
    if (!response.ok || scriptResult.success !== true) {
      const detail = scriptResult.error || responseText.slice(0, 500) || `HTTP ${response.status}`;
      await prisma.backupHistory.update({ where: { id: data.id }, data: { status: 'failed', errorMessage: `Apps Script gagal: ${detail}`, completedAt: new Date() } });
      return NextResponse.json({ success: false, error: { code: 'BACKUP_SCRIPT_FAILED', detail } }, { status: 502 });
    }
    let completed = await prisma.backupHistory.findUnique({ where: { id: data.id } });
    for (let attempt = 0; attempt < 10 && (completed?.status === 'pending' || completed?.status === 'running'); attempt += 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      completed = await prisma.backupHistory.findUnique({ where: { id: data.id } });
    }
    if (completed?.status === 'failed') return NextResponse.json({ success: false, error: { code: 'BACKUP_FAILED', detail: completed.errorMessage || 'Backup gagal diproses.' }, data: completed }, { status: 502 });
    return NextResponse.json({ success: true, data: completed || data, message: completed?.status === 'success' ? 'Backup berhasil dibuat.' : 'Backup masih diproses.' }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Apps Script tidak dapat dihubungi';
    await prisma.backupHistory.update({ where: { id: data.id }, data: { status: 'failed', errorMessage: message, completedAt: new Date() } });
    return NextResponse.json({ success: false, error: { code: 'BACKUP_SCRIPT_UNREACHABLE', detail: message } }, { status: 502 });
  }
}
