import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { hasPermission } from '@/modules/rbac/authorization';
import { prisma } from '@/core/database/prisma';
import { deleteStudentPhoto, uploadStudentPhoto } from '@/lib/cloudinary';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

async function actor() { const supabase = await createSupabaseServerClient(); return (await supabase.auth.getUser()).data.user; }
function errorResponse(code: string, status: number) { return NextResponse.json({ success: false, error: { code } }, { status }); }

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const user = await actor();
  if (!user) return errorResponse('UNAUTHORIZED', 401);
  if (!(await hasPermission(user.id, 'student.update'))) return errorResponse('FORBIDDEN', 403);
  const { id } = await context.params;
  const student = await prisma.student.findUnique({ where: { id }, select: { photoPublicId: true } });
  if (!student) return errorResponse('NOT_FOUND', 404);
  const formData = await request.formData();
  const file = formData.get('file');
  if (!(file instanceof File)) return errorResponse('PHOTO_REQUIRED', 422);
  if (!ALLOWED_TYPES.has(file.type)) return errorResponse('PHOTO_TYPE_NOT_ALLOWED', 422);
  if (file.size > MAX_FILE_SIZE) return errorResponse('PHOTO_TOO_LARGE', 422);
  try {
    const uploaded = await uploadStudentPhoto(Buffer.from(await file.arrayBuffer()), id);
    const updated = await prisma.student.update({ where: { id }, data: { photoUrl: uploaded.secure_url, photoPublicId: uploaded.public_id }, select: { photoUrl: true } });
    if (student.photoPublicId && student.photoPublicId !== uploaded.public_id) await deleteStudentPhoto(student.photoPublicId);
    return NextResponse.json({ success: true, data: { photo_url: updated.photoUrl } });
  } catch (error) {
    console.error('[students.photo] upload failure', error);
    return errorResponse(error instanceof Error && error.message === 'CLOUDINARY_NOT_CONFIGURED' ? 'CLOUDINARY_NOT_CONFIGURED' : 'PHOTO_UPLOAD_FAILED', 500);
  }
}

export async function DELETE(_: NextRequest, context: { params: Promise<{ id: string }> }) {
  const user = await actor();
  if (!user) return errorResponse('UNAUTHORIZED', 401);
  if (!(await hasPermission(user.id, 'student.update'))) return errorResponse('FORBIDDEN', 403);
  const { id } = await context.params;
  const student = await prisma.student.findUnique({ where: { id }, select: { photoPublicId: true } });
  if (!student) return errorResponse('NOT_FOUND', 404);
  try {
    if (student.photoPublicId) await deleteStudentPhoto(student.photoPublicId);
    await prisma.student.update({ where: { id }, data: { photoUrl: null, photoPublicId: null } });
    return NextResponse.json({ success: true, data: { photo_url: null } });
  } catch (error) {
    console.error('[students.photo] delete failure', error);
    return errorResponse(error instanceof Error && error.message === 'CLOUDINARY_NOT_CONFIGURED' ? 'CLOUDINARY_NOT_CONFIGURED' : 'PHOTO_DELETE_FAILED', 500);
  }
}