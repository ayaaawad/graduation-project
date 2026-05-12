import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Check if accessing admin routes
  if (pathname.startsWith('/admin') && pathname !== '/admin/dashboard') {
    const adminEmail = request.cookies.get('admin_email')?.value;
    const adminRole = request.cookies.get('admin_role')?.value;

    // If not authenticated or doesn't have admin role, redirect to dashboard
    if (!adminEmail || !adminRole) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }

    // If accessing /admin/manage but role is not 'admin', redirect to dashboard
    if (pathname.startsWith('/admin/manage') && adminRole !== 'admin') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
