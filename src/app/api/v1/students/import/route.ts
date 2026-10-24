/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { hasPermission } from '@/modules/rbac/authorization';
import { studentCreateSchema } from '@/modules/students/validation';
import { createStudent } from '@/modules/students/service';

async function actor() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function POST(request: NextRequest) {
  try {
    const user = await actor();
    if (!user) {
      return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED' } }, { status: 401 });
    }

    if (!(await hasPermission(user.id, 'student.create'))) {
      return NextResponse.json({ success: false, error: { code: 'FORBIDDEN' } }, { status: 403 });
    }

    const body = await request.json();
    const students = Array.isArray(body?.students) ? body.students : [];

    if (students.length === 0) {
      return NextResponse.json(
        { success: false, error: { code: 'EMPTY_DATA', message: 'Tidak ada data siswa untuk diimpor' } },
        { status: 400 }
      );
    }

    if (students.length > 500) {
      return NextResponse.json(
        { success: false, error: { code: 'LIMIT_EXCEEDED', message: 'Maksimal 500 siswa dalam satu kali upload' } },
        { status: 400 }
      );
    }

    const results: Array<{
      row: number;
      fullName: string;
      status: 'success' | 'failed';
      error?: string;
      studentId?: string;
      studentNumber?: string;
    }> = [];

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < students.length; i++) {
      const item = students[i];
      const rowNum = Number(item.rowNumber) || (i + 1);
      const name = item.fullName ? String(item.fullName).trim() : `Baris #${rowNum}`;

      const parsed = studentCreateSchema.safeParse(item);
      if (!parsed.success) {
        const issues = parsed.error.issues.map(iss => iss.message).join('; ');
        results.push({
          row: rowNum,
          fullName: name,
          status: 'failed',
          error: issues || 'Format data siswa tidak valid',
        });
        failCount++;
        continue;
      }

      try {
        const created = await createStudent(parsed.data, user.id);
        results.push({
          row: rowNum,
          fullName: created.fullName,
          status: 'success',
          studentId: created.id,
          studentNumber: String(created.studentNumber).padStart(5, '0'),
        });
        successCount++;
      } catch (err: any) {
        let msg = err?.message || 'Gagal menyimpan ke database';
        if (msg === 'DUPLICATE_NIK') {
          msg = 'NIK sudah terdaftar pada siswa lain';
        } else if (msg === 'DUPLICATE_EMAIL') {
          msg = 'Email sudah digunakan oleh akun lain';
        } else if (msg === 'DUPLICATE_PARENT') {
          msg = 'Data orang tua mengalami duplikasi identitas';
        }
        results.push({
          row: rowNum,
          fullName: name,
          status: 'failed',
          error: msg,
        });
        failCount++;
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        total: students.length,
        imported: successCount,
        failed: failCount,
        results,
      },
    });
  } catch (error: any) {
    console.error('[students.import] batch processing error', {
      code: error?.code,
      message: error?.message,
    });
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: error?.message || 'Gagal memproses upload massal' } },
      { status: 500 }
    );
  }
}
