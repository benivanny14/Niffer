import { connection, type NextRequest } from "next/server";
import { json, fail, toErrorResponse } from "@/lib/server/http";
import { isAdminRequest } from "@/lib/server/auth";
import { getDb, nowIso } from "@/lib/server/db";
import { findProduct } from "@/lib/server/catalog";
import { uploadProductImage } from "@/lib/server/cloudinary";

const MAX_SIZE = 3 * 1024 * 1024; // 3MB

const EXT_BY_MIME: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
};

// SVG haziruhusiwi kupakiwa — zinaweza kubeba JS/XSS.
// (Picha za SVG za katalogi bado zinaonyeshwa; kizuizi hiki ni kwa upakuaji.)

/** Upload product images to Cloudinary and save the delivery URL in Neon. */
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
    if (!await db.prepare("SELECT 1 FROM products WHERE slug = ?").get(slug)) {
      return fail("Bidhaa haipatikani.", 404);
    }

    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return fail("Hakuna faili limetumwa.");
    if (!file.type.startsWith("image/")) {
      return fail("Faili si picha (tumia PNG, JPG, Webp au AVIF).");
    }
    if (file.type === "image/svg+xml") {
      return fail("SVG hairuhusiwi (hatari ya usalama). Tumia PNG, JPG, Webp au AVIF.");
    }
    if (file.size > MAX_SIZE) return fail("Picha ni kubwa zaidi ya 3MB.");

    if (!EXT_BY_MIME[file.type]) {
      return fail("Aina ya picha haitumiki. Tumia PNG, JPG, Webp au AVIF.");
    }
    const image = await uploadProductImage(file, slug);
    await db.prepare("UPDATE products SET image = ?, updated_at = ? WHERE slug = ?").run(
      image,
      nowIso(),
      slug,
    );

    return json({ ok: true, image, product: await findProduct(slug) });
  } catch (error) {
    return toErrorResponse(error);
  }
}
