import { NextResponse } from 'next/server';
import { UserRole } from '@prisma/client';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { prisma } from '@/core/database/prisma';

async function getActor() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const profile = await prisma.userProfile.findUnique({ where: { authId: user.id }, include: { roles: { include: { role: true } } } });
  if (!profile?.isActive || !profile.roles.some(({ role }) => role.name === UserRole.SUPER_ADMIN)) return null;
  return profile;
}

const roleSelect = { id: true, name: true, description: true, users: { select: { userId: true } }, permissions: { select: { permission: { select: { id: true, code: true, description: true } } } } } as const;

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED' } }, { status: 401 });
  const [roles, permissions] = await Promise.all([prisma.role.findMany({ select: roleSelect, orderBy: { name: 'asc' } }), prisma.permission.findMany({ orderBy: { code: 'asc' } })]);
  return NextResponse.json({ success: true, data: roles, permissions, roleNames: Object.values(UserRole) });
}

export async function POST(request: Request) {
  const actor = await getActor();
  if (!actor) return NextResponse.json({ success: false, error: { code: 'FORBIDDEN' } }, { status: 403 });
  try {
    const body = await request.json();
    const name = String(body.name ?? '') as UserRole;
    const description = body.description ? String(body.description).trim() : null;
    const codes = Array.isArray(body.permissionCodes) ? body.permissionCodes.map(String) : [];
    if (!Object.values(UserRole).includes(name)) return NextResponse.json({ success: false, error: { code: 'INVALID_ROLE' } }, { status: 400 });
    const permissions = await prisma.permission.findMany({ where: { code: { in: codes } }, select: { id: true, code: true } });
    if (permissions.length !== codes.length) return NextResponse.json({ success: false, error: { code: 'INVALID_PERMISSION' } }, { status: 400 });
    const role = await prisma.$transaction(async (tx) => {
      const created = await tx.role.create({ data: { name, description, permissions: { create: permissions.map((p) => ({ permissionId: p.id })) } }, select: roleSelect });
      await tx.auditLog.create({ data: { actorId: actor.id, action: 'role.create', resource: 'role', resourceId: created.id, changes: { name, description, permissionCodes: codes } } });
      return created;
    });
    return NextResponse.json({ success: true, data: role }, { status: 201 });
  } catch (error: any) {
    if (error?.code === 'P2002') return NextResponse.json({ success: false, error: { code: 'ROLE_ALREADY_EXISTS' } }, { status: 409 });
    return NextResponse.json({ success: false, error: { code: 'ROLE_CREATE_FAILED' } }, { status: 500 });
  }
}
