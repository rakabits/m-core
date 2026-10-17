import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/core/database/prisma';
import { TeacherDocumentType } from '@prisma/client';

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const data = await prisma.teacherDocument.findMany({
      where: { teacherId: id },
      orderBy: { uploadedAt: 'desc' }
    });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, error: { message: error instanceof Error ? error.message : 'Gagal memuat dokumen.' } }, { status: 500 });
  }
}

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    if (!body.title || !body.fileUrl) {
      return NextResponse.json({ success: false, error: { message: 'Judul dan URL file wajib diisi.' } }, { status: 422 });
    }
    const data = await prisma.teacherDocument.create({
      data: {
        teacherId: id,
        type: (body.type as TeacherDocumentType) || 'OTHER',
        title: body.title,
        fileUrl: body.fileUrl
      }
    });
    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: { message: error instanceof Error ? error.message : 'Gagal menambahkan dokumen.' } }, { status: 400 });
  }
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const data = await prisma.teacherDocument.updateMany({
      where: { id: body.id, teacherId: id },
      data: {
        type: body.type,
        title: body.title,
        fileUrl: body.fileUrl
      }
    });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, error: { message: error instanceof Error ? error.message : 'Gagal memperbarui dokumen.' } }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    await prisma.teacherDocument.deleteMany({ where: { id: body.id, teacherId: id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: { message: 'Gagal menghapus dokumen.' } }, { status: 400 });
  }
}