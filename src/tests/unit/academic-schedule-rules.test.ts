import { describe, expect, it } from 'vitest';
import { intervalsOverlap, isValidScheduleInput, scheduleMinutes } from '@/modules/academic/schedules';

describe('academic schedule business rules', () => {
  it('converts clock values to minutes', () => {
    expect(scheduleMinutes('08:30')).toBe(510);
    expect(scheduleMinutes('17:05')).toBe(1025);
  });
  it('accepts valid weekday intervals and rejects invalid boundaries', () => {
    expect(isValidScheduleInput({ day: 1, startTime: '08:00', endTime: '09:00' })).toBe(true);
    expect(isValidScheduleInput({ day: 0, startTime: '08:00', endTime: '09:00' })).toBe(false);
    expect(isValidScheduleInput({ day: 7, startTime: '09:00', endTime: '09:00' })).toBe(false);
    expect(isValidScheduleInput({ day: 8, startTime: '09:00', endTime: '10:00' })).toBe(false);
  });
  it('detects overlap but allows adjacent sessions', () => {
    expect(intervalsOverlap(480, 540, 530, 600)).toBe(true);
    expect(intervalsOverlap(480, 540, 540, 600)).toBe(false);
    expect(intervalsOverlap(480, 540, 400, 480)).toBe(false);
  });
});
