import type { ReactNode } from 'react';
import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { AdminShell } from '@/components/AdminShell';
import { getCurrentUser } from '@/lib/auth/local';
import { SSOInitialGate } from '@/components/SSOInitialGate';

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  return (
    <Suspense fallback={null}>
      <SSOInitialGate><AdminShell>{children}</AdminShell></SSOInitialGate>
    </Suspense>
  );
}

