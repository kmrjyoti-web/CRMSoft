import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Admin routes — require pc_token (PLATFORM_ADMIN JWT)
const ADMIN_PREFIX = '/(main)';

// Public routes — no token needed (static pages + brand user flows)
const PUBLIC_PREFIXES = [
  '/login',
  '/register',
  '/portal-login',
  '/onboarding',
  '/_next',
  '/api',
];

function isAdminRoute(pathname: string): boolean {
  // Next.js route groups: (main) in filesystem maps to /governance etc.
  // The actual URL paths are /governance, /dashboard, /brands, etc.
  // Check against known admin-only paths
  const ADMIN_PATHS = [
    '/governance', '/dashboard', '/brands', '/health', '/tests',
    '/versions', '/cicd', '/alerts', '/errors', '/menus',
    '/brand-config', '/verticals', '/security',
  ];
  return ADMIN_PATHS.some((p) => pathname.startsWith(p));
}

function isPublic(pathname: string): boolean {
  if (pathname === '/' || pathname === '/favicon.ico') return true;
  return PUBLIC_PREFIXES.some((p) => pathname.startsWith(p));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublic(pathname)) return NextResponse.next();

  if (isAdminRoute(pathname)) {
    const token = request.cookies.get('pc_token')?.value;
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('returnUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // All other routes — pass through (brand-specific pages, etc.)
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
