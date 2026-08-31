import { z } from 'zod';

export const studentStatus = z.enum(['active', 'inactive', 'alumni']);
export const gender = z.enum(['male', 'female']);

export const studentCreateSchema = z.object({
  fullName: z.string().trim().min(2).max(150), gender,
  birthPlace: z.string().trim().max(100).optional().nullable(),
  birthDate: z.coerce.date().optional().nullable(), nik: z.string().regex(/^\d{16}$/).optional().nullable(),
  email: z.string().email().max(150).optional().nullable(), phone: z.string().trim().max(20).optional().nullable(),
  whatsapp: z.string().trim().max(20).optional().nullable(), status: studentStatus.default('active'),
});
export const studentUpdateSchema = studentCreateSchema.partial().omit({ status: true }).extend({ status: studentStatus.optional() });
export type StudentCreateInput = z.infer<typeof studentCreateSchema>;
export type StudentUpdateInput = z.infer<typeof studentUpdateSchema>;
