import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { updateSession } from "@/infrastructure/supabase/proxy";

const PROTECTED_PATHS = ["/cuenta", "/checkout", "/admin"];
const AUTH_PATHS = ["/login", "/registro"];

function startsWithAny(pathname: string, prefixes: readonly string[]) {
  return prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export async function proxy(request: NextRequest) {
  const { response, user } = await updateSession(request);
  const { pathname } = request.nextUrl;

  if (!user && startsWithAny(pathname, PROTECTED_PATHS)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (user && startsWithAny(pathname, AUTH_PATHS)) {
    return NextResponse.redirect(new URL("/tienda", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|api/recommend|favicon.ico|sw.js|manifest.json|images/|icon-|apple-icon|robots.txt|sitemap.xml).*)",
  ],
};
