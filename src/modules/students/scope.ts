import { Prisma } from '@prisma/client';
import type { ScopeInput } from '@/modules/rbac/authorization';

export function studentScopeWhere(scope: ScopeInput): Prisma.StudentWhereInput {
  if (scope.type === 'all') return {};
  return { programHistories: { some: { status: 'enrolled', ...(scope.type === 'program' ? { programId: scope.programId } : { className: scope.className }) } } };
}
