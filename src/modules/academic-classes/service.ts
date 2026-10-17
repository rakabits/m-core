import { prisma } from '@/core/database/prisma';
import type { Prisma } from '@prisma/client';

// ---------------------------------------------------------------------------
// syncFromClassSlots
// Dipanggil saat tahun akademik diaktifkan.
// Membuat/memperbarui AcademicClass untuk setiap ClassSlot aktif pada program.
// ---------------------------------------------------------------------------
export async function syncFromClassSlots(
  tx: Prisma.TransactionClient,
  programId: string,
  academicYearId: string,
) {
  const defs = await tx.classDefinition.findMany({
    where: { programId, isActive: true },
    include: { slots: { where: { isActive: true } } },
  });

  for (const def of defs) {
    for (const slot of def.slots) {
      const code = slot.suffix ? `${def.grade}${slot.suffix}` : String(def.grade);
      const name = slot.displayName;
      const existing = await tx.academicClass.findFirst({
        where: { academicYearId, programId, code },
        select: { id: true },
      });
      if (existing) {
        await tx.academicClass.update({
          where: { id: existing.id },
          data: { name, capacity: slot.capacity, isActive: true },
        });
      } else {
        await tx.academicClass.create({
          data: { academicYearId, programId, code, name, capacity: slot.capacity },
        });
      }
    }
  }
}

// ---------------------------------------------------------------------------
// syncAcademicClassCatalog (legacy — kompatibilitas mundur dari JuniorHighClass/SeniorHighClass)
// ---------------------------------------------------------------------------
export async function syncAcademicClassCatalog(programId: string, academicYearId: string) {
  const [program, junior, senior] = await Promise.all([
    prisma.program.findUnique({ where: { id: programId }, select: { academicLevel: true } }),
    prisma.juniorHighClass.findMany({ where: { programId, academicYearId }, select: { code: true, name: true, grade: true, capacity: true, isActive: true } }),
    prisma.seniorHighClass.findMany({ where: { programId, academicYearId }, select: { code: true, name: true, grade: true, capacity: true, isActive: true } }),
  ]);
  if (!program) return [];
  const legacy = program.academicLevel === 'JUNIOR_HIGH' ? junior : program.academicLevel === 'SENIOR_HIGH' ? senior : [];
  for (const item of legacy) {
    const existing = await prisma.academicClass.findFirst({ where: { academicYearId, programId, code: item.code }, select: { id: true } });
    if (existing) {
      await prisma.academicClass.update({ where: { id: existing.id }, data: { name: item.name, capacity: item.capacity, isActive: item.isActive } });
    } else {
      await prisma.academicClass.create({ data: { academicYearId, programId, code: item.code, name: item.name, capacity: item.capacity, isActive: item.isActive } });
    }
  }
  return prisma.academicClass.findMany({ where: { programId, academicYearId, isActive: true }, orderBy: { name: 'asc' } });
}

export async function listCanonicalClasses(programId: string, academicYearId: string) {
  return prisma.academicClass.findMany({ where: { programId, academicYearId, isActive: true }, orderBy: { name: 'asc' } });
}

// ---------------------------------------------------------------------------
// listClassesByYear — semua kelas dalam satu tahun akademik (dengan wali kelas)
// ---------------------------------------------------------------------------
export async function listClassesByYear(academicYearCode: string) {
  const year = await prisma.academicYear.findUnique({ where: { code: academicYearCode }, select: { id: true } });
  if (!year) return [];
  return prisma.academicClass.findMany({
    where: { academicYearId: year.id, isActive: true },
    orderBy: [{ program: { programCode: 'asc' } }, { code: 'asc' }],
    include: {
      program: { select: { id: true, programCode: true, programName: true, academicLevel: true } },
      homeRoomTeacher: { select: { id: true, displayName: true } },
      _count: { select: { enrollments: true } },
    },
  });
}

// ---------------------------------------------------------------------------
// getClassDetail — detail kelas + wali kelas + daftar siswa aktif
// ---------------------------------------------------------------------------
export async function getClassDetail(classId: string) {
  return prisma.academicClass.findUnique({
    where: { id: classId },
    include: {
      program: { select: { id: true, programCode: true, programName: true, academicLevel: true } },
      academicYear: { select: { id: true, code: true } },
      homeRoomTeacher: { select: { id: true, displayName: true, employeeCode: true } },
      enrollments: {
        where: { endedAt: null },
          include: {
            history: { select: { id: true, academicYear: true, status: true } },
            student: {
              select: {
              id: true,
              studentNumber: true,
              fullName: true,
              gender: true,
              status: true,
            },
          },
        },
        orderBy: { student: { fullName: 'asc' } },
      },
    },
  });
}

// ---------------------------------------------------------------------------
// setHomeRoomTeacher — tetapkan wali kelas
// ---------------------------------------------------------------------------
export async function setHomeRoomTeacher(classId: string, teacherId: string | null) {
  return prisma.academicClass.update({
    where: { id: classId },
    data: { homeRoomTeacherId: teacherId },
    select: { id: true, name: true, homeRoomTeacherId: true },
  });
}
