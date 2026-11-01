/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { hasPermission } from '@/modules/rbac/authorization';
import { studentStatus } from '@/modules/students/validation';
import { updateStudent } from '@/modules/students/service';

async function actor() {
  const supabase = await createSupabaseServerClient();
  return (await supabase.auth.getUser()).data.user;
}

export async function POST(request: NextRequest) {
  const user = await actor();
  if (!user) return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED' } }, { status: 401 });
  if (!(await hasPermission(user.id, 'student.update'))) {
    return NextResponse.json({ success: false, error: { code: 'FORBIDDEN' } }, { status: 403 });
  }

  try {
    const body = await request.json();
    const ids: string[] = Array.isArray(body?.studentIds) ? Array.from(new Set((body.studentIds as unknown[]).map((id: unknown) => String(id)))) : [];
    const parsedStatus = studentStatus.safeParse(body?.status);
    const mode = body?.mode === 'commit' ? 'commit' : 'preview';
    if (!ids.length || !parsedStatus.success) {
      return NextResponse.json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Pilih siswa dan status yang valid.' } }, { status: 422 });
    }
    if (ids.length > 500) return NextResponse.json({ success: false, error: { code: 'LIMIT_EXCEEDED', message: 'Maksimal 500 siswa.' } }, { status: 400 });
    if (mode === 'preview') return NextResponse.json({ success: true, data: { mode, total: ids.length, status: parsedStatus.data, studentIds: ids } });

    const results: Array<{ studentId: string; status: 'updated' | 'failed'; error?: string }> = [];
    for (const id of ids) {
      try {
        await updateStudent(id, { status: parsedStatus.data }, user.id);
        results.push({ studentId: id, status: 'updated' });
      } catch (error: any) {
        results.push({ studentId: id, status: 'failed', error: error?.message || 'Gagal memperbarui siswa' });
      }
    }
    const updated = results.filter(item => item.status === 'updated').length;
    const failed = results.filter(item => item.status === 'failed').length;
    if (failed > 0) {
      const firstFailure = results.find(item => item.status === 'failed');
      return NextResponse.json({ success: false, data: { mode, total: ids.length, updated, failed, results }, error: { code: 'PARTIAL_UPDATE', message: `${failed} siswa gagal diubah${firstFailure?.error ? `: ${firstFailure.error}` : '.'}` } }, { status: 422 });
    }
    return NextResponse.json({ success: true, data: { mode, total: ids.length, updated, failed, results } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: error?.message || 'Gagal mengubah siswa secara massal.' } }, { status: 500 });
  }
}
