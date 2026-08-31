import { describe, expect, it } from 'vitest';
import { studentScopeWhere } from '@/modules/students/scope';

describe('studentScopeWhere', () => {
  it('allows all scope without a restriction', () => expect(studentScopeWhere({ type: 'all' })).toEqual({}));
  it('filters program scope through active history', () => expect(studentScopeWhere({ type: 'program', programId: 'p1' })).toEqual({ programHistories: { some: { status: 'enrolled', programId: 'p1' } } }));
  it('filters class scope through active history', () => expect(studentScopeWhere({ type: 'class', className: 'IX-A' })).toEqual({ programHistories: { some: { status: 'enrolled', className: 'IX-A' } } }));
});
