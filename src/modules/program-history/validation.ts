import { z } from 'zod';
export const academicYear=z.string().regex(/^\d{4}\/\d{4}$/);
export const historyCreateSchema=z.object({programId:z.string().uuid(),academicYear,level:z.string().trim().max(50).optional().nullable(),className:z.string().trim().max(50).optional().nullable(),status:z.enum(['enrolled','completed','transferred','dropped','cancelled']).default('enrolled'),startDate:z.coerce.date().optional().nullable(),endDate:z.coerce.date().optional().nullable(),notes:z.string().max(5000).optional().nullable()});
export const historyUpdateSchema=historyCreateSchema.partial().omit({programId:true,academicYear:true});
