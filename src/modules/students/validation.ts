/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from 'zod';

export const studentStatus = z.enum(['active', 'inactive', 'alumni']);
export const gender = z.enum(['male', 'female']);
export const guardianSource = z.enum(['father', 'mother', 'other']);
const optionalText = (max = 150) => z.string().trim().max(max).optional().nullable();
const parentSchema = z.object({
  fullName: z.string().trim().min(2).max(150), nik: z.string().regex(/^\d{16}$/).optional().nullable(),
  phone: optionalText(20), education: optionalText(100), educationOther: optionalText(100),
  occupation: optionalText(100), occupationOther: optionalText(100), monthlyIncome: z.number().int().nonnegative().optional().nullable(),
});
const otherGuardianSchema = parentSchema.extend({ relationship: z.string().trim().min(2).max(100) });
const guardianSchema = z.object({ guardianIsDifferent: z.boolean().default(false), guardianSource: guardianSource.default('father'), other: otherGuardianSchema.optional() }).superRefine((value, ctx) => {
  if (value.guardianIsDifferent && value.guardianSource === 'other' && !value.other) ctx.addIssue({ code: 'custom', path: ['other'], message: 'Data wali berbeda wajib diisi' });
});
function digits(value?: string | null) { return value?.replace(/\D/g, '') || ''; }
const parentFields = z.object({ father: parentSchema, mother: parentSchema });
function parentPhoneRefinement(data: any, ctx: z.RefinementCtx) {
  const studentPhones = new Set([digits(data.phone), digits(data.whatsapp)].filter(Boolean));
  for (const [role, parent] of Object.entries(data.parents || {})) if ((parent as any).phone && studentPhones.has(digits((parent as any).phone))) ctx.addIssue({ code: 'custom', path: ['parents', role, 'phone'], message: 'Nomor HP orang tua tidak boleh sama dengan nomor HP siswa' });
  if (data.guardian?.guardianIsDifferent && data.guardian.guardianSource === 'other' && data.guardian.other?.phone && studentPhones.has(digits(data.guardian.other.phone))) ctx.addIssue({ code: 'custom', path: ['guardian', 'other', 'phone'], message: 'Nomor HP wali tidak boleh sama dengan nomor HP siswa' });
}
const studentFields = z.object({
  fullName: z.string().trim().min(2).max(150), gender, birthPlace: optionalText(100), birthDate: z.coerce.date().optional().nullable(), nik: z.string().regex(/^\d{16}$/).optional().nullable(),
  mtsStudentId: optionalText(50), maStudentId: optionalText(50), nisn: optionalText(20), familyCardNumber: optionalText(20), passportNumber: optionalText(30),
  email: z.string().email().max(150).optional().nullable(), phone: optionalText(20), whatsapp: optionalText(20), telegramUsername: optionalText(100),
  addressLine: optionalText(255), addressRt: optionalText(5), addressRw: optionalText(5), village: optionalText(100), district: optionalText(100), cityRegency: optionalText(100), province: optionalText(100), postalCode: optionalText(10),
  heightCm: z.coerce.number().positive().max(300).optional().nullable(), weightKg: z.coerce.number().positive().max(500).optional().nullable(), siblingCount: z.coerce.number().int().nonnegative().optional().nullable(), birthOrder: z.coerce.number().int().positive().optional().nullable(),
  status: studentStatus.default('active'), parents: parentFields, guardian: guardianSchema.default({ guardianIsDifferent: false, guardianSource: 'father' }),
});
export const studentCreateSchema = studentFields.superRefine(parentPhoneRefinement);
export const studentUpdateSchema = studentFields.partial().omit({ status: true }).extend({ status: studentStatus.optional() }).superRefine(parentPhoneRefinement);
export type StudentCreateInput = z.infer<typeof studentCreateSchema>;
export type StudentUpdateInput = z.infer<typeof studentUpdateSchema>;
