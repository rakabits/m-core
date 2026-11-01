import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { hasPermission } from '@/modules/rbac/authorization';
import { listCanonicalClasses } from '@/modules/academic-classes/service';
import { prisma } from '@/core/database/prisma';

export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED' } }, { status: 401 });
  if (!(await hasPermission(user.id, 'program.view'))) return NextResponse.json({ success: false, error: { code: 'FORBIDDEN' } }, { status: 403 });
  const programId = request.nextUrl.searchParams.get('programId');
  const academicYear = request.nextUrl.searchParams.get('academicYear');
  if (!programId || !academicYear) return NextResponse.json({ success: false, error: { code: 'VALIDATION_ERROR' } }, { status: 422 });
  const year = await prisma.academicYear.findUnique({ where: { code: academicYear }, select: { id: true } });
  if (!year) return NextResponse.json({ success: true, data: [] });
  const data = await listCanonicalClasses(programId, year.id);
  return NextResponse.json({ success: true, data });
}
