import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { hasPermission } from '@/modules/rbac/authorization';
import { prisma } from '@/core/database/prisma';

export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED' } }, { status: 401 });
  if (!(await hasPermission(user.id, 'student.create'))) return NextResponse.json({ success: false, error: { code: 'FORBIDDEN' } }, { status: 403 });
  const nik = request.nextUrl.searchParams.get('nik')?.trim() ?? '';
  if (!/^\d{16}$/.test(nik)) return NextResponse.json({ success: true, data: { duplicate: false } });
  const student = await prisma.student.findFirst({ where: { nik }, select: { id: true } });
  return NextResponse.json({ success: true, data: { duplicate: Boolean(student) } });
}