import { z } from 'zod';
const academicLevel=z.enum(['JUNIOR_HIGH','SENIOR_HIGH','PRE_UNIVERSITY']);
export const programCreateSchema=z.object({programCode:z.string().trim().min(2).max(50),programName:z.string().trim().min(2).max(150),educationLevel:z.string().trim().max(100).optional().nullable(),academicLevel:academicLevel.optional().nullable()});
export const programUpdateSchema=programCreateSchema.partial().extend({isActive:z.boolean().optional()});
