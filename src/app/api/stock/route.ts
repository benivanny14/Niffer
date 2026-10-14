import { connection, type NextRequest } from "next/server";
import { json, fail, readBody, toErrorResponse } from "@/lib/server/http";
import { getStockMap, setStockValue } from "@/lib/server/orders";
import { isAdminRequest } from "@/lib/server/auth";

/** Stoo ya bidhaa zote (umma — inahitajika na duka lote). */
export async function GET() {
  await connection();
  try {
    return json({ ok: true, stock: await getStockMap() });
  } catch (error) {
    return toErrorResponse(error);
  }
}

/** Weka stoo (admin pekee). */
export async function PATCH(req: NextRequest) {
  try {
    if (!(await isAdminRequest())) {
      return fail("Ingia kama admin kubadilisha stoo.", 401);
    }
    const body = await readBody<{ slug?: string; qty?: number }>(req);
    if (!body?.slug || typeof body.qty !== "number") {
      return fail("Taarifa za stoo hazisahihi.");
    }
    const qty = await setStockValue(String(body.slug), Number(body.qty));
    return json({ ok: true, slug: body.slug, qty, stock: await getStockMap() });
  } catch (error) {
    return toErrorResponse(error);
  }
}
