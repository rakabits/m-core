import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
cloudinary.config({ cloud_name: process.env.CLOUDINARY_CLOUD_NAME, api_key: process.env.CLOUDINARY_API_KEY, api_secret: process.env.CLOUDINARY_API_SECRET, secure: true });
const allowedTypes = new Set(['ID_CARD','FAMILY_CARD','DIPLOMA','EMPLOYMENT','OTHER']);
export async function POST(request: NextRequest) {
  try { const form=await request.formData(); const file=form.get('file'); const type=String(form.get('type')??'OTHER').toUpperCase(); const teacherId=String(form.get('teacherId')??'').trim();
    if (!(file instanceof File)) return NextResponse.json({success:false,error:{message:'File dokumen wajib dipilih.'}},{status:422});
    if (!teacherId || !allowedTypes.has(type)) return NextResponse.json({success:false,error:{message:'ID guru atau jenis dokumen tidak valid.'}},{status:422});
    if (file.size<1 || file.size>5*1024*1024) return NextResponse.json({success:false,error:{message:'Ukuran file maksimal 5 MB.'}},{status:422});
    if (!file.type.startsWith('image/') && file.type!=='application/pdf') return NextResponse.json({success:false,error:{message:'Format file harus gambar atau PDF.'}},{status:422});
    const result=await new Promise<{secure_url:string}>((resolve,reject)=>{const upload=cloudinary.uploader.upload_stream({folder:`m-core/teachers/${teacherId}/${type.toLowerCase()}`,resource_type:'auto'},(error,value)=>error||!value?reject(error??new Error('Upload gagal.')):resolve(value)); file.arrayBuffer().then(buffer=>upload.end(Buffer.from(buffer))).catch(reject);});
    return NextResponse.json({success:true,data:{fileUrl:result.secure_url,type,title:file.name}},{status:201});
  } catch(error) { return NextResponse.json({success:false,error:{message:error instanceof Error?error.message:'Gagal mengunggah dokumen.'}},{status:500}); }
}
