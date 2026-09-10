import { z } from 'zod';

const date = z.coerce.date();
export const academicYearCreateSchema = z.object({ code: z.string().regex(/^\d{4}\/\d{4}$/), label: z.string().trim().min(2).max(100), startDate: date, endDate: date, isActive: z.boolean().optional() });
export const academicYearUpdateSchema = academicYearCreateSchema.partial();
export const classCreateSchema = z.object({ programId: z.string().uuid(), academicYearId: z.string().uuid(), code: z.string().trim().min(1).max(50), name: z.string().trim().min(1).max(100), capacity: z.number().int().positive().optional().nullable(), isActive: z.boolean().optional() });
export const classUpdateSchema = classCreateSchema.partial().omit({ programId: true, academicYearId: true });
export const subjectCreateSchema = z.object({ code: z.string().trim().min(1).max(50), name: z.string().trim().min(2).max(150), description: z.string().trim().max(500).optional().nullable(), isActive: z.boolean().optional() });
export const subjectUpdateSchema = subjectCreateSchema.partial();
export const teacherCreateSchema = z.object({ userProfileId: z.string().uuid().optional().nullable(), employeeCode: z.string().trim().max(50).optional().nullable(), displayName: z.string().trim().min(2).max(150), isActive: z.boolean().optional(), profile: z.record(z.string(), z.unknown()).optional().nullable(), address: z.record(z.string(), z.unknown()).optional().nullable(), employment: z.array(z.record(z.string(), z.unknown())).optional().nullable(), education: z.array(z.record(z.string(), z.unknown())).optional().nullable(), spouse: z.record(z.string(), z.unknown()).optional().nullable(), family: z.record(z.string(), z.unknown()).optional().nullable(), documents: z.array(z.record(z.string(), z.unknown())).optional().nullable() });
export const teacherUpdateSchema = teacherCreateSchema.partial();
