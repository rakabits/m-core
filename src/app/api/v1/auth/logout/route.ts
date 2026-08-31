import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function POST() {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signOut();
  if (error) return NextResponse.json({ success: false, error: { code: 'LOGOUT_FAILED', message: 'Logout gagal.' } }, { status: 500 });
  return NextResponse.json({ success: true, data: null });
}
