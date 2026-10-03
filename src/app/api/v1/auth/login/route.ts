import { NextRequest, NextResponse } from 'next/server';
import { authenticate, createSession } from '@/lib/auth/local';

export async function POST(request: NextRequest) {
  const body = await request.json() as { identifier?: string; password?: string };
  if (!body.identifier || !body.password) return NextResponse.json({ success: false, error: { code: 'INVALID_CREDENTIALS' } }, { status: 401 });
  const user = await authenticate(body.identifier, body.password);
  if (!user) return NextResponse.json({ success: false, error: { code: 'INVALID_CREDENTIALS' } }, { status: 401 });
  await createSession(user.id);
  return NextResponse.json({ success: true, data: { userId: user.id } });
}
