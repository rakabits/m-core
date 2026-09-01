import { describe, expect, it } from 'vitest';
import { isValidAttendanceStatus, rosterContainsStudent } from '@/modules/academic/attendance';

describe('academic attendance business rules', () => {
  it('accepts supported statuses and rejects unknown values', () => {
    expect(isValidAttendanceStatus('PRESENT')).toBe(true);
    expect(isValidAttendanceStatus('ABSENT')).toBe(true);
    expect(isValidAttendanceStatus('UNKNOWN')).toBe(false);
  });
  it('only accepts actively enrolled roster members', () => {
    const active = new Set(['student-1', 'student-2']);
    expect(rosterContainsStudent('student-1', active)).toBe(true);
    expect(rosterContainsStudent('student-ended', active)).toBe(false);
  });
});
