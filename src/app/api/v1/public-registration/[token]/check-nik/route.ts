import { NextRequest, NextResponse } from 'next/server'; import { prisma } from '@/core/database/prisma';
export const dynamic = 'force-dynamic';
export async function GET(request: NextRequest, context: { params: Promise<{ token: string }> }) {
  const { token } = await context.params;
  const nik = request.nextUrl.searchParams.get('nik')?.trim();
  if (!nik) return NextResponse.json({ available: true }, { headers: { 'Cache-Control': 'no-store' } });
  try {
    const current = await prisma.applicant.findUnique({ where: { publicToken: token }, select: { id: true, studentId: true } });
    if (!current) return NextResponse.json({ available: false, error: 'Link tidak ditemukan' }, { status: 404, headers: { 'Cache-Control': 'no-store' } });
    // Jika applicant sudah terhubung ke student, NIK tidak perlu dicek ulang
    if (current.studentId) return NextResponse.json({ available: true }, { headers: { 'Cache-Control': 'no-store' } });
    const [inMaster, inEnrollment] = await Promise.all([
      prisma.student.findFirst({ where: { nik }, select: { id: true } }),
      prisma.applicant.findFirst({ where: { nationalId: nik, NOT: { id: current.id }, status: { not: 'REJECTED' } }, select: { id: true } }),
    ]);
    if (inMaster) return NextResponse.json({ available: false, code: 'IN_MASTER', message: 'NIK sudah terdaftar sebagai siswa resmi. Silakan hubungi admin.' }, { headers: { 'Cache-Control': 'no-store' } });
    if (inEnrollment) return NextResponse.json({ available: false, code: 'IN_ENROLLMENT', message: 'NIK sudah digunakan pada pendaftaran lain.' }, { headers: { 'Cache-Control': 'no-store' } });
    return NextResponse.json({ available: true }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('[GET /api/v1/public-registration/:token/check-nik]', error);
    return NextResponse.json({ available: true }, { headers: { 'Cache-Control': 'no-store' } });
  }
}
