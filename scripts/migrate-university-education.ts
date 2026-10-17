import { prisma } from '@/core/database/prisma';

const levels = { educationS1: 'university_s1', educationS2: 'university_s2', educationS3: 'university_s3' } as const;
const text = (value: unknown) => typeof value === 'string' && value.trim() ? value.trim() : null;
const number = (value: unknown) => { const parsed = Number(value); return Number.isFinite(parsed) ? parsed : null; };
const applicants = await prisma.applicant.findMany({ where: { studentId: { not: null } }, select: { studentId: true, educationHistory: true } });
let migrated = 0;
for (const applicant of applicants) {
  if (!applicant.studentId || !applicant.educationHistory || typeof applicant.educationHistory !== 'object' || Array.isArray(applicant.educationHistory)) continue;
  const values = applicant.educationHistory as Record<string, unknown>;
  for (const [key, level] of Object.entries(levels)) {
    const institutionName = text(values[`${key}.institutionName`]);
    if (!institutionName) continue;
    await prisma.studentEducationHistory.upsert({ where: { studentId_level: { studentId: applicant.studentId, level } }, create: { studentId: applicant.studentId, level, institutionName, cityRegency: text(values[`${key}.cityRegency`]), province: text(values[`${key}.province`]), graduationYear: number(values[`${key}.graduationYear`]), degreeLevel: text(values[`${key}.degreeLevel`]) }, update: { institutionName, cityRegency: text(values[`${key}.cityRegency`]), province: text(values[`${key}.province`]), graduationYear: number(values[`${key}.graduationYear`]), degreeLevel: text(values[`${key}.degreeLevel`]) } });
    migrated += 1;
  }
}
console.log(`Migrated ${migrated} university education records.`);
await prisma.$disconnect();
