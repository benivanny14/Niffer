import { connection, type NextRequest } from "next/server";
import { json, fail, readBody, toErrorResponse } from "@/lib/server/http";
import { findProduct, listProducts } from "@/lib/server/catalog";
import { isAdminRequest } from "@/lib/server/auth";
import { getDb, nowIso } from "@/lib/server/db";
import { optimizeCloudinaryUrl } from "@/lib/server/cloudinary";
import { setStockValue } from "@/lib/server/orders";

/** Bidhaa moja kwa slug. */
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ slug: string }> },
) {
  await connection();
  try {
    const { slug } = await ctx.params;
    const product = await findProduct(slug);
    if (!product) return fail("Bidhaa haipatikani.", 404);
    return json({ ok: true, product });
  } catch (error) {
    return toErrorResponse(error);
  }
}

/** Hariri bidhaa (admin pekee) — bei, jina, maelezo, picha, stoo n.k. */
export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ slug: string }> },
) {
  await connection();
  try {
    if (!(await isAdminRequest())) {
      return fail("Ingia kama admin kuhariri bidhaa.", 401);
    }
    const { slug } = await ctx.params;
    const db = getDb();
    if (!await db.prepare("SELECT 1 FROM products WHERE slug = ?").get(slug)) {
      return fail("Bidhaa haipatikani.", 404);
    }

    const body = await readBody<Record<string, unknown>>(req);
    if (!body) return fail("Taarifa za mabadiliko hazisahihi.");

    const cols: string[] = [];
    const vals: (string | number | null)[] = [];
    const push = (col: string, val: string | number | null) => {
      cols.push(`${col} = ?`);
      vals.push(val);
    };

    if (typeof body.name === "string" && body.name.trim().length >= 2) {
      push("name", body.name.trim());
    }
    if (typeof body.priceTsh === "number" && body.priceTsh >= 0) {
      push("price_tsh", Math.round(body.priceTsh));
    }
    if (body.compareAtTsh === null) push("compare_at_tsh", null);
    else if (typeof body.compareAtTsh === "number") {
      push("compare_at_tsh", Math.round(body.compareAtTsh));
    }
    if (typeof body.shortDescription === "string") {
      push("short_description", body.shortDescription.trim());
    }
    if (typeof body.description === "string") {
      push("description", body.description.trim());
    }
    if (typeof body.ingredients === "string") {
      push("ingredients", body.ingredients.trim());
    }
    if (typeof body.howToUse === "string") push("how_to_use", body.howToUse.trim());
    if (typeof body.category === "string" && body.category.trim()) {
      push("category", body.category.trim());
    }
    if (Array.isArray(body.badges)) push("badges", JSON.stringify(body.badges));
    if (typeof body.image === "string" && body.image.trim()) {
      push("image", optimizeCloudinaryUrl(body.image.trim()));
    }
    if (typeof body.imageAlt === "string") push("image_alt", body.imageAlt.trim());
    if (typeof body.region === "string") push("region", body.region.trim());
    if (typeof body.city === "string") push("city", body.city.trim());

    if (cols.length === 0 && typeof body.stock !== "number") {
      return fail("Hakuna mabadiliko yaliyotumwa.");
    }

    if (cols.length > 0) {
      push("updated_at", nowIso());
      await db.prepare(`UPDATE products SET ${cols.join(", ")} WHERE slug = ?`).run(
        ...vals,
        slug,
      );
    }
    if (typeof body.stock === "number") await setStockValue(slug, body.stock);

    return json({ ok: true, product: await findProduct(slug) });
  } catch (error) {
    return toErrorResponse(error);
  }
}

/** Futa bidhaa (admin pekee) — pamoja na stoo na hakiki zake. */
export async function DELETE(
  _req: NextRequest,
  ctx: { params: Promise<{ slug: string }> },
) {
  await connection();
  try {
    if (!(await isAdminRequest())) {
      return fail("Ingia kama admin kufuta bidhaa.", 401);
    }
    const { slug } = await ctx.params;
    const db = getDb();
    const exists = await db.prepare("SELECT 1 FROM products WHERE slug = ?").get(slug);
    if (!exists) return fail("Bidhaa haipatikani.", 404);

    await db.transaction(async (tx) => {
      await tx.prepare("DELETE FROM products WHERE slug = ?").run(slug);
      await tx.prepare("DELETE FROM stock WHERE slug = ?").run(slug);
      await tx.prepare("DELETE FROM reviews WHERE product_slug = ?").run(slug);
    });

    return json({ ok: true, count: (await listProducts()).length });
  } catch (error) {
    return toErrorResponse(error);
  }
}
