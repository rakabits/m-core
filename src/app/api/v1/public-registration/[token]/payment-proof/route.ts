import { NextRequest, NextResponse } from 'next/server';
import { uploadPaymentProof } from '@/lib/cloudinary';
export async function POST(request: NextRequest) {
  try {
    const form = await request.formData(); const file = form.get('file');
    if (!(file instanceof File) || !file.type.startsWith('image/')) return NextResponse.json({ success: false, error: { message: 'File harus berupa gambar' } }, { status: 400 });
    if (file.size > 5 * 1024 * 1024) return NextResponse.json({ success: false, error: { message: 'Ukuran gambar maksimal 5MB' } }, { status: 400 });
    const result = await uploadPaymentProof(Buffer.from(await file.arrayBuffer()), file.name);
    return NextResponse.json({ success: true, data: { url: result.secure_url, publicId: result.public_id } });
  } catch (error) { return NextResponse.json({ success: false, error: { message: error instanceof Error && error.message === 'CLOUDINARY_NOT_CONFIGURED' ? 'Cloudinary belum dikonfigurasi' : 'Upload bukti pembayaran gagal' } }, { status: 500 }); }
}