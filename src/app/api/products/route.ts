import { connection, type NextRequest } from "next/server";
import { json, fail, readBody, toErrorResponse } from "@/lib/server/http";
import { listProducts, catalogStats } from "@/lib/server/catalog";
import { isAdminRequest } from "@/lib/server/auth";
import { getDb, nowIso } from "@/lib/server/db";
import { optimizeCloudinaryUrl } from "@/lib/server/cloudinary";
import {
  filterProducts,
  isSortKey,
  type ProductFilters,
} from "@/lib/product-filter";

/**
 * Bidhaa zote (kutoka DB + stoo halisi).
 * Inaunga mkono vichujio kwenye URL: ?kategoria=&kipengele=&mkoa=&mji=
 * &min=&max=&q=&sort= (mtindo wa jiji.com).
 */
export async function GET(req: NextRequest) {
  await connection();
  const params = req.nextUrl.searchParams;
  const sortParam = params.get("sort");
  const filters: ProductFilters = {
    category: params.get("kategoria"),
    feature: params.get("kipengele"),
    region: params.get("mkoa"),
    city: params.get("mji"),
    minPrice: params.get("min") ? Number(params.get("min")) : null,
    maxPrice: params.get("max") ? Number(params.get("max")) : null,
    query: params.get("q"),
    sort: isSortKey(sortParam) ? sortParam : "maarufu",
  };
  const all = await listProducts();
  const products = filterProducts(all, filters);
  return json({ ok: true, count: products.length, products, ...(await catalogStats(all)) });
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

/** Ongeza bidhaa mpya (admin pekee). */
export async function POST(req: NextRequest) {
  await connection();
  try {
    if (!(await isAdminRequest())) {
      return fail("Ingia kama admin kuongeza bidhaa.", 401);
    }
    const body = await readBody<{
      name?: string;
      slug?: string;
      category?: string;
      priceTsh?: number;
      compareAtTsh?: number | null;
      shortDescription?: string;
      description?: string;
      ingredients?: string;
      howToUse?: string;
      stock?: number;
      badges?: string[];
      image?: string;
      imageAlt?: string;
      region?: string;
      city?: string;
    }>(req);
    if (!body) return fail("Taarifa za bidhaa hazisahihi.");

    const name = (body.name ?? "").trim();
    const priceTsh = Math.round(Number(body.priceTsh));
    if (name.length < 2) return fail("Jina la bidhaa linahitajika.");
    if (!Number.isFinite(priceTsh) || priceTsh <= 0) {
      return fail("Bei si sahihi.");
    }

    const slug = slugify(body.slug || name);
    if (!slug) return fail("Slug ya bidhaa si sahihi.");

    const category = (body.category || "skincare").trim();
    if (!await getDb().prepare("SELECT 1 FROM categories WHERE slug = ?").get(category)) {
      return fail("Kategoria si sahihi.");
    }

    const db = getDb();
    const exists = await db.prepare("SELECT 1 FROM products WHERE slug = ?").get(slug);
    if (exists) return fail("Bidhaa kwa slug hii tayari ipo.", 409);

    const now = nowIso();
    await db.prepare(
      `INSERT INTO products (
         slug, id, name, category, price_tsh, compare_at_tsh,
         short_description, description, ingredients, how_to_use,
         rating, review_count, stock_base, badges, image, image_alt,
         region, city, updated_at
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, ?, ?, ?, ?, ?, ?, ?)`,
    ).run(
      slug,
      `p-${slug}`,
      name,
      category,
      priceTsh,
      typeof body.compareAtTsh === "number" ? Math.round(body.compareAtTsh) : null,
      (body.shortDescription ?? "").trim(),
      (body.description ?? "").trim(),
      (body.ingredients ?? "").trim(),
      (body.howToUse ?? "").trim(),
      Math.max(0, Math.floor(Number(body.stock ?? 10))),
      JSON.stringify(Array.isArray(body.badges) ? body.badges : []),
      optimizeCloudinaryUrl(body.image?.trim() || ""),
      (body.imageAlt ?? name).trim(),
      (body.region ?? "").trim(),
      (body.city ?? "").trim(),
      now,
    );

    const stock = Math.max(0, Math.floor(Number(body.stock ?? 10)));
    await db.prepare(
      "INSERT INTO stock (slug, qty, updated_at) VALUES (?, ?, ?) ON CONFLICT (slug) DO NOTHING",
    ).run(slug, stock, now);

    const product = (await listProducts()).find((p) => p.slug === slug);
    return json({ ok: true, product }, 201);
  } catch (error) {
    return toErrorResponse(error);
  }
}
