import type { ReactNode } from "react";
import { Suspense } from "react";
import { AdminShell } from "@/components/AdminShell";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <Suspense fallback={null}><AdminShell>{children}</AdminShell></Suspense>;
}