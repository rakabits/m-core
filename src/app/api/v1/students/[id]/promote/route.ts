import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/core/database/prisma';
const actions = ['promote', 'transfer', 'drop', 'correct-class'] as const;
type Action = typeof actions[number];
export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: studentId } = await context.params;
    const body = await request.json() as { fromHistoryId?: string; action?: Action; toClassId?: string; endDate?: string; notes?: string };
    if (!body.fromHistoryId || !body.action || !actions.includes(body.action)) return NextResponse.json({ success: false, error: { message: 'fromHistoryId dan action wajib diisi.' } }, { status: 422 });
    if (['promote', 'correct-class'].includes(body.action) && !body.toClassId) return NextResponse.json({ success: false, error: { message: 'Kelas tujuan wajib diisi.' } }, { status: 422 });
    const result = await prisma.$transaction(async (tx) => {
      const current = await tx.studentProgramHistory.findFirst({ where: { id: body.fromHistoryId, studentId, status: 'enrolled' }, include: { classEnrollment: true } });
      if (!current) throw new Error('Riwayat enrollment aktif tidak ditemukan.');
      if (body.action === 'correct-class') {
        if (!current.classEnrollment) throw new Error('Enrollment kelas aktif tidak ditemukan.');
        const target = await tx.academicClass.findUnique({ where: { id: body.toClassId }, select: { id: true, isActive: true, academicYearId: true } });
        if (!target || !target.isActive) throw new Error('Kelas tujuan tidak ditemukan.');
        const duplicate = await tx.classEnrollment.findFirst({ where: { studentId, endedAt: null, class: { academicYearId: target.academicYearId }, id: { not: current.classEnrollment.id } }, select: { id: true } });
        if (duplicate) throw new Error('Siswa sudah memiliki kelas aktif pada tahun akademik tersebut.');
        return tx.classEnrollment.update({ where: { id: current.classEnrollment.id }, data: { classId: target.id }, select: { id: true, classId: true, historyId: true } });
      }
      const endDate = body.endDate ? new Date(body.endDate) : new Date();
      await tx.studentProgramHistory.update({ where: { id: current.id }, data: { status: body.action === 'promote' ? 'completed' : body.action === 'transfer' ? 'transferred' : 'dropped', endDate, notes: body.notes ?? null } });
      if (current.classEnrollment) await tx.classEnrollment.update({ where: { id: current.classEnrollment.id }, data: { endedAt: endDate } });
      if (body.action !== 'promote') return { action: body.action, historyId: current.id };
      const target = await tx.academicClass.findUnique({ where: { id: body.toClassId }, include: { program: true, academicYear: true, _count: { select: { enrollments: true } } } });
      if (!target || !target.isActive) throw new Error('Kelas tujuan tidak ditemukan.');
      if (target.capacity !== null && target._count.enrollments >= target.capacity) throw new Error('Kapasitas kelas tujuan sudah penuh.');
      const duplicate = await tx.classEnrollment.findFirst({ where: { studentId, endedAt: null, class: { academicYearId: target.academicYearId } }, select: { id: true } });
      if (duplicate) throw new Error('Siswa sudah memiliki kelas aktif pada tahun akademik tujuan.');
      const nextHistory = await tx.studentProgramHistory.create({ data: { studentId, programId: target.programId, academicYear: target.academicYear.code, level: target.program.academicLevel ?? null, className: target.name, status: 'enrolled', startDate: endDate, notes: body.notes ?? null } });
      const enrollment = await tx.classEnrollment.create({ data: { historyId: nextHistory.id, classId: target.id, studentId } });
      return { action: body.action, historyId: nextHistory.id, enrollmentId: enrollment.id };
    });
    return NextResponse.json({ success: true, data: result });
  } catch (error) { console.error('[POST student lifecycle action]', error); return NextResponse.json({ success: false, error: { message: error instanceof Error ? error.message : 'Gagal memproses tindakan siswa.' } }, { status: 400 }); }
}