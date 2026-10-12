import fs from "node:fs";
import path from "node:path";
import { connection, type NextRequest } from "next/server";
import { json, fail, toErrorResponse } from "@/lib/server/http";
import { isAdminRequest } from "@/lib/server/auth";
import { getDb, nowIso } from "@/lib/server/db";
import { findProduct } from "@/lib/server/catalog";

const MAX_SIZE = 3 * 1024 * 1024; // 3MB

const EXT_BY_MIME: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
  "image/svg+xml": "svg",
};

/**
 * Pakia picha ya bidhaa (admin) — faili huhifadhiwa `public/uploads/`
 * na URL yake huandikwa kwenye safu `image` ya bidhaa.
 */
export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ slug: string }> },
) {
  await connection();
  try {
    if (!(await isAdminRequest())) {
      return fail("Ingia kama admin kupakia picha.", 401);
    }
    const { slug } = await ctx.params;
    if (!/^[a-z0-9-]{1,60}$/.test(slug)) return fail("Slug si sahihi.");

    const db = getDb();
    if (!db.prepare("SELECT 1 FROM products WHERE slug = ?").get(slug)) {
      return fail("Bidhaa haipatikani.", 404);
    }

    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return fail("Hakuna faili limetumwa.");
    if (!file.type.startsWith("image/")) {
      return fail("Faili si picha (tumia PNG, JPG, Webp au SVG).");
    }
    if (file.size > MAX_SIZE) return fail("Picha ni kubwa zaidi ya 3MB.");

    const ext = EXT_BY_MIME[file.type] ?? "png";
    const dir = path.join(process.cwd(), "public", "uploads");
    fs.mkdirSync(dir, { recursive: true });

    const filename = `${slug}-${Date.now()}.${ext}`;
    fs.writeFileSync(
      path.join(dir, filename),
      Buffer.from(await file.arrayBuffer()),
    );

    const image = `/uploads/${filename}`;
    db.prepare("UPDATE products SET image = ?, updated_at = ? WHERE slug = ?").run(
      image,
      nowIso(),
      slug,
    );

    return json({ ok: true, image, product: findProduct(slug) });
  } catch (error) {
    return toErrorResponse(error);
  }
}
