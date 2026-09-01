import { z } from 'zod';
export const programCreateSchema=z.object({programCode:z.string().trim().min(2).max(50),programName:z.string().trim().min(2).max(150),educationLevel:z.string().trim().max(100).optional().nullable()});
export const programUpdateSchema=programCreateSchema.partial().extend({isActive:z.boolean().optional()});
