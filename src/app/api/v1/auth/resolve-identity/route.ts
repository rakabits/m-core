import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/core/database/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { identifier?: string };
    const identifier = body.identifier?.trim() ?? '';
    if (!identifier) return NextResponse.json({ error: 'IDENTIFIER_REQUIRED' }, { status: 400 });
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
    const isNik = /^\d{16}$/.test(identifier);
    const studentNumber = /^\d+$/.test(identifier) ? Number(identifier) : NaN;
    const profile = isEmail
      ? await prisma.userProfile.findFirst({ where: { email: identifier.toLowerCase(), isActive: true }, select: { email: true } })
      : isNik
        ? await prisma.userProfile.findFirst({ where: { isActive: true, student: { nik: identifier } }, select: { email: true } })
        : Number.isSafeInteger(studentNumber)
          ? await prisma.userProfile.findFirst({ where: { isActive: true, student: { studentNumber } }, select: { email: true } })
          : null;
    if (!profile?.email) return NextResponse.json({ error: 'INVALID_CREDENTIALS' }, { status: 401 });
    return NextResponse.json({ data: { email: profile.email } });
  } catch {
    return NextResponse.json({ error: 'INVALID_CREDENTIALS' }, { status: 401 });
  }
}