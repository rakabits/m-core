import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });
import { randomUUID } from 'node:crypto';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { passwordHash } from '../src/lib/auth/local';

const connectionString = process.env.DATABASE_URL ?? process.env.DIRECT_URL;
if (!connectionString) throw new Error('DATABASE_URL atau DIRECT_URL belum tersedia.');
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
const DEFAULT_PASSWORD = 'Mumtaza2008';

async function main() {
  const studentRole = await prisma.role.findUnique({ where: { name: 'VIEWER' } });
  const teacherRole = await prisma.role.findUnique({ where: { name: 'TEACHER' } });
  let students = 0;
  let teachers = 0;
  for (const student of await prisma.student.findMany({ include: { userProfile: true } })) {
    const existingByEmail = student.email ? await prisma.userProfile.findUnique({ where: { email: student.email.toLowerCase() } }) : null;
    const reusableProfile = existingByEmail && !existingByEmail.studentId && !existingByEmail.teacher ? existingByEmail : null;
    const profile = student.userProfile ?? reusableProfile ?? await prisma.userProfile.create({ data: { authId: randomUUID(), email: reusableProfile ? student.email?.toLowerCase() ?? null : existingByEmail ? null : student.email?.toLowerCase() ?? null, passwordHash: passwordHash(DEFAULT_PASSWORD), studentId: student.id } });
    if (!student.userProfile && reusableProfile) await prisma.userProfile.update({ where: { id: reusableProfile.id }, data: { studentId: student.id, passwordHash: passwordHash(DEFAULT_PASSWORD) } });
    if (studentRole) await prisma.userRoleAssignment.upsert({ where: { userId_roleId: { userId: profile.id, roleId: studentRole.id } }, update: {}, create: { userId: profile.id, roleId: studentRole.id } });
    students += 1;
  }
  for (const teacher of await prisma.teacher.findMany({ include: { userProfile: true } })) {
    const profile = teacher.userProfile ?? await prisma.userProfile.create({ data: { authId: randomUUID(), passwordHash: passwordHash(DEFAULT_PASSWORD), teacher: { connect: { id: teacher.id } } } });
    if (teacherRole) await prisma.userRoleAssignment.upsert({ where: { userId_roleId: { userId: profile.id, roleId: teacherRole.id } }, update: {}, create: { userId: profile.id, roleId: teacherRole.id } });
    teachers += 1;
  }
  console.log(`Synchronized ${students} students and ${teachers} teachers.`);
}
main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());
