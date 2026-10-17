import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/core/database/prisma';

export async function GET(_request: NextRequest, context: { params: Promise<{ classId: string }> }) {
  try {
    const { classId } = await context.params;
    const data = await prisma.classEnrollment.findMany({ where: { classId, endedAt: null }, include: { student: { select: { id: true, studentNumber: true, fullName: true, gender: true, status: true } }, history: { select: { id: true, academicYear: true, status: true, className: true } } }, orderBy: { student: { fullName: 'asc' } } });
    return NextResponse.json({ success: true, data });
  } catch (error) { console.error('[GET class enrollments]', error); return NextResponse.json({ success: false, error: { message: 'Gagal memuat siswa kelas.' } }, { status: 500 }); }
}

export async function POST(request: NextRequest, context: { params: Promise<{ classId: string }> }) {
  try {
    const { classId } = await context.params;
    const body = await request.json() as { studentId?: string; notes?: string };
    if (!body.studentId) return NextResponse.json({ success: false, error: { message: 'studentId wajib diisi.' } }, { status: 422 });
    const result = await prisma.$transaction(async (tx) => {
      const target = await tx.academicClass.findUnique({ where: { id: classId }, include: { program: true, academicYear: true, _count: { select: { enrollments: true } } } });
      if (!target || !target.isActive) throw new Error('Kelas aktif tidak ditemukan.');
      if (target.capacity !== null && target._count.enrollments >= target.capacity) throw new Error('Kapasitas kelas sudah penuh.');
      const student = await tx.student.findUnique({ where: { id: body.studentId }, select: { id: true } });
      if (!student) throw new Error('Siswa tidak ditemukan.');
      const existing = await tx.classEnrollment.findFirst({ where: { studentId: student.id, endedAt: null, class: { academicYearId: target.academicYearId } }, select: { id: true } });
      if (existing) throw new Error('Siswa sudah terdaftar pada kelas di tahun akademik ini.');
      const history = await tx.studentProgramHistory.create({ data: { studentId: student.id, programId: target.programId, academicYear: target.academicYear.code, level: target.program.academicLevel ?? null, className: target.name, status: 'enrolled', startDate: new Date(), notes: body.notes ?? null } });
      return tx.classEnrollment.create({ data: { historyId: history.id, classId: target.id, studentId: student.id }, include: { student: { select: { id: true, studentNumber: true, fullName: true } } } });
    });
    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (error) { console.error('[POST class enrollment]', error); return NextResponse.json({ success: false, error: { message: error instanceof Error ? error.message : 'Gagal menambahkan siswa ke kelas.' } }, { status: 400 }); }
}