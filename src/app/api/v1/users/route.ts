import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/local';
import { prisma } from '@/core/database/prisma';

export async function GET(request: NextRequest) {
  const localUser = await getCurrentUser();
  if (!localUser) {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED' } }, { status: 401 });
  }

  const search = request.nextUrl.searchParams.get('search')?.trim() ?? '';
  const users = await prisma.userProfile.findMany({
    where: search ? { OR: [{ id: { contains: search, mode: 'insensitive' } }, { email: { contains: search, mode: 'insensitive' } }, { student: { fullName: { contains: search, mode: 'insensitive' } } }, { teacher: { displayName: { contains: search, mode: 'insensitive' } } }, { teacher: { employeeCode: { contains: search, mode: 'insensitive' } } }] } : undefined,
    select: { id: true, email: true, isActive: true, student: { select: { studentNumber: true, fullName: true } }, teacher: { select: { id: true, employeeCode: true, displayName: true } }, roles: { select: { role: { select: { name: true } } } } },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  return NextResponse.json({ success: true, data: users.map((item) => ({ id: item.student ? item.student.studentNumber?.toString() : item.teacher?.employeeCode ?? '—', userId: item.id, teacherId: item.teacher?.id ?? null, name: item.student?.fullName ?? item.teacher?.displayName ?? item.email ?? 'Tanpa nama', email: item.email, type: item.student ? 'STUDENT' : item.teacher ? 'TEACHER' : 'USER', roles: item.roles.map(({ role }) => role.name), isActive: item.isActive })) });
}