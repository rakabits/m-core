import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/core/database/prisma';

export async function GET() {
  try {
    const data = await prisma.enrollmentPeriod.findMany({ include: { program: { select: { id: true, programName: true, programCode: true } }, formTemplate: true }, orderBy: { startsAt: 'desc' } });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Failed to load enrollment periods:', error);
    return NextResponse.json({ success: false, error: { code: 'ENROLLMENT_PERIODS_LOAD_FAILED', message: 'Gagal memuat periode pendaftaran' } }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.programId || !body.name || !body.startsAt || !body.endsAt || !Number.isInteger(body.registrationFee) || body.registrationFee < 0) return NextResponse.json({ success: false, error: { code: 'VALIDATION_ERROR' } }, { status: 422 });
    const data = await prisma.enrollmentPeriod.create({ data: { programId: body.programId, formTemplateId: body.formTemplateId || null, name: body.name.trim(), status: body.status || 'DRAFT', registrationFee: body.registrationFee, startsAt: new Date(body.startsAt), endsAt: new Date(body.endsAt), notes: body.notes?.trim() || null }, include: { program: { select: { id: true, programName: true, programCode: true } }, formTemplate: true } });
    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    console.error('Failed to save enrollment period:', error);
    return NextResponse.json({ success: false, error: { code: 'ENROLLMENT_PERIOD_SAVE_FAILED', message: 'Gagal menyimpan periode pendaftaran' } }, { status: 500 });
  }
}
