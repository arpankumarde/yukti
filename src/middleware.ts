import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  if (path.startsWith("/applicant/dashboard")) {
    const token = request.cookies.get("ykapptoken")?.value;
    if (!token) {
      return NextResponse.redirect(
        new URL("/applicant/login", request.nextUrl)
      );
    }
  }

  if (path.startsWith("/recruiter/dashboard")) {
    const token = request.cookies.get("ykrectoken")?.value;
    if (!token) {
      return NextResponse.redirect(
        new URL("/recruiter/login", request.nextUrl)
      );
    }
  }

  if (path.startsWith("/company/dashboard")) {
    const token = request.cookies.get("ykcomtoken")?.value;
    if (!token) {
      return NextResponse.redirect(new URL("/company/login", request.nextUrl));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/company/dashboard/:path*",
    "/recruiter/dashboard/:path*",
    "/applicant/dashboard/:path*",
  ],
};
