import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/core/database/prisma';

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const data = await prisma.teacherAssignment.findMany({
      where: { teacherId: id },
      orderBy: { startedAt: 'desc' }
    });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, error: { message: error instanceof Error ? error.message : 'Gagal memuat riwayat jabatan.' } }, { status: 500 });
  }
}

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    if (!body.unit || !body.position) {
      return NextResponse.json({ success: false, error: { message: 'Unit dan jabatan wajib diisi.' } }, { status: 422 });
    }
    const data = await prisma.teacherAssignment.create({
      data: {
        teacherId: id,
        unit: body.unit,
        position: body.position,
        startedAt: body.startedAt ? new Date(body.startedAt) : new Date(),
        endedAt: body.endedAt ? new Date(body.endedAt) : null,
        notes: body.notes || null
      }
    });
    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: { message: error instanceof Error ? error.message : 'Gagal menambahkan jabatan.' } }, { status: 400 });
  }
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const data = await prisma.teacherAssignment.updateMany({
      where: { id: body.id, teacherId: id },
      data: {
        unit: body.unit,
        position: body.position,
        startedAt: body.startedAt ? new Date(body.startedAt) : undefined,
        endedAt: body.endedAt ? new Date(body.endedAt) : null,
        notes: body.notes
      }
    });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, error: { message: error instanceof Error ? error.message : 'Gagal memperbarui jabatan.' } }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    await prisma.teacherAssignment.deleteMany({ where: { id: body.id, teacherId: id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: { message: 'Gagal menghapus jabatan.' } }, { status: 400 });
  }
}