import { NextResponse } from 'next/server';
import { prisma } from '@/core/database/prisma';

export async function POST(request: Request) {
  const expected = process.env.BACKUP_SCRIPT_TOKEN;
  if (!expected || request.headers.get('authorization') !== `Bearer ${expected}`) return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED' } }, { status: 401 });
  const body = await request.json() as { period?: string; status?: 'success' | 'failed'; totalStudents?: number; spreadsheetName?: string; spreadsheetUrl?: string; errorMessage?: string; attempts?: number };
  if (!body.period || !body.status || !['success', 'failed'].includes(body.status)) return NextResponse.json({ success: false, error: { code: 'VALIDATION_ERROR' } }, { status: 422 });
  const data = await prisma.backupHistory.upsert({ where: { period: body.period }, create: { period: body.period, status: body.status, totalStudents: body.totalStudents, spreadsheetName: body.spreadsheetName, spreadsheetUrl: body.spreadsheetUrl, errorMessage: body.errorMessage, attempts: body.attempts ?? 1, completedAt: new Date() }, update: { status: body.status, totalStudents: body.totalStudents, spreadsheetName: body.spreadsheetName, spreadsheetUrl: body.spreadsheetUrl, errorMessage: body.errorMessage, attempts: body.attempts, completedAt: new Date() } });
  return NextResponse.json({ success: true, data });
}
