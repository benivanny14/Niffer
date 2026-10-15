import { connection, type NextRequest } from "next/server";
import { fail, intParam, json, toErrorResponse } from "@/lib/server/http";
import { isAdminRequest } from "@/lib/server/auth";
import { listStockMovements } from "@/lib/server/orders";

/** Stock audit trail is private to administrators. */
export async function GET(req: NextRequest) {
  await connection();
  try {
    if (!(await isAdminRequest())) return fail("Sign in as an administrator to view stock history.", 401);
    const limit = intParam(req.nextUrl.searchParams.get("limit"), 50, 200);
    const slug = req.nextUrl.searchParams.get("slug")?.trim();
    return json({ ok: true, movements: await listStockMovements(limit, slug || undefined) });
  } catch (error) {
    return toErrorResponse(error);
  }
}
