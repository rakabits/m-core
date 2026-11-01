/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { hasPermission } from '@/modules/rbac/authorization';
import { prisma } from '@/core/database/prisma';

async function actor() {
  const supabase = await createSupabaseServerClient();
  return (await supabase.auth.getUser()).data.user;
}

export async function GET(request: NextRequest) {
  const user = await actor();
  if (!user) return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED' } }, { status: 401 });
  if (!(await hasPermission(user.id, 'program.view'))) return NextResponse.json({ success: false, error: { code: 'FORBIDDEN' } }, { status: 403 });
  const year = request.nextUrl.searchParams.get('academicYear') || undefined;
  const programs = await prisma.program.findMany({ where: { isActive: true, ...(year ? { academicYear: year } : {}) }, select: { id: true, programName: true, programCode: true, academicYear: true }, orderBy: { programName: 'asc' } });
  return NextResponse.json({ success: true, data: programs });
}

export async function POST(request: NextRequest) {
  const user = await actor();
  if (!user) return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED' } }, { status: 401 });
  if (!(await hasPermission(user.id, 'student.update'))) return NextResponse.json({ success: false, error: { code: 'FORBIDDEN' } }, { status: 403 });
  try {
    const body = await request.json();
    const studentIds: string[] = Array.from(new Set((Array.isArray(body?.studentIds) ? body.studentIds as unknown[] : []).map((id: unknown) => String(id))));
    const programId: string = String(body?.programId || '');
    const academicYear: string = String(body?.academicYear || '');
    const className: string | null = body?.className ? String(body.className) : null;
    const classId: string | null = body?.classId ? String(body.classId) : null;
    const mode = body?.mode === 'commit' ? 'commit' : 'preview';
    if (!studentIds.length || !programId || !/^\d{4}\/\d{4}$/.test(academicYear)) return NextResponse.json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Siswa, program, dan tahun akademik wajib diisi.' } }, { status: 422 });
    if (studentIds.length > 500) return NextResponse.json({ success: false, error: { code: 'LIMIT_EXCEEDED', message: 'Maksimal 500 siswa.' } }, { status: 400 });
    const program = await prisma.program.findFirst({ where: { id: programId, isActive: true }, select: { id: true, programName: true } });
    const academicYearRow = await prisma.academicYear.findUnique({ where: { code: academicYear }, select: { id: true } });
    if (!program || !academicYearRow) return NextResponse.json({ success: false, error: { code: 'PROGRAM_NOT_FOUND' } }, { status: 422 });
    let targetClass: { id: string; name: string; code: string } | null = null;
    if (classId) {
      targetClass = await prisma.academicClass.findFirst({ where: { id: classId, programId, academicYearId: academicYearRow.id, isActive: true }, select: { id: true, name: true, code: true } });
      if (!targetClass) return NextResponse.json({ success: false, error: { code: 'CLASS_NOT_FOUND' } }, { status: 422 });
    }
    const existing = await prisma.studentProgramHistory.findMany({ where: { studentId: { in: studentIds }, status: 'enrolled' }, select: { studentId: true, programId: true } });
    if (mode === 'preview') return NextResponse.json({ success: true, data: { mode, total: studentIds.length, program, academicYear, className, targetClass, existing } });
    const results: Array<{ studentId: string; status: 'created' | 'failed'; error?: string }> = [];
    for (const studentId of studentIds) {
      try {
        await prisma.$transaction(async tx => {
          const current = await tx.studentProgramHistory.findFirst({ where: { studentId, status: 'enrolled' } });
          if (current) await tx.studentProgramHistory.update({ where: { id: current.id }, data: { status: 'transferred', endDate: new Date() } });
          const history = await tx.studentProgramHistory.create({ data: { studentId, programId, academicYear, className: targetClass?.name || className, status: 'enrolled', startDate: new Date() } });
          if (targetClass) await tx.classEnrollment.create({ data: { studentId, historyId: history.id, classId: targetClass.id } });
          await tx.student.update({ where: { id: studentId }, data: { status: 'active' } });
          const profile = await tx.userProfile.findUnique({ where: { authId: user.id }, select: { id: true } });
          await tx.auditLog.create({ data: { actorId: profile?.id ?? null, action: 'student.bulk_program_placement', resource: 'student', resourceId: studentId, changes: { programId, academicYear, className } } });
        });
        results.push({ studentId, status: 'created' });
      } catch (error: any) { results.push({ studentId, status: 'failed', error: error?.message || 'Gagal menempatkan program' }); }
    }
    return NextResponse.json({ success: true, data: { mode, total: studentIds.length, created: results.filter(item => item.status === 'created').length, failed: results.filter(item => item.status === 'failed').length, results } });
  } catch (error: any) { return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: error?.message || 'Gagal menempatkan program massal.' } }, { status: 500 }); }
}
