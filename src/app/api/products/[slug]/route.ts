import { connection } from "next/server";
import { json, fail, toErrorResponse } from "@/lib/server/http";
import { findProduct } from "@/lib/server/catalog";

/** Bidhaa moja kwa slug. */
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ slug: string }> },
) {
  await connection();
  try {
    const { slug } = await ctx.params;
    const product = findProduct(slug);
    if (!product) return fail("Bidhaa haipatikani.", 404);
    return json({ ok: true, product });
  } catch (error) {
    return toErrorResponse(error);
  }
}
