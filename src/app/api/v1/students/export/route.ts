/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getScopes, hasPermission } from '@/modules/rbac/authorization';
import { listStudents } from '@/modules/students/service';

const text = (value: unknown) => value === null || value === undefined ? '' : String(value);
const date = (value: unknown) => value ? new Date(String(value)).toISOString().slice(0, 10) : '';

export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED' } }, { status: 401 });
  if (!(await hasPermission(user.id, 'student.view'))) return NextResponse.json({ success: false, error: { code: 'FORBIDDEN' } }, { status: 403 });

  const q = request.nextUrl.searchParams;
  const sensitive = await hasPermission(user.id, 'student.view_sensitive');
  const scope = await getScopes(user.id);
  const filters = {
    search: q.get('search') || undefined,
    status: q.get('status') as 'active' | 'inactive' | 'alumni' | undefined,
    gender: q.get('gender') as 'male' | 'female' | undefined,
    institution: q.get('institution') || undefined,
    sensitive,
    scope,
  };
  const first = await listStudents({ page: 1, perPage: 100, ...filters });
  const rows = [...first.data];
  for (let page = 2; page <= first.meta.total_pages; page++) rows.push(...(await listStudents({ page, perPage: 100, ...filters })).data);

  const exportRows = rows.map((student: any, index) => {
    const parents = student.parents || [];
    const father = parents.find((parent: any) => parent.role === 'father') || {};
    const mother = parents.find((parent: any) => parent.role === 'mother') || {};
    const guardian = student.guardian || {};
    const otherGuardian = guardian.otherParent || {};
    const education = student.education_histories?.[0] || {};
    return {
      'No': index + 1,
      'Student ID': student.student_number || student.student_id,
      'Nama Lengkap': text(student.full_name),
      'Jenis Kelamin': student.gender === 'male' ? 'Laki-laki' : 'Perempuan',
      'Tempat Lahir': text(student.birth_place),
      'Tanggal Lahir': date(student.birth_date),
      'NIK': text(student.nik),
      'ID Siswa MTs': text(student.mts_student_id),
      'ID Siswa MA': text(student.ma_student_id),
      'NISN': text(student.nisn),
      'Nomor KK': text(student.family_card_number),
      'Nomor Paspor': text(student.passport_number),
      'Email': text(student.email),
      'No HP Siswa': text(student.phone),
      'WhatsApp Siswa': text(student.whatsapp),
      'Username Telegram': text(student.telegram_username),
      'Alamat': text(student.address?.line),
      'RT': text(student.address?.rt),
      'RW': text(student.address?.rw),
      'Kelurahan / Desa': text(student.address?.village),
      'Kecamatan': text(student.address?.district),
      'Kota / Kabupaten': text(student.address?.city_regency),
      'Provinsi': text(student.address?.province),
      'Kode Pos': text(student.address?.postal_code),
      'Tinggi Badan (cm)': text(student.physical?.height_cm),
      'Berat Badan (kg)': text(student.physical?.weight_kg),
      'Jumlah Saudara': text(student.physical?.sibling_count),
      'Anak Ke-': text(student.physical?.birth_order),
      'Nama Ayah': text(father.fullName),
      'NIK Ayah': text(father.nik),
      'No HP Ayah': text(father.phone),
      'Pendidikan Ayah': text(father.education),
      'Pekerjaan Ayah': text(father.occupation),
      'Penghasilan Ayah / Bulan': text(father.monthlyIncome),
      'Nama Ibu': text(mother.fullName),
      'NIK Ibu': text(mother.nik),
      'No HP Ibu': text(mother.phone),
      'Pendidikan Ibu': text(mother.education),
      'Pekerjaan Ibu': text(mother.occupation),
      'Penghasilan Ibu / Bulan': text(mother.monthlyIncome),
      'Wali Berbeda': guardian.guardianIsDifferent ? 'Ya' : 'Tidak',
      'Sumber Wali': text(guardian.guardianSource),
      'Nama Wali': text(otherGuardian.fullName),
      'Hubungan Wali': text(otherGuardian.relationship),
      'NIK Wali': text(otherGuardian.nik),
      'No HP Wali': text(otherGuardian.phone),
      'Pendidikan Wali': text(otherGuardian.education),
      'Pekerjaan Wali': text(otherGuardian.occupation),
      'Penghasilan Wali / Bulan': text(otherGuardian.monthlyIncome),
      'Jenjang Pendidikan Terakhir': text(education.level),
      'Nama Sekolah Terakhir': text(education.institutionName),
      'Kota Sekolah Terakhir': text(education.cityRegency),
      'Provinsi Sekolah Terakhir': text(education.province),
      'Tahun Lulus': text(education.graduationYear),
      'Program Aktif': text(student.active_program?.program_name),
      'Kelas': text(student.active_program?.class_name),
      'Tahun Ajaran': text(student.active_program?.academic_year),
      'Status': text(student.status),
      'Dibuat Pada': date(student.created_at),
      'Diperbarui Pada': date(student.updated_at),
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(exportRows);
  worksheet['!freeze'] = { xSplit: 0, ySplit: 1 };
  worksheet['!autofilter'] = { ref: worksheet['!ref'] || 'A1:BG1' };
  worksheet['!cols'] = Object.keys(exportRows[0] || {}).map(key => ({ wch: Math.min(32, Math.max(14, key.length + 4)) }));
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Siswa Lengkap');
  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  return new NextResponse(buffer, { status: 200, headers: { 'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'Content-Disposition': `attachment; filename="export-master-students-lengkap-${new Date().toISOString().slice(0, 10)}.xlsx"`, 'Cache-Control': 'no-store' } });
}
