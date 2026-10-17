import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/core/database/prisma';

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const data = await prisma.teacherSpouse.findMany({ where: { teacherId: id }, include: { partnerTeacher: { select: { id: true, displayName: true, employeeCode: true } } } });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, error: { message: error instanceof Error ? error.message : 'Gagal memuat pasangan.' } }, { status: 500 });
  }
}

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const data = await prisma.teacherSpouse.upsert({
      where: { teacherId: id },
      create: { teacherId: id, relationship: body.relationship ?? 'SPOUSE', isMumtazaStaff: Boolean(body.isMumtazaStaff), partnerTeacherId: body.partnerTeacherId || null, manualName: body.manualName || null },
      update: { relationship: body.relationship ?? 'SPOUSE', isMumtazaStaff: Boolean(body.isMumtazaStaff), partnerTeacherId: body.partnerTeacherId || null, manualName: body.manualName || null },
    });
    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: { message: error instanceof Error ? error.message : 'Gagal menyimpan pasangan.' } }, { status: 400 });
  }
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try { const { id } = await context.params; const body = await request.json(); const data = await prisma.teacherSpouse.updateMany({ where: { id: body.id, teacherId: id }, data: { isMumtazaStaff: body.isMumtazaStaff, partnerTeacherId: body.partnerTeacherId || null, manualName: body.manualName || null, relationship: body.relationship } }); return NextResponse.json({ success: true, data }); } catch (error) { return NextResponse.json({ success: false, error: { message: error instanceof Error ? error.message : 'Gagal memperbarui pasangan.' } }, { status: 400 }); }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try { const { id } = await context.params; const body = await request.json(); await prisma.teacherSpouse.deleteMany({ where: { id: body.id, teacherId: id } }); return NextResponse.json({ success: true }); } catch { return NextResponse.json({ success: false, error: { message: 'Gagal menghapus pasangan.' } }, { status: 400 }); }
}