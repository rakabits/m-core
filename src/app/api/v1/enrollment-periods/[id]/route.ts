import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/core/database/prisma';
export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const body = await request.json();
  const updateData: Record<string, unknown> = {};

  if (body.status !== undefined) {
    if (!['DRAFT', 'OPEN', 'CLOSED', 'ARCHIVED'].includes(body.status)) {
      return NextResponse.json({ success: false, error: { code: 'VALIDATION_ERROR' } }, { status: 422 });
    }
    updateData.status = body.status;
  }
  if (body.name !== undefined) updateData.name = String(body.name).trim();
  if (body.notes !== undefined) updateData.notes = body.notes ? String(body.notes).trim() : null;
  if (body.formTemplateId !== undefined) updateData.formTemplateId = body.formTemplateId || null;
  if (body.programId !== undefined) updateData.programId = String(body.programId);
  if (body.registrationFee !== undefined) updateData.registrationFee = Number(body.registrationFee);
  if (body.startsAt !== undefined) updateData.startsAt = new Date(body.startsAt);
  if (body.endsAt !== undefined) updateData.endsAt = new Date(body.endsAt);

  const data = await prisma.enrollmentPeriod.update({
    where: { id },
    data: updateData,
    include: {
      program: { select: { id: true, programName: true, programCode: true } },
      formTemplate: true,
    },
  });
  return NextResponse.json({ success: true, data });
}

