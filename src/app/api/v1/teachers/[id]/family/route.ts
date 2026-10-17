import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/core/database/prisma';

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const data = await prisma.teacherFamily.findMany({
      where: { teacherId: id }
    });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, error: { message: error instanceof Error ? error.message : 'Gagal memuat data keluarga.' } }, { status: 500 });
  }
}

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    if (!body.relation || !body.fullName) {
      return NextResponse.json({ success: false, error: { message: 'Relasi dan nama lengkap wajib diisi.' } }, { status: 422 });
    }
    const data = await prisma.teacherFamily.upsert({
      where: { teacherId_relation: { teacherId: id, relation: body.relation } },
      create: { teacherId: id, relation: body.relation, fullName: body.fullName },
      update: { fullName: body.fullName }
    });
    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: { message: error instanceof Error ? error.message : 'Gagal menyimpan data keluarga.' } }, { status: 400 });
  }
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const data = await prisma.teacherFamily.updateMany({
      where: { id: body.id, teacherId: id },
      data: { relation: body.relation, fullName: body.fullName }
    });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, error: { message: error instanceof Error ? error.message : 'Gagal memperbarui keluarga.' } }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    await prisma.teacherFamily.deleteMany({ where: { id: body.id, teacherId: id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: { message: 'Gagal menghapus keluarga.' } }, { status: 400 });
  }
}