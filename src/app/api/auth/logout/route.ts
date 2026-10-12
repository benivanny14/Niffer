import { NextResponse } from "next/server";
import { ADMIN_COOKIE, destroySession } from "@/lib/server/auth";

/** Ondoa admin session. */
export async function POST() {
  await destroySession();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
