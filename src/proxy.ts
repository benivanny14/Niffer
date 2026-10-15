import { NextResponse, type NextRequest } from "next/server";

function notFound() {
  return new NextResponse("Not found", { status: 404 });
}

/** Keep the normal admin route private and expose it only through a secret URL segment. */
export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const routeToken = process.env.ADMIN_PANEL_PATH?.trim() ?? "";
  const validToken = /^[A-Za-z0-9_-]{32,128}$/.test(routeToken);

  if (pathname === "/admin" || pathname.startsWith("/admin/")) return notFound();
  if (!validToken) return NextResponse.next();

  const privateRoot = `/${routeToken}`;
  if (pathname !== privateRoot && !pathname.startsWith(`${privateRoot}/`)) {
    return NextResponse.next();
  }

  const destination = request.nextUrl.clone();
  destination.pathname = `/admin${pathname.slice(privateRoot.length)}`;
  return NextResponse.rewrite(destination);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
