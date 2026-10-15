import { connection, type NextRequest } from "next/server";
import { json, intParam, toErrorResponse } from "@/lib/server/http";
import { searchCatalog } from "@/lib/server/catalog";

/** Search wa haraka: bidhaa + makala. */
export async function GET(req: NextRequest) {
  await connection();
  try {
    const q = req.nextUrl.searchParams.get("q") ?? "";
    const limit = intParam(req.nextUrl.searchParams.get("limit"), 12, 40);
    const results = await searchCatalog(q, limit);
    return json({ ok: true, query: q, results });
  } catch (error) {
    return toErrorResponse(error);
  }
}
