import { NextResponse, type NextRequest } from "next/server";
import { readBody, toErrorResponse } from "@/lib/server/http";
import { ADMIN_COOKIE, checkPassword, createSession } from "@/lib/server/auth";

/** Ingia kama admin — hupokea cookie ya session (httpOnly). */
export async function POST(req: NextRequest) {
  try {
    const body = await readBody<{ password?: string }>(req);
    if (!body || !checkPassword(String(body.password ?? ""))) {
      return NextResponse.json(
        { ok: false, error: "Nywila si sahihi. Jaribu tena." },
        { status: 401 },
      );
    }

    const { token, maxAge } = createSession();
    const res = NextResponse.json({ ok: true });
    res.cookies.set(ADMIN_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge,
    });
    return res;
  } catch (error) {
    return toErrorResponse(error);
  }
}
