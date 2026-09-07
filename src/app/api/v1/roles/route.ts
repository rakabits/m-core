import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { prisma } from '@/core/database/prisma';

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED' } }, { status: 401 });
  const roles = await prisma.role.findMany({
    select: { id: true, name: true, description: true, permissions: { select: { permission: { select: { code: true } } } } },
    orderBy: { name: 'asc' },
  });
  return NextResponse.json({ success: true, data: roles });
}
