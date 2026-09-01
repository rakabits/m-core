import { describe, expect, it } from 'vitest';
import { academicYearCreateSchema, classCreateSchema, subjectCreateSchema } from '@/modules/academic/validation';

describe('academic workflow validation', () => {
  it('accepts a valid academic year and rejects malformed code', () => {
    expect(academicYearCreateSchema.safeParse({code:'2026/2027',label:'Academic 2026',startDate:'2026-07-01',endDate:'2027-06-30'}).success).toBe(true);
    expect(academicYearCreateSchema.safeParse({code:'2026',label:'Academic',startDate:'2026-07-01',endDate:'2027-06-30'}).success).toBe(false);
  });
  it('requires valid UUID context for class assignment targets', () => {
    const valid={programId:'11111111-1111-4111-8111-111111111111',academicYearId:'22222222-2222-4222-8222-222222222222',code:'A',name:'Class A',capacity:30};
    expect(classCreateSchema.safeParse(valid).success).toBe(true);
    expect(classCreateSchema.safeParse({...valid,capacity:0}).success).toBe(false);
  });
  it('enforces subject name boundaries', () => {
    expect(subjectCreateSchema.safeParse({code:'MATH',name:'Mathematics'}).success).toBe(true);
    expect(subjectCreateSchema.safeParse({code:'MATH',name:'x'}).success).toBe(false);
  });
});
