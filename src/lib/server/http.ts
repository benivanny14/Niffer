import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { InputError } from "@/lib/server/errors";

/** JSON response ya kawaida. */
export function json(data: unknown, status = 200): NextResponse {
  return NextResponse.json(data, { status });
}

/** JSON response ya hitilafu — frontend hupata `{ ok: false, error }`. */
export function fail(error: string, status = 400): NextResponse {
  return NextResponse.json({ ok: false, error }, { status });
}

/** Read JSON body (rudisha null kama si JSON sahihi). */
export async function readBody<T>(req: NextRequest): Promise<T | null> {
  try {
    const body = (await req.json()) as T;
    if (!body || typeof body !== "object") return null;
    return body;
  } catch {
    return null;
  }
}

/** Badilisha hitilafu kuwa JSON response sahihi (400/404/409/500). */
export function toErrorResponse(error: unknown): NextResponse {
  if (error instanceof InputError) return fail(error.message, error.status);
  console.error("[api] hitilafu isiyotarajiwa:", error);
  return fail("Server error. Please try again later.", 500);
}

/** Namba salama kutoka query string. */
export function intParam(
  value: string | null | undefined,
  fallback: number,
  max = 500,
): number {
  const n = Number.parseInt(value ?? "", 10);
  if (Number.isNaN(n) || n < 0) return fallback;
  return Math.min(n, max);
}
