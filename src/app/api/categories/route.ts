import { connection, type NextRequest } from "next/server";
import { fail, json, readBody, toErrorResponse } from "@/lib/server/http";
import { isAdminRequest } from "@/lib/server/auth";
import { listCategories } from "@/lib/server/catalog";
import { getDb, nowIso } from "@/lib/server/db";

const swatches = ["bg-brand-100", "bg-gold-100", "bg-cream-200", "bg-brand-50"];

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

/** Category zinazopatikana kwenye duka. */
export async function GET() {
  await connection();
  try {
    return json({ ok: true, categories: await listCategories() });
  } catch (error) {
    return toErrorResponse(error);
  }
}

/** Admin anaweza kuongeza kategoria mpya na kuanza kuitumia kwa bidhaa. */
export async function POST(req: NextRequest) {
  await connection();
  try {
    if (!(await isAdminRequest())) return fail("Sign in as an administrator to add categories.", 401);

    const body = await readBody<{ name?: string; description?: string }>(req);
    if (!body) return fail("The category details are invalid.");

    const name = (body.name ?? "").trim();
    const description = (body.description ?? "").trim();
    const slug = slugify(name);
    if (name.length < 2 || name.length > 60 || !slug) {
      return fail("Category names must be 2 to 60 characters long.");
    }
if (description.length > 240) return fail("Category details must be 240 characters or fewer.");

    const db = getDb();
    if (await db.prepare("SELECT 1 FROM categories WHERE slug = ?").get(slug)) {
      return fail("A category with this name already exists.", 409);
    }
    const count = await db.prepare("SELECT COUNT(*) AS n FROM categories").get() as
      | { n?: number }
      | undefined;
    const swatch = swatches[Number(count?.n ?? 0) % swatches.length];
    await db.prepare(
      "INSERT INTO categories (slug, name, description, swatch, created_at) VALUES (?, ?, ?, ?, ?)",
    ).run(slug, name, description, swatch, nowIso());

    const category = (await listCategories()).find((item) => item.slug === slug);
    return json({ ok: true, category }, 201);
  } catch (error) {
    return toErrorResponse(error);
  }
}
