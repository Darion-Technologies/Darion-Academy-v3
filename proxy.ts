import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

const authPaths = ["/login", "/forgot-password", "/reset-password"];

export async function proxy(request: NextRequest) {
  const { response, user } = await updateSession(request);
  const path = request.nextUrl.pathname;
  const publicPath =
    authPaths.includes(path) ||
    path.startsWith("/auth/") ||
    path.startsWith("/verify/");

  if (!user && !publicPath) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", `${path}${request.nextUrl.search}`);
    return NextResponse.redirect(login);
  }
  if (user && authPaths.includes(path)) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
