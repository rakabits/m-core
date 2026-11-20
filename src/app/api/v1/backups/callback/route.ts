import { NextResponse } from 'next/server';
import { prisma } from '@/core/database/prisma';

export async function POST(request: Request) {
  const expected = process.env.BACKUP_SCRIPT_TOKEN;
  if (!expected || request.headers.get('authorization') !== `Bearer ${expected}`) return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED' } }, { status: 401 });
  const body = await request.json() as { backupId?: string; period?: string; status?: 'success' | 'failed'; totalStudents?: number; spreadsheetName?: string; spreadsheetUrl?: string; errorMessage?: string; attempts?: number };
  if (!body.period || !body.status || !['success', 'failed'].includes(body.status)) return NextResponse.json({ success: false, error: { code: 'VALIDATION_ERROR' } }, { status: 422 });
  try {
    // Support an older Apps Script deployment while it is being redeployed.
    const backup = body.backupId
      ? await prisma.backupHistory.findUnique({ where: { id: body.backupId } })
      : await prisma.backupHistory.findFirst({ where: { period: body.period, status: { in: ['pending', 'running'] } }, orderBy: { createdAt: 'desc' } });
    if (!backup) return NextResponse.json({ success: false, error: { code: 'BACKUP_HISTORY_NOT_FOUND' } }, { status: 404 });
    const data = await prisma.backupHistory.update({ where: { id: backup.id }, data: { period: body.period, status: body.status, totalStudents: body.totalStudents, spreadsheetName: body.spreadsheetName, spreadsheetUrl: body.spreadsheetUrl, errorMessage: body.errorMessage, attempts: body.attempts, completedAt: new Date() } });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    const detail = error instanceof Error ? error.message : 'Riwayat backup tidak dapat diperbarui.';
    return NextResponse.json({ success: false, error: { code: 'BACKUP_HISTORY_UPDATE_FAILED', detail } }, { status: 500 });
  }
}
