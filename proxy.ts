import { NextResponse, type NextRequest } from "next/server";
import { auth0 } from "@/lib/auth0";

const PROTECTED_AREAS = ["/manager", "/worker"];

const isProtected = (pathname: string) =>
  PROTECTED_AREAS.some((area) => pathname === area || pathname.startsWith(`${area}/`));

// Signed-out visitors are sent to sign-in here, before any layout renders, so
// the return path is the page they asked for. A layout cannot see the request
// path and would send everyone back to the role home instead. The page and
// layout guards in lib/auth.ts still run as a second line of defence.
export async function proxy(request: NextRequest) {
  const authResponse = await auth0.middleware(request);

  const { pathname, search } = request.nextUrl;
  if (isProtected(pathname) && !(await auth0.getSession(request))) {
    const returnTo = encodeURIComponent(`${pathname}${search}`);
    return NextResponse.redirect(new URL(`/auth/login?returnTo=${returnTo}`, request.url));
  }

  return authResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
