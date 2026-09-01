import { describe, expect, it } from 'vitest';
import { isValidGradeScore } from '@/modules/academic/grades';

describe('academic grade business rules', () => {
  it('accepts inclusive score boundaries and decimals', () => {
    expect(isValidGradeScore(0)).toBe(true);
    expect(isValidGradeScore(100)).toBe(true);
    expect(isValidGradeScore(87.5)).toBe(true);
  });
  it('rejects scores outside the 0-100 range and non-finite values', () => {
    expect(isValidGradeScore(-0.01)).toBe(false);
    expect(isValidGradeScore(100.01)).toBe(false);
    expect(isValidGradeScore(Number.NaN)).toBe(false);
    expect(isValidGradeScore(Number.POSITIVE_INFINITY)).toBe(false);
  });
});
