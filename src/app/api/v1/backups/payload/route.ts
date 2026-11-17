import { NextResponse } from 'next/server';
import { prisma } from '@/core/database/prisma';

function authorized(request: Request) {
  const expected = process.env.BACKUP_SCRIPT_TOKEN;
  return Boolean(expected && request.headers.get('authorization') === `Bearer ${expected}`);
}

export async function GET(request: Request) {
  if (!authorized(request)) return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED' } }, { status: 401 });
  const students = await prisma.student.findMany({
    orderBy: { studentNumber: 'asc' },
    include: { parents: true, guardianConfig: { include: { otherParent: true } }, educationHistories: true, programHistories: { include: { program: true } } },
  });
  return NextResponse.json({ success: true, generatedAt: new Date().toISOString(), data: students }, { headers: { 'Cache-Control': 'no-store' } });
}
