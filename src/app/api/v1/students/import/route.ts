/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { hasPermission } from '@/modules/rbac/authorization';
import { studentCreateSchema } from '@/modules/students/validation';
import { createStudent, updateStudent } from '@/modules/students/service';
import { prisma } from '@/core/database/prisma';

async function actor() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

const fields = ['fullName', 'gender', 'birthPlace', 'birthDate', 'nik', 'mtsStudentId', 'maStudentId', 'nisn', 'familyCardNumber', 'passportNumber', 'email', 'phone', 'whatsapp', 'telegramUsername', 'addressLine', 'addressRt', 'addressRw', 'village', 'district', 'cityRegency', 'province', 'postalCode', 'heightCm', 'weightKg', 'siblingCount', 'birthOrder', 'status'] as const;
const labels: Record<string, string> = { fullName: 'Nama lengkap', gender: 'Jenis kelamin', birthPlace: 'Tempat lahir', birthDate: 'Tanggal lahir', nik: 'NIK', email: 'Email', phone: 'No HP', whatsapp: 'WhatsApp', addressLine: 'Alamat', status: 'Status' };

function value(value: unknown) {
  if (value === undefined || value === null || value === '') return null;
  return value instanceof Date ? value.toISOString().slice(0, 10) : String(value);
}

async function findExisting(item: any) {
  const where: any[] = [];
  if (item.studentId) where.push({ id: String(item.studentId) });
  if (item.studentNumber) where.push({ studentNumber: Number(item.studentNumber) });
  if (item.nik) where.push({ nik: String(item.nik) });
  if (item.email) where.push({ email: String(item.email).toLowerCase() });
  if (item.mtsStudentId) where.push({ mtsStudentId: String(item.mtsStudentId) });
  if (item.maStudentId) where.push({ maStudentId: String(item.maStudentId) });
  if (!where.length) return null;
  return prisma.student.findFirst({ where: { OR: where }, select: { id: true, studentNumber: true, fullName: true, ...Object.fromEntries(fields.map(field => [field, true])) } });
}

function changesFor(item: any, existing: any) {
  return fields.flatMap(field => {
    const uploaded = value(item[field]);
    if (uploaded === null) return [];
    const current = value(existing?.[field]);
    return uploaded !== current ? [{ field, label: labels[field] || field, before: current, after: uploaded }] : [];
  });
}

export async function POST(request: NextRequest) {
  try {
    const user = await actor();
    if (!user) return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED' } }, { status: 401 });
    if (!(await hasPermission(user.id, 'student.create')) || !(await hasPermission(user.id, 'student.update'))) {
      return NextResponse.json({ success: false, error: { code: 'FORBIDDEN' } }, { status: 403 });
    }

    const body = await request.json();
    const students = Array.isArray(body?.students) ? body.students : [];
    const mode = body?.mode === 'commit' ? 'commit' : 'preview';
    if (!students.length) return NextResponse.json({ success: false, error: { code: 'EMPTY_DATA', message: 'Tidak ada data siswa untuk diimpor' } }, { status: 400 });
    if (students.length > 500) return NextResponse.json({ success: false, error: { code: 'LIMIT_EXCEEDED', message: 'Maksimal 500 siswa' } }, { status: 400 });

    const results: any[] = [];
    let created = 0;
    let updated = 0;
    let failed = 0;

    for (let index = 0; index < students.length; index++) {
      const item = students[index];
      const row = Number(item.rowNumber) || index + 1;
      const existing = await findExisting(item);
      const changes = changesFor(item, existing);
      const parsed = studentCreateSchema.safeParse(item);
      if (!existing && !parsed.success) {
        results.push({ row, fullName: item.fullName || `Baris #${row}`, status: 'failed', error: parsed.error.issues.map(issue => issue.message).join('; ') });
        failed++;
        continue;
      }
      if (!changes.length && existing) {
        results.push({ row, fullName: item.fullName || `Siswa #${existing.studentNumber}`, status: 'unchanged', studentId: existing.id, changes: [] });
        continue;
      }
      if (mode === 'preview') {
        results.push({ row, fullName: item.fullName || existing?.fullName || `Baris #${row}`, status: existing ? 'update' : 'create', studentId: existing?.id, changes });
        continue;
      }

      try {
        if (existing) {
          const updateData: any = {};
          for (const field of fields) if (value(item[field]) !== null) updateData[field] = item[field] instanceof Date ? item[field] : item[field];
          const result = await updateStudent(existing.id, updateData, user.id);
          results.push({ row, fullName: result?.fullName || item.fullName, status: 'updated', studentId: existing.id, changes });
          updated++;
        } else {
          if (!parsed.success) {
            results.push({ row, fullName: item.fullName || `Baris #${row}`, status: 'failed', error: parsed.error.issues.map(issue => issue.message).join('; '), changes });
            failed++;
            continue;
          }
          const result = await createStudent(parsed.data, user.id);
          results.push({ row, fullName: result.fullName, status: 'created', studentId: result.id, studentNumber: String(result.studentNumber).padStart(5, '0'), changes });
          created++;
        }
      } catch (error: any) {
        results.push({ row, fullName: item.fullName || `Baris #${row}`, status: 'failed', error: error?.message || 'Gagal menyimpan data', changes });
        failed++;
      }
    }

    return NextResponse.json({ success: true, data: { mode, total: students.length, created, updated, imported: created + updated, failed, hasChanges: results.some(item => item.status === 'update' || item.status === 'create'), results } });
  } catch (error: any) {
    console.error('[students.import]', error);
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: error?.message || 'Gagal memproses upload massal' } }, { status: 500 });
  }
}
