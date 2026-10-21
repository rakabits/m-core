import { NextResponse } from 'next/server';
import { destroySession } from '@/lib/auth/local';

export async function POST() {
  await destroySession();
  return NextResponse.json({ success: true, data: null }, { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } });
}

