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
 * All products (kutoka DB + stoo halisi).
 * Inaunga mkono vichujio kwenye URL: ?kategoria=&result=&mkoa=&mji=
 * &min=&max=&q=&sort= (mtindo wa jiji.com).
 */
export async function GET(req: NextRequest) {
  await connection();
  const params = req.nextUrl.searchParams;
  const sortParam = params.get("sort");
  const filters: ProductFilters = {
    category: params.get("kategoria"),
    feature: params.get("result"),
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
      return fail("Sign in as an administrator to add products.", 401);
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
    if (!body) return fail("The product details are invalid.");

    const name = (body.name ?? "").trim();
    const priceTsh = Math.round(Number(body.priceTsh));
    if (name.length < 2) return fail("A product name is required.");
    if (!Number.isSafeInteger(priceTsh) || priceTsh <= 0 || priceTsh > 100_000_000) {
      return fail("Invalid price.");
    }
    const initialStock = Number(body.stock ?? 10);
    if (!Number.isSafeInteger(initialStock) || initialStock < 0 || initialStock > 1_000_000) {
      return fail("Stock must be a whole number from 0 to 1,000,000.");
    }

    const slug = slugify(body.slug || name);
    if (!slug) return fail("Invalid product slug.");

    const category = (body.category || "skincare").trim();
    if (!await getDb().prepare("SELECT 1 FROM categories WHERE slug = ?").get(category)) {
      return fail("Invalid category.");
    }

    const db = getDb();
    const exists = await db.prepare("SELECT 1 FROM products WHERE slug = ?").get(slug);
    if (exists) return fail("A product with this slug already exists.", 409);

    const now = nowIso();
    await db.transaction(async (tx) => {
    await tx.prepare(
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
      initialStock,
      JSON.stringify(Array.isArray(body.badges) ? body.badges : []),
      optimizeCloudinaryUrl(body.image?.trim() || ""),
      (body.imageAlt ?? name).trim(),
      (body.region ?? "").trim(),
      (body.city ?? "").trim(),
      now,
    );

    const stock = initialStock;
    await tx.prepare(
      "INSERT INTO stock (slug, qty, updated_at) VALUES (?, ?, ?) ON CONFLICT (slug) DO NOTHING",
    ).run(slug, stock, now);
    if (stock > 0) {
      await tx.prepare(
        "INSERT INTO stock_movements (slug, delta, quantity, reason, created_at) VALUES (?, ?, ?, 'initial_stock', ?)",
      ).run(slug, stock, stock, now);
    }
    });

    const product = (await listProducts()).find((p) => p.slug === slug);
    return json({ ok: true, product }, 201);
  } catch (error) {
    return toErrorResponse(error);
  }
}
