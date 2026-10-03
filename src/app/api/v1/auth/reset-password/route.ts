import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/core/database/prisma';
import { passwordHash } from '@/lib/auth/local';

export async function POST(request: NextRequest) {
  const body = await request.json() as { token?: string; password?: string };
  if (!body.token || !body.password || body.password.length < 8) return NextResponse.json({ success: false, error: { code: 'INVALID_RESET_REQUEST' } }, { status: 422 });
  const reset = await prisma.passwordResetToken.findUnique({ where: { token: body.token } });
  if (!reset || reset.usedAt || reset.expiresAt <= new Date()) return NextResponse.json({ success: false, error: { code: 'RESET_TOKEN_INVALID' } }, { status: 400 });
  await prisma.$transaction([
    prisma.userProfile.update({ where: { id: reset.userId }, data: { passwordHash: passwordHash(body.password) } }),
    prisma.passwordResetToken.update({ where: { id: reset.id }, data: { usedAt: new Date() } }),
    prisma.authSession.deleteMany({ where: { userId: reset.userId } }),
  ]);
  return NextResponse.json({ success: true, data: null });
}
