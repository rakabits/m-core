import { NextResponse, type NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth/local';

export async function proxy(request: NextRequest) {
  const publicPaths = ['/api/v1/auth/login', '/api/v1/auth/resolve-identity'];
  const isPublic = publicPaths.some((path) => request.nextUrl.pathname === path);
  const user = await getCurrentUser();
  if (!user && !isPublic) return NextResponse.redirect(new URL('/login', request.url));
  return NextResponse.next();
}

export const config = { matcher: ['/dashboard/:path*', '/api/v1/:path*'] };
