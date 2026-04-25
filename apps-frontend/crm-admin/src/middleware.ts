import type { NextRequest} from "next/server";
import { NextResponse } from "next/server";

const PUBLIC_PATHS = ["/login", "/forgot-password", "/register", "/select-company", "/brand-login"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("crm-token")?.value;

  const isPublicPath = PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/"),
  );

  // Unauthenticated → redirect to login (preserve intended destination)
  if (!token && !isPublicPath) {
    const loginUrl = new URL("/login", request.url);
    if (pathname !== "/") {
      loginUrl.searchParams.set("redirect", pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  // Authenticated user on a public route → redirect to self-care panel
  if (token && isPublicPath) {
    return NextResponse.redirect(new URL("/self-care", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
};
