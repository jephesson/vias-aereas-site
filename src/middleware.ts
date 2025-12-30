import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const headers = new Headers(req.headers);
  headers.set("x-pathname", req.nextUrl.pathname);
  return NextResponse.next({ request: { headers } });
}

// evita rodar em assets
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
