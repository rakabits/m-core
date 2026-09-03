import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { prisma } from '@/core/database/prisma';

export async function POST(_: Request, context: { params: Promise<{ id: string }> }) {
  const session = await createSupabaseServerClient();
  const { data: { user: actor } } = await session.auth.getUser();
  if (!actor) return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED' } }, { status: 401 });
  const { id } = await context.params;
  const target = await prisma.userProfile.findUnique({ where: { id }, select: { email: true } });
  if (!target?.email) return NextResponse.json({ success: false, error: { code: 'EMAIL_NOT_FOUND' } }, { status: 422 });
  const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { autoRefreshToken: false, persistSession: false } });
  const { data, error } = await admin.auth.admin.generateLink({ type: 'recovery', email: target.email, options: { redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/reset-password` } });
  if (error || !data.properties?.action_link) return NextResponse.json({ success: false, error: { code: error?.message ?? 'RESET_LINK_FAILED' } }, { status: 502 });
  return NextResponse.json({ success: true, data: { resetLink: data.properties.action_link } });
}