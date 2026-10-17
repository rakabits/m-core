import { NextRequest, NextResponse } from 'next/server';
import { getClassDetail, setHomeRoomTeacher } from '@/modules/academic-classes/service';

type Params = { params: Promise<{ classId: string }> };

// GET /api/v1/academic-classes/:classId — detail kelas + wali kelas + siswa aktif
export async function GET(_request: NextRequest, { params }: Params) {
  const { classId } = await params;
  try {
    const data = await getClassDetail(classId);
    if (!data) return NextResponse.json({ success: false, error: { message: 'Kelas tidak ditemukan.' } }, { status: 404 });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('[GET academic class detail]', error);
    return NextResponse.json({ success: false, error: { message: 'Gagal memuat detail kelas.' } }, { status: 500 });
  }
}

// PUT /api/v1/academic-classes/:classId — tetapkan/hapus wali kelas & info lain
export async function PUT(request: NextRequest, { params }: Params) {
  const { classId } = await params;
  try {
    const body = await request.json() as { homeRoomTeacherId?: string | null };
    if ('homeRoomTeacherId' in body) {
      const data = await setHomeRoomTeacher(classId, body.homeRoomTeacherId ?? null);
      return NextResponse.json({ success: true, data });
    }
    return NextResponse.json({ success: false, error: { message: 'Tidak ada field yang dapat diperbarui.' } }, { status: 422 });
  } catch (error) {
    console.error('[PUT academic class]', error);
    return NextResponse.json({ success: false, error: { message: 'Gagal memperbarui kelas.' } }, { status: 500 });
  }
}
