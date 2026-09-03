import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { prisma } from '@/core/database/prisma';

export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED' } }, { status: 401 });
  const search = request.nextUrl.searchParams.get('search')?.trim() ?? '';
  const users = await prisma.userProfile.findMany({
    where: search ? { OR: [{ id: { contains: search, mode: 'insensitive' } }, { email: { contains: search, mode: 'insensitive' } }, { student: { fullName: { contains: search, mode: 'insensitive' } } }] } : undefined,
    select: { id: true, email: true, isActive: true, student: { select: { studentNumber: true, fullName: true } } }, orderBy: { createdAt: 'desc' }, take: 100,
  });
  return NextResponse.json({ success: true, data: users.map((item) => ({ id: item.student?.studentNumber?.toString() ?? '—', userId: item.id, name: item.student?.fullName ?? item.email ?? 'Tanpa nama', email: item.email, isActive: item.isActive })) });
}