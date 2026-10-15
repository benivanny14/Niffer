import { connection, type NextRequest } from "next/server";
import { json, fail, toErrorResponse, readBody } from "@/lib/server/http";
import { isAdminRequest } from "@/lib/server/auth";
import { getDb, nowIso } from "@/lib/server/db";
import { findProduct } from "@/lib/server/catalog";
import { getAdminProductImage, signAdminProductUpload } from "@/lib/server/cloudinary";
import { rateLimit, rateLimitMessage } from "@/lib/server/rate-limit";

const SLUG_PATTERN = /^[a-z0-9-]{1,60}$/;

async function authorize(req: NextRequest, slug: string) {
  if (!(await isAdminRequest())) return fail("Sign in as an administrator to upload images.", 401);
  const limited = await rateLimit(req, "admin-product-image", 15, 300);
  if (!limited.ok) return fail(rateLimitMessage(limited.retryAfterSec), 429);
  if (!SLUG_PATTERN.test(slug)) return fail("Invalid slug.");
  if (!await getDb().prepare("SELECT 1 FROM products WHERE slug = ?").get(slug)) {
    return fail("Product not found.", 404);
  }
  return null;
}

/** Sign a short-lived upload restricted to this product's Cloudinary asset. */
export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ slug: string }> },
) {
  await connection();
  try {
    const { slug } = await ctx.params;
    const denied = await authorize(req, slug);
    if (denied) return denied;
    return json({ ok: true, upload: signAdminProductUpload(slug) });
  } catch (error) {
    return toErrorResponse(error);
  }
}

/** Verify the Cloudinary asset server-side, then store its optimized URL in Neon. */
export async function PUT(
  req: NextRequest,
  ctx: { params: Promise<{ slug: string }> },
) {
  await connection();
  try {
    const { slug } = await ctx.params;
    const denied = await authorize(req, slug);
    if (denied) return denied;
    const body = await readBody<{ publicId?: string }>(req);
    if (body?.publicId !== slug) return fail("The uploaded image does not match this product.", 400);

    const { image } = await getAdminProductImage(slug);
    await getDb().prepare("UPDATE products SET image = ?, updated_at = ? WHERE slug = ?")
      .run(image, nowIso(), slug);
    return json({ ok: true, image, product: await findProduct(slug) });
  } catch (error) {
    return toErrorResponse(error);
  }
}
