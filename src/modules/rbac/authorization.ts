import { prisma } from '@/core/database/prisma';

export type ScopeInput = { type: 'all' | 'program' | 'class'; programId?: string; className?: string };
export function scopeAllowsClass(scope:ScopeInput, target:{programId:string;code:string}){return scope.type==='all'||(scope.type==='program'&&scope.programId===target.programId)||(scope.type==='class'&&scope.className===target.code)}

export async function hasPermission(authId: string, permission: string) {
  const user = await prisma.userProfile.findUnique({ where: { authId }, include: { roles: { include: { role: { include: { permissions: { include: { permission: true } } } } } } } });
  return Boolean(user?.isActive && user.roles.some(({ role }) => role.permissions.some(({ permission: item }) => item.code === permission)));
}

export async function getScopes(authId: string): Promise<ScopeInput[]> {
  const user = await prisma.userProfile.findUnique({ where: { authId }, include: { scopes: true } });
  return (user?.scopes ?? []).map((item) => ({ type: item.type, programId: item.programId ?? undefined, className: item.className ?? undefined }));
}

export async function hasScope(authId: string, scope: ScopeInput) {
  const user = await prisma.userProfile.findUnique({ where: { authId }, include: { scopes: true } });
  return Boolean(user?.isActive && user.scopes.some((item) => item.type === 'all' || (item.type === 'program' && item.programId === scope.programId) || (item.type === 'class' && item.className === scope.className)));
}

export async function canAccessAcademicClass(authId:string,classId:string){
  const row=await prisma.academicClass.findUnique({where:{id:classId},select:{programId:true,code:true}});
  if(!row)return false;
  const scopes=await getScopes(authId);
  return scopes.some(scope=>scopeAllowsClass(scope,row));
}

export async function can(authId: string, permission: string, scope?: ScopeInput) {
  if (!(await hasPermission(authId, permission))) return false;
  return scope ? hasScope(authId, scope) : true;
}

