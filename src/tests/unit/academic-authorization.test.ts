import { describe, expect, it } from 'vitest';
import { scopeAllowsClass } from '@/modules/rbac/authorization';

describe('academic authorization scope matcher', () => {
  const target = { programId: 'program-1', code: 'IX-A' };
  it('allows all scope', () => expect(scopeAllowsClass({ type: 'all' }, target)).toBe(true));
  it('allows matching program and class scopes', () => {
    expect(scopeAllowsClass({ type: 'program', programId: 'program-1' }, target)).toBe(true);
    expect(scopeAllowsClass({ type: 'class', className: 'IX-A' }, target)).toBe(true);
  });
  it('denies cross-program and cross-class scopes', () => {
    expect(scopeAllowsClass({ type: 'program', programId: 'program-2' }, target)).toBe(false);
    expect(scopeAllowsClass({ type: 'class', className: 'IX-B' }, target)).toBe(false);
  });
});
