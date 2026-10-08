import { NextResponse } from "next/server";
import { prisma } from "@/core/database/prisma";

export async function GET(_: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const item = await prisma.shortlink.findUnique({ where: { code } });
  if (!item) return new NextResponse("Shortlink tidak ditemukan", { status: 404 });
  return NextResponse.redirect(item.targetUrl);
}