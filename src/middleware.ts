import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("sekar_token")?.value;
  const path = request.nextUrl.pathname;

  // Protected routes: driver profile
  if (path.startsWith("/ho-so")) {
    if (!token) {
      return NextResponse.redirect(new URL("/dang-nhap", request.url));
    }
    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.redirect(new URL("/dang-nhap", request.url));
    }
  }

  // Admin routes
  if (path.startsWith("/admin")) {
    if (!token) {
      return NextResponse.redirect(new URL("/dang-nhap", request.url));
    }
    const payload = await verifyToken(token);
    if (!payload || payload.role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/ho-so/:path*", "/admin/:path*"],
};
