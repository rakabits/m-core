import { prisma } from "@/core/database/prisma";

// =============================================================================
// Default grade config per academic level
// =============================================================================
const GRADE_DEFAULTS: Record<
  "JUNIOR_HIGH" | "SENIOR_HIGH",
  { grade: number; gradeLabel: string }[]
> = {
  JUNIOR_HIGH: [
    { grade: 7, gradeLabel: "Kelas 7" },
    { grade: 8, gradeLabel: "Kelas 8" },
    { grade: 9, gradeLabel: "Kelas 9" },
  ],
  SENIOR_HIGH: [
    { grade: 10, gradeLabel: "Kelas 10" },
    { grade: 11, gradeLabel: "Kelas 11" },
    { grade: 12, gradeLabel: "Kelas 12" },
  ],
};

// =============================================================================
// List all ClassDefinitions (with active slots) for a program
// =============================================================================
export async function listClassDefinitions(programId: string) {
  return prisma.classDefinition.findMany({
    where: { programId, isActive: true },
    orderBy: { grade: "asc" },
    include: {
      slots: {
        where: { isActive: true },
        orderBy: { suffix: "asc" },
      },
    },
  });
}

// =============================================================================
// Seed default ClassDefinitions + one slot per grade. Idempotent.
// =============================================================================
export async function seedClassDefinitions(
  programId: string,
  level: "JUNIOR_HIGH" | "SENIOR_HIGH"
) {
  const defaults = GRADE_DEFAULTS[level];
  if (!defaults) return;

  for (const { grade, gradeLabel } of defaults) {
    let def = await prisma.classDefinition.findFirst({
      where: { programId, grade },
    });
    if (!def) {
      def = await prisma.classDefinition.create({
        data: { programId, grade, gradeLabel, defaultSlots: 1 },
      });
    }
    const slotCount = await prisma.classSlot.count({
      where: { classDefId: def.id },
    });
    if (slotCount === 0) {
      await prisma.classSlot.create({
        data: {
          classDefId: def.id,
          suffix: "A",
          displayName: `${gradeLabel} A`,
          isActive: true,
        },
      });
    }
  }
}

// =============================================================================
// Get ClassDefinitions, auto-seeding if none exist yet.
// =============================================================================
export async function getOrSeedClassDefinitions(programId: string) {
  const program = await prisma.program.findUnique({
    where: { id: programId },
    select: { academicLevel: true },
  });
  if (!program?.academicLevel) return [];
  if (program.academicLevel === "PRE_UNIVERSITY") return [];

  const existing = await prisma.classDefinition.count({
    where: { programId, isActive: true },
  });
  if (existing === 0) {
    await seedClassDefinitions(
      programId,
      program.academicLevel as "JUNIOR_HIGH" | "SENIOR_HIGH"
    );
  }
  return listClassDefinitions(programId);
}

// =============================================================================
// Add a new ClassSlot (rombel) to a ClassDefinition
// =============================================================================
export async function addClassSlot(
  classDefId: string,
  suffix: string,
  capacity?: number | null
) {
  const def = await prisma.classDefinition.findUnique({
    where: { id: classDefId },
    select: { gradeLabel: true },
  });
  if (!def) throw new Error("ClassDefinition tidak ditemukan.");

  const trimmedSuffix = suffix.trim().toUpperCase();
  const displayName = trimmedSuffix
    ? `${def.gradeLabel} ${trimmedSuffix}`
    : def.gradeLabel;

  return prisma.classSlot.create({
    data: { classDefId, suffix: trimmedSuffix, displayName, capacity: capacity ?? null, isActive: true },
  });
}

// =============================================================================
// Update a ClassSlot
// =============================================================================
export async function updateClassSlot(
  slotId: string,
  data: { capacity?: number | null; isActive?: boolean }
) {
  return prisma.classSlot.update({ where: { id: slotId }, data });
}

// =============================================================================
// List all active ClassSlots for a program (flat list — for enrollment dropdowns)
// =============================================================================
export async function listProgramClassSlots(programId: string) {
  return prisma.classSlot.findMany({
    where: { isActive: true, classDef: { programId, isActive: true } },
    orderBy: [{ classDef: { grade: "asc" } }, { suffix: "asc" }],
    include: { classDef: { select: { grade: true, gradeLabel: true } } },
  });
}
