/* eslint-disable @typescript-eslint/no-explicit-any */
import { Prisma, StudentStatus } from '@prisma/client';
import { prisma } from '@/core/database/prisma';
import { StudentCreateInput, StudentUpdateInput } from './validation';
import type { ScopeInput } from '@/modules/rbac/authorization';
import { studentScopeWhere } from './scope';

const baseSelect = { id: true, studentNumber: true, fullName: true, gender: true, birthPlace: true, birthDate: true, status: true, email: true, nik: true, phone: true, whatsapp: true, createdAt: true, updatedAt: true } as const;
export function presentStudent(student: any, sensitive = false) {
  const data: any = { student_id: student.id, student_number: String(student.studentNumber).padStart(5, '0'), full_name: student.fullName, gender: student.gender, birth_place: student.birthPlace, status: student.status, created_at: student.createdAt, updated_at: student.updatedAt };
  if (sensitive) Object.assign(data, { birth_date: student.birthDate, nik: student.nik, email: student.email, phone: student.phone, whatsapp: student.whatsapp });
  return data;
}
export async function listStudents(params: { page: number; perPage: number; search?: string; status?: StudentStatus; gender?: 'male'|'female'; sensitive?: boolean; scope?: ScopeInput | ScopeInput[] }) {
  const scopes = Array.isArray(params.scope) ? params.scope : params.scope ? [params.scope] : [];
  const where: Prisma.StudentWhereInput = scopes.length > 1 ? { OR: scopes.map(studentScopeWhere) } : scopes.length === 1 ? studentScopeWhere(scopes[0]) : {};
  if (params.status) where.status = params.status;
  if (params.gender) where.gender = params.gender;
  if (params.search) where.OR = [{ fullName: { contains: params.search, mode: Prisma.QueryMode.insensitive } }, ...(params.sensitive ? [{ nik: { contains: params.search } }, { email: { contains: params.search, mode: Prisma.QueryMode.insensitive } }, { phone: { contains: params.search } }] : [])];
  const [rows, total] = await prisma.$transaction([prisma.student.findMany({ where, select: baseSelect, orderBy: { fullName: 'asc' }, skip: (params.page - 1) * params.perPage, take: params.perPage }), prisma.student.count({ where })]);
  return { data: rows.map((row) => presentStudent(row, params.sensitive)), meta: { page: params.page, per_page: params.perPage, total, total_pages: Math.ceil(total / params.perPage) } };
}
export async function createStudent(input: StudentCreateInput, actorId?: string) {
  try {
    return await prisma.$transaction(async (tx) => {
      const student = await tx.student.create({ data: { fullName: input.fullName, gender: input.gender, birthPlace: input.birthPlace ?? null, birthDate: input.birthDate ?? null, nik: input.nik ?? null, email: input.email?.toLowerCase() ?? null, phone: input.phone ?? null, whatsapp: input.whatsapp ?? null, status: input.status as StudentStatus }, select: baseSelect });
      const profile = actorId ? await tx.userProfile.findUnique({ where: { authId: actorId }, select: { id: true } }) : null;
      await tx.auditLog.create({ data: { actorId: profile?.id ?? null, action: 'student.create', resource: 'student', resourceId: student.id, changes: { created: { fullName: student.fullName, status: student.status } } } });
      return student;
    });
  } catch (error: any) { if (error?.code === 'P2002') { const target = Array.isArray(error?.meta?.target) ? error.meta.target.join(',') : String(error?.meta?.target ?? ''); const conflict = new Error(target.includes('email') ? 'DUPLICATE_EMAIL' : 'DUPLICATE_NIK'); (conflict as any).status = 409; throw conflict; } if (error?.code === 'P2003') { const conflict = new Error('DATABASE_REFERENCE_ERROR'); (conflict as any).status = 422; throw conflict; } throw error; }
}

export async function getStudent(id: string, sensitive = false) {
  const student = await prisma.student.findUnique({ where: { id }, select: { ...baseSelect, programHistories: { where: { status: 'enrolled' }, include: { program: { select: { id: true, programName: true } } }, orderBy: { createdAt: 'desc' }, take: 1 } } });
  if (!student) return null;
  return { ...presentStudent(student, sensitive), active_program: student.programHistories[0] ? { program_id: student.programHistories[0].program.id, program_name: student.programHistories[0].program.programName, academic_year: student.programHistories[0].academicYear, class_name: student.programHistories[0].className } : null };
}

const allowedTransitions: Record<StudentStatus, StudentStatus[]> = { active: ['inactive', 'alumni'], inactive: ['active'], alumni: [] };
export async function updateStudent(id: string, input: StudentUpdateInput, actorId: string) {
  const current = await prisma.student.findUnique({ where: { id }, select: { status: true } });
  if (!current) return null;
  if (input.status && input.status !== current.status && !allowedTransitions[current.status].includes(input.status as StudentStatus)) { const error = new Error('INVALID_STATUS_TRANSITION'); (error as any).status = 422; throw error; }
  try { return await prisma.$transaction(async (tx) => { const student = await tx.student.update({ where: { id }, data: { ...input, email: input.email === undefined ? undefined : input.email?.toLowerCase() ?? null, status: input.status as StudentStatus | undefined }, select: baseSelect }); const profile = await tx.userProfile.findUnique({ where: { authId: actorId }, select: { id: true } }); await tx.auditLog.create({ data: { actorId: profile?.id ?? null, action: 'student.update', resource: 'student', resourceId: id, changes: input } }); return student; }); } catch (error: any) { if (error?.code === 'P2002') { const target = Array.isArray(error?.meta?.target) ? error.meta.target.join(',') : String(error?.meta?.target ?? ''); const conflict = new Error(target.includes('email') ? 'DUPLICATE_EMAIL' : 'DUPLICATE_NIK'); (conflict as any).status = 409; throw conflict; } if (error?.code === 'P2003') { const conflict = new Error('DATABASE_REFERENCE_ERROR'); (conflict as any).status = 422; throw conflict; } if (error?.code === 'P2025') { const missing = new Error('NOT_FOUND'); (missing as any).status = 404; throw missing; } throw error; }
}





