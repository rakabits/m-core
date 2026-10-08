import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/core/database/prisma';
export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) { const { id } = await context.params; const { status } = await request.json(); if (!['DRAFT','OPEN','CLOSED','ARCHIVED'].includes(status)) return NextResponse.json({ success: false, error: { code: 'VALIDATION_ERROR' } }, { status: 422 }); const data = await prisma.enrollmentPeriod.update({ where: { id }, data: { status } }); return NextResponse.json({ success: true, data }); }
