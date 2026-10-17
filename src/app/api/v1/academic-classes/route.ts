import { NextRequest, NextResponse } from 'next/server';
import { listClassesByYear, syncAcademicClassCatalog } from '@/modules/academic-classes/service';
import { prisma } from '@/core/database/prisma';

export async function GET(request: NextRequest) {
  const academicYear = request.nextUrl.searchParams.get('academicYear');
  const programId = request.nextUrl.searchParams.get('programId');

  // Mode 1: List semua kelas dalam satu tahun akademik (untuk halaman Class Management)
  if (academicYear && !programId) {
    try {
      const data = await listClassesByYear(academicYear);
      return NextResponse.json({ success: true, data });
    } catch (error) {
      console.error('[GET academic classes by year]', error);
      return NextResponse.json({ success: false, error: { message: 'Gagal memuat daftar kelas.' } }, { status: 500 });
    }
  }

  // Mode 2 (legacy): Sync dari JuniorHighClass/SeniorHighClass berdasarkan programId
  if (programId && academicYear) {
    try {
      const year = await prisma.academicYear.findUnique({ where: { code: academicYear }, select: { id: true } });
      if (!year) return NextResponse.json({ success: true, data: [] });
      const data = await syncAcademicClassCatalog(programId, year.id);
      return NextResponse.json({ success: true, data });
    } catch (error) {
      console.error('[GET academic classes legacy]', error);
      return NextResponse.json({ success: false, error: { message: 'Gagal memuat kelas dari Academic Center.' } }, { status: 500 });
    }
  }

  return NextResponse.json({ success: false, error: { message: 'Parameter academicYear wajib diisi.' } }, { status: 422 });
}
