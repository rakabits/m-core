import { describe, expect, it } from 'vitest';
import { historyCreateSchema, historyUpdateSchema } from '@/modules/program-history/validation';
import { programCreateSchema, programUpdateSchema } from '@/modules/programs/validation';

describe('program history validation', () => {
  it('accepts enrollment input and coerces dates', () => {
    const result = historyCreateSchema.safeParse({ programId: '123e4567-e89b-42d3-a456-426614174000', academicYear: '2025/2026', className: 'A', startDate: '2025-08-01' });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.status).toBe('enrolled');
  });
  it('rejects malformed academic year and non-uuid program', () => { expect(historyCreateSchema.safeParse({ programId: 'bad', academicYear: '2025' }).success).toBe(false); });
  it('does not allow program or academic year changes in updates', () => {
    const result = historyUpdateSchema.safeParse({ status: 'completed', programId: '123e4567-e89b-42d3-a456-426614174000', academicYear: '2026/2027' });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data).not.toHaveProperty('programId');
  });
});
describe('program master validation', () => {
  it('accepts valid create contract', () => { expect(programCreateSchema.safeParse({ programCode: ' cs ', programName: ' Computer Science ' }).success).toBe(true); });
  it('allows deactivation without rename fields', () => { expect(programUpdateSchema.safeParse({ isActive: false }).success).toBe(true); });
  it('rejects short program code and name', () => { expect(programCreateSchema.safeParse({ programCode: 'x', programName: 'A' }).success).toBe(false); });
});
