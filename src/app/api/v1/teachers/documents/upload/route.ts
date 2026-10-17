import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

const allowedTypes = new Set([
  'ID_CARD',
  'FAMILY_CARD',
  'DIPLOMA',
  'EMPLOYMENT',
  'ASSIGNMENT',
  'OTHER'
]);

export async function POST(request: NextRequest) {
  try {
    const form = await request.formData();
    const file = form.get('file');
    const type = String(form.get('type') ?? 'OTHER').toUpperCase();
    const teacherId = String(form.get('teacherId') ?? 'temp').trim();

    if (!(file instanceof File)) {
      return NextResponse.json({ success: false, error: { message: 'File dokumen wajib dipilih.' } }, { status: 422 });
    }

    if (!allowedTypes.has(type)) {
      return NextResponse.json({ success: false, error: { message: 'Kategori dokumen tidak valid.' } }, { status: 422 });
    }

    if (file.size < 1 || file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: { message: 'Ukuran file maksimal 10 MB.' } }, { status: 422 });
    }

    // Tentukan folder Cloudinary terorganisir berdasarkan kategori dokumen
    let categoryFolder = 'other';
    if (type === 'ID_CARD') categoryFolder = 'ktp';
    else if (type === 'FAMILY_CARD') categoryFolder = 'kartu_keluarga';
    else if (type === 'DIPLOMA') categoryFolder = 'ijazah_sertifikat';
    else if (type === 'ASSIGNMENT' || type === 'EMPLOYMENT') categoryFolder = 'sk_tugas_jabatan';

    const targetFolder = `m-core/teachers/${teacherId}/${categoryFolder}`;

    const buffer = Buffer.from(await file.arrayBuffer());

    const result = await new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: targetFolder,
          resource_type: 'auto',
          use_filename: true,
          unique_filename: true
        },
        (error, value) => {
          if (error || !value) {
            reject(error ?? new Error('Upload ke Cloudinary gagal.'));
          } else {
            resolve({ secure_url: value.secure_url, public_id: value.public_id });
          }
        }
      );
      uploadStream.end(buffer);
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          fileUrl: result.secure_url,
          publicId: result.public_id,
          type,
          categoryFolder,
          title: file.name
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[teachers.upload]', error);
    return NextResponse.json(
      {
        success: false,
        error: { message: error instanceof Error ? error.message : 'Gagal mengunggah dokumen ke Cloudinary.' }
      },
      { status: 500 }
    );
  }
}
