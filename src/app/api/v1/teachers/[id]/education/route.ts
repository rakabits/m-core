import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/core/database/prisma';

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const data = await prisma.teacherEducation.findMany({
      where: { teacherId: id },
      orderBy: { graduatedYear: 'desc' }
    });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, error: { message: error instanceof Error ? error.message : 'Gagal memuat riwayat pendidikan.' } }, { status: 500 });
  }
}

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    if (!body.institutionName) {
      return NextResponse.json({ success: false, error: { message: 'Nama institusi wajib diisi.' } }, { status: 422 });
    }
    const data = await prisma.teacherEducation.create({
      data: {
        teacherId: id,
        level: body.level || 'S1',
        institutionName: body.institutionName,
        studyProgram: body.studyProgram || null,
        city: body.city || null,
        startedYear: body.startedYear ? Number(body.startedYear) : null,
        graduatedYear: body.graduatedYear ? Number(body.graduatedYear) : null,
        status: body.status || 'GRADUATED',
        notes: body.notes || null
      }
    });
    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: { message: error instanceof Error ? error.message : 'Gagal menambahkan riwayat pendidikan.' } }, { status: 400 });
  }
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    if (!body.id) return NextResponse.json({ success: false, error: { message: 'ID data pendidikan wajib diisi.' } }, { status: 422 });
    const data = await prisma.teacherEducation.updateMany({
      where: { id: body.id, teacherId: id },
      data: {
        level: body.level,
        institutionName: body.institutionName,
        studyProgram: body.studyProgram,
        city: body.city,
        startedYear: body.startedYear ? Number(body.startedYear) : null,
        graduatedYear: body.graduatedYear ? Number(body.graduatedYear) : null,
        status: body.status,
        notes: body.notes
      }
    });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, error: { message: error instanceof Error ? error.message : 'Gagal memperbarui data pendidikan.' } }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    await prisma.teacherEducation.deleteMany({ where: { id: body.id, teacherId: id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: { message: 'Gagal menghapus data pendidikan.' } }, { status: 400 });
  }
}