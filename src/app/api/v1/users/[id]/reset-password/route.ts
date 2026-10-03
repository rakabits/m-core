import { NextResponse } from 'next/server';
import { randomBytes } from 'node:crypto';
import { getCurrentUser } from '@/lib/auth/local';
import { prisma } from '@/core/database/prisma';

export async function POST(_: Request, context: { params: Promise<{ id: string }> }) {
  const actor = await getCurrentUser();
  if (!actor) return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED' } }, { status: 401 });
  const { id } = await context.params;
  const target = await prisma.userProfile.findUnique({ where: { id }, select: { email: true, isActive: true } });
  if (!target?.isActive) return NextResponse.json({ success: false, error: { code: 'USER_NOT_FOUND' } }, { status: 404 });
  const token = randomBytes(32).toString('base64url');
  await prisma.passwordResetToken.create({ data: { userId: id, token, expiresAt: new Date(Date.now() + 15 * 60 * 1000) } });
  return NextResponse.json({ success: true, data: { resetLink: `/reset-password?token=${encodeURIComponent(token)}` } });
}