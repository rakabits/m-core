import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/core/database/prisma';

const teacherInclude = { assignments: true, educationHistories: true, spouseLinks: { include: { partnerTeacher: { select: { id: true, displayName: true, employeeCode: true } } } }, familyMembers: true, documentRecords: true } as const;

export async function GET(request: NextRequest) {
  try {
    const q = request.nextUrl.searchParams.get('search')?.trim() ?? '';
    const nik = request.nextUrl.searchParams.get('nik')?.trim() ?? '';
    if (nik) {
      const teachers = await prisma.teacher.findMany({ select: { id: true, displayName: true, employeeCode: true, profile: true } });
      const match = teachers.find((teacher) => {
        const profile = teacher.profile as Record<string, unknown> | null;
        return profile?.nik === nik;
      });
      return NextResponse.json({ success: true, available: !match, data: match ?? null });
    }
    const data = await prisma.teacher.findMany({
      where: q ? { OR: [{ displayName: { contains: q, mode: 'insensitive' } }, { employeeCode: { contains: q, mode: 'insensitive' } }] } : undefined,
      select: { id: true, employeeCode: true, displayName: true, isActive: true, profile: true, address: true, employment: true },
      orderBy: { displayName: 'asc' },
    });
    return NextResponse.json({ success: true, data });
  } catch (error) { console.error('[teachers.list]', error); return NextResponse.json({ success: false, error: { message: 'Gagal memuat data guru.' } }, { status: 500 }); }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { displayName?: string; isActive?: boolean; profile?: Record<string, unknown>; address?: unknown; employment?: unknown; education?: unknown; spouse?: unknown; family?: unknown; documents?: unknown };
    if (!body.displayName?.trim()) return NextResponse.json({ success: false, error: { message: 'Nama lengkap guru wajib diisi.' } }, { status: 422 });
    const nik = String(body.profile?.nik ?? '').trim();
    if (nik) {
      const teachers = await prisma.teacher.findMany({ select: { profile: true } });
      if (teachers.some((teacher) => (teacher.profile as Record<string, unknown> | null)?.nik === nik)) {
        return NextResponse.json({ success: false, error: { message: 'NIK sudah terdaftar pada Daftar Teacher.' } }, { status: 409 });
      }
    }
    const latest = await prisma.teacher.findFirst({ where: { employeeCode: { startsWith: 'G-' } }, orderBy: { employeeCode: 'desc' }, select: { employeeCode: true } });
    const nextNumber = latest?.employeeCode ? Number(latest.employeeCode.slice(2)) + 1 : 1;
    const employeeCode = `G-${String(nextNumber).padStart(4, '0')}`;
    const teacher = await prisma.teacher.create({ data: { displayName: body.displayName.trim(), employeeCode, isActive: body.isActive ?? true, profile: body.profile as object ?? undefined, address: body.address as object ?? undefined, employment: body.employment as object ?? undefined, education: body.education as object ?? undefined, spouse: body.spouse as object ?? undefined, family: body.family as object ?? undefined, documents: body.documents as object ?? undefined }, include: teacherInclude });
    return NextResponse.json({ success: true, data: teacher }, { status: 201 });
  } catch (error) { console.error('[teachers.create]', error); return NextResponse.json({ success: false, error: { message: error instanceof Error ? error.message : 'Gagal membuat data guru.' } }, { status: 400 }); }
}