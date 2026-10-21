import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/core/database/prisma';

const PROMOTION_GRADES = ['7', '8', '10', '11'];
const GRADUATION_GRADES = ['9', '12'];

export async function GET(request: NextRequest) {
  const action = request.nextUrl.searchParams.get('action') === 'graduate' ? 'graduate' : 'promote';
  const grades = action === 'graduate' ? GRADUATION_GRADES : PROMOTION_GRADES;
  try {
    const histories = await prisma.studentProgramHistory.findMany({ where: { status: { in: ['enrolled', 'completed'] }, program: { academicLevel: { in: ['JUNIOR_HIGH', 'SENIOR_HIGH'] } }, classEnrollment: { isNot: null } }, include: { student: { select: { id: true, studentNumber: true, fullName: true } }, program: { select: { id: true, programName: true, programCode: true, academicLevel: true } }, classEnrollment: { include: { class: { select: { id: true, name: true, code: true } } } } }, orderBy: { student: { fullName: 'asc' } } });
    const data = histories.filter((item) => { const grade = item.classEnrollment?.class.code.match(/^(\d+)/)?.[1] ?? item.className?.match(/^(\d+)/)?.[1]; return grade ? grades.includes(grade) : false; }).map((item) => ({ historyId: item.id, studentId: item.student.id, studentNumber: item.student.studentNumber, fullName: item.student.fullName, program: item.program.programName, programCode: item.program.programCode, classId: item.classEnrollment?.class.id, previousClass: item.classEnrollment?.class.name ?? item.className, status: item.status, processedAt: item.endDate }));
    return NextResponse.json({ success: true, data });
  } catch (error) { console.error('[GET lifecycle candidates]', error); return NextResponse.json({ success: false, error: { message: 'Gagal memuat daftar siswa.' } }, { status: 500 }); }
}

export async function POST(request: NextRequest) {
  const body = await request.json() as { historyId?: string; action?: 'promote' | 'graduate'; notes?: string };
  if (!body.historyId || !body.action) return NextResponse.json({ success: false, error: { message: 'Data tindakan tidak lengkap.' } }, { status: 422 });
  try { const history = await prisma.studentProgramHistory.findUnique({ where: { id: body.historyId }, include: { classEnrollment: true } }); if (!history || history.status !== 'enrolled') return NextResponse.json({ success: false, error: { message: 'Siswa ini sudah diproses.' } }, { status: 409 }); await prisma.$transaction(async (tx) => { await tx.studentProgramHistory.update({ where: { id: history.id }, data: { status: 'completed', endDate: new Date(), notes: body.notes ?? null } }); if (history.classEnrollment) await tx.classEnrollment.update({ where: { id: history.classEnrollment.id }, data: { endedAt: new Date() } }); }); return NextResponse.json({ success: true }); } catch (error) { return NextResponse.json({ success: false, error: { message: error instanceof Error ? error.message : 'Gagal memproses tindakan.' } }, { status: 400 }); }
}
