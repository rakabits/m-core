/* eslint-disable @typescript-eslint/no-explicit-any */
import { Prisma, StudentStatus } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { prisma } from '@/core/database/prisma';
import { passwordHash } from '@/lib/auth/local';
import { StudentCreateInput, StudentUpdateInput } from './validation';
import type { ScopeInput } from '@/modules/rbac/authorization';
import { studentScopeWhere } from './scope';

const DEFAULT_ACCOUNT_PASSWORD = 'Mumtaza2008';

const baseSelect = { id: true, studentNumber: true, mtsStudentId: true, maStudentId: true, photoUrl: true, photoPublicId: true, fullName: true, gender: true, birthPlace: true, birthDate: true, status: true, nik: true, nisn: true, familyCardNumber: true, passportNumber: true, email: true, phone: true, whatsapp: true, telegramUsername: true, addressLine: true, addressRt: true, addressRw: true, village: true, district: true, cityRegency: true, province: true, postalCode: true, heightCm: true, weightKg: true, siblingCount: true, birthOrder: true, createdAt: true, updatedAt: true, parents: true, guardianConfig: { include: { otherParent: true } }, educationHistories: true, programHistories: { where: { status: 'enrolled' }, include: { program: { select: { id: true, programName: true } } }, orderBy: { createdAt: 'desc' }, take: 1 } } as const;
const educationLevelMap:Record<string,'elementary'|'junior_high'|'senior_high'|'university_s1'|'university_s2'|'university_s3'>={educationSd:'elementary',educationSmp:'junior_high',educationSma:'senior_high',educationS1:'university_s1',educationS2:'university_s2',educationS3:'university_s3'};
const displayAcademicYear=(value:string|null|undefined)=>{if(!value)return value;const parts=value.split('/');return parts.length===2&&parts[0]===parts[1]?parts[0]:value};
const educationLabels:Record<string,string>={elementary:'SD',junior_high:'SMP',senior_high:'SMA',university:'Universitas',university_s1:'S1',university_s2:'S2',university_s3:'S3',UNIVERSITY:'Universitas',UNIVERSITY_S1:'S1',UNIVERSITY_S2:'S2',UNIVERSITY_S3:'S3'};
export function presentStudent(student: any, sensitive = false) {
  const activeHistory = student.programHistories?.[0];
  const guardian = student.guardianConfig ? { ...student.guardianConfig, otherParent: student.guardianConfig.otherParent ? parentData(student.guardianConfig.otherParent, student.guardianConfig.otherParent.relationship) : null } : null;
  const data: any = { student_id: student.id, student_number: String(student.studentNumber).padStart(5, '0'), photo_url: student.photoUrl, full_name: student.fullName, gender: student.gender, birth_place: student.birthPlace, status: student.status, active_program: activeHistory ? { program_id: activeHistory.program.id, program_name: activeHistory.program.programName, academic_year: displayAcademicYear(activeHistory.academicYear), class_name: activeHistory.className } : null, created_at: student.createdAt, updated_at: student.updatedAt };
  if (sensitive) Object.assign(data, { birth_date: student.birthDate, nik: student.nik, nisn: student.nisn, mts_student_id: student.mtsStudentId, ma_student_id: student.maStudentId, family_card_number: student.familyCardNumber, passport_number: student.passportNumber, email: student.email, phone: student.phone, whatsapp: student.whatsapp, telegram_username: student.telegramUsername, address: { line: student.addressLine, rt: student.addressRt, rw: student.addressRw, village: student.village, district: student.district, city_regency: student.cityRegency, province: student.province, postal_code: student.postalCode }, physical: { height_cm: student.heightCm, weight_kg: student.weightKg, sibling_count: student.siblingCount, birth_order: student.birthOrder }, education_histories: student.educationHistories?.map((education: any) => ({ ...education, level: educationLabels[education.level] || education.level })), parents: student.parents, guardian });
  return data;
}
export async function listStudents(params: { page: number; perPage: number; search?: string; status?: StudentStatus; gender?: 'male'|'female'; institution?: string; sensitive?: boolean; scope?: ScopeInput | ScopeInput[] }) {
  const scopes = Array.isArray(params.scope) ? params.scope : params.scope ? [params.scope] : [];
  const where: Prisma.StudentWhereInput = scopes.length > 1 ? { OR: scopes.map(studentScopeWhere) } : scopes.length === 1 ? studentScopeWhere(scopes[0]) : {};
  if (params.status) where.status = params.status;
  if (params.gender) where.gender = params.gender;
  const academicLevel = params.institution === 'Junior' ? 'JUNIOR_HIGH' : params.institution === 'Senior' ? 'SENIOR_HIGH' : params.institution === 'Pre-University' ? 'PRE_UNIVERSITY' : undefined;
  if (academicLevel) where.programHistories = { some: { program: { academicLevel: academicLevel as any } } };
  if (params.search) where.OR = [{ fullName: { contains: params.search, mode: Prisma.QueryMode.insensitive } }, ...(params.sensitive ? [{ nik: { contains: params.search } }, { email: { contains: params.search, mode: Prisma.QueryMode.insensitive } }, { phone: { contains: params.search } }] : [])];
  const [rows, total] = await prisma.$transaction([prisma.student.findMany({ where, select: baseSelect, orderBy: { studentNumber: 'asc' }, skip: (params.page - 1) * params.perPage, take: params.perPage }), prisma.student.count({ where })]);
  return { data: rows.map((row) => presentStudent(row, params.sensitive)), meta: { page: params.page, per_page: params.perPage, total, total_pages: Math.ceil(total / params.perPage) } };
}
const parentData = (parent: any, relationship?: string) => ({ fullName: parent.fullName, nik: parent.nik ?? null, phone: parent.phone ?? null, education: parent.education ?? null, educationOther: parent.educationOther ?? null, occupation: parent.occupation ?? null, occupationOther: parent.occupationOther ?? null, monthlyIncome: parent.monthlyIncome ?? null, relationship: relationship ?? parent.relationship ?? null });
async function saveParents(tx: any, studentId: string, input: any) {
  for (const role of ['father', 'mother'] as const) await tx.studentParent.upsert({ where: { studentId_role: { studentId, role } }, create: { studentId, role, ...parentData(input.parents[role]) }, update: parentData(input.parents[role]) });
  const guardian = input.guardian ?? { guardianIsDifferent: false, guardianSource: 'father' };
  let otherParentId: string | null = null;
  if (guardian.guardianIsDifferent && guardian.guardianSource === 'other' && guardian.other) {
    const other = await tx.studentParent.upsert({ where: { studentId_role: { studentId, role: 'other' } }, create: { studentId, role: 'other', ...parentData(guardian.other, guardian.other.relationship) }, update: parentData(guardian.other, guardian.other.relationship) });
    otherParentId = other.id;
  } else await tx.studentParent.deleteMany({ where: { studentId, role: 'other' } });
  await tx.studentGuardian.upsert({ where: { studentId }, create: { studentId, guardianIsDifferent: guardian.guardianIsDifferent, guardianSource: guardian.guardianSource, otherParentId }, update: { guardianIsDifferent: guardian.guardianIsDifferent, guardianSource: guardian.guardianSource, otherParentId } });
}
export async function createStudent(input: StudentCreateInput, actorId?: string) {
  try {
    return await prisma.$transaction(async (tx) => {
      const student = await tx.student.create({ data: { fullName: input.fullName, gender: input.gender, birthPlace: input.birthPlace ?? null, birthDate: input.birthDate ?? null, nik: input.nik ?? null, mtsStudentId: input.mtsStudentId ?? null, maStudentId: input.maStudentId ?? null, nisn: input.nisn ?? null, familyCardNumber: input.familyCardNumber ?? null, passportNumber: input.passportNumber ?? null, email: input.email?.toLowerCase() ?? null, phone: input.phone ?? null, whatsapp: input.whatsapp ?? null, telegramUsername: input.telegramUsername ?? null, addressLine: input.addressLine ?? null, addressRt: input.addressRt ?? null, addressRw: input.addressRw ?? null, village: input.village ?? null, district: input.district ?? null, cityRegency: input.cityRegency ?? null, province: input.province ?? null, postalCode: input.postalCode ?? null, heightCm: input.heightCm ?? null, weightKg: input.weightKg ?? null, siblingCount: input.siblingCount ?? null, birthOrder: input.birthOrder ?? null, status: input.status as StudentStatus }, select: baseSelect });
      await saveParents(tx, student.id, input);
      await tx.userProfile.create({ data: { authId: randomUUID(), email: student.email, passwordHash: passwordHash(DEFAULT_ACCOUNT_PASSWORD), studentId: student.id } });
      const profile = actorId ? await tx.userProfile.findUnique({ where: { authId: actorId }, select: { id: true } }) : null;
      await tx.auditLog.create({ data: { actorId: profile?.id ?? null, action: 'student.create', resource: 'student', resourceId: student.id, changes: { created: { fullName: student.fullName, status: student.status } } } });
      return tx.student.findUniqueOrThrow({ where: { id: student.id }, select: baseSelect });
    });
  } catch (error: any) { if (error?.code === 'P2002') { const target = Array.isArray(error?.meta?.target) ? error.meta.target.join(',') : String(error?.meta?.target ?? ''); const conflict = new Error(target.includes('email') ? 'DUPLICATE_EMAIL' : target.includes('nik') ? 'DUPLICATE_NIK' : 'DUPLICATE_PARENT'); (conflict as any).status = 409; throw conflict; } if (error?.code === 'P2003') { const conflict = new Error('DATABASE_REFERENCE_ERROR'); (conflict as any).status = 422; throw conflict; } throw error; }
}

export async function getStudent(id: string, sensitive = false) {
  const student = await prisma.student.findUnique({ where: { id }, select: { ...baseSelect, programHistories: { where: { status: 'enrolled' }, include: { program: { select: { id: true, programName: true } } }, orderBy: { createdAt: 'desc' }, take: 1 } } });
  if (!student) return null;
  return { ...presentStudent(student, sensitive), parents: student.parents, guardian: student.guardianConfig, active_program: student.programHistories[0] ? { program_id: student.programHistories[0].program.id, program_name: student.programHistories[0].program.programName, academic_year: student.programHistories[0].academicYear, class_name: student.programHistories[0].className } : null };
}

const allowedTransitions: Record<StudentStatus, StudentStatus[]> = { active: ['inactive', 'alumni'], inactive: ['active'], alumni: [] };
export async function updateStudent(id: string, input: StudentUpdateInput, actorId: string) {
  const current = await prisma.student.findUnique({ where: { id }, select: { status: true } });
  if (!current) return null;
  if (input.status && input.status !== current.status && !allowedTransitions[current.status].includes(input.status as StudentStatus)) { const error = new Error('INVALID_STATUS_TRANSITION'); (error as any).status = 422; throw error; }
  try { return await prisma.$transaction(async (tx) => { const { parents: _parents, guardian: _guardian, ...studentInput } = input; const student = await tx.student.update({ where: { id }, data: { ...studentInput, email: input.email === undefined ? undefined : input.email?.toLowerCase() ?? null, status: input.status as StudentStatus | undefined }, select: baseSelect }); if (input.parents) await saveParents(tx, id, input); const profile = await tx.userProfile.findUnique({ where: { authId: actorId }, select: { id: true } }); await tx.auditLog.create({ data: { actorId: profile?.id ?? null, action: 'student.update', resource: 'student', resourceId: id, changes: input } }); return tx.student.findUniqueOrThrow({ where: { id }, select: baseSelect }); }); } catch (error: any) { if (error?.code === 'P2002') { const target = Array.isArray(error?.meta?.target) ? error.meta.target.join(',') : String(error?.meta?.target ?? ''); const conflict = new Error(target.includes('email') ? 'DUPLICATE_EMAIL' : target.includes('nik') ? 'DUPLICATE_NIK' : 'DUPLICATE_PARENT'); (conflict as any).status = 409; throw conflict; } if (error?.code === 'P2003') { const conflict = new Error('DATABASE_REFERENCE_ERROR'); (conflict as any).status = 422; throw conflict; } if (error?.code === 'P2025') { const missing = new Error('NOT_FOUND'); (missing as any).status = 404; throw missing; } throw error; }
}





