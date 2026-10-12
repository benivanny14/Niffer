import { type NextRequest } from "next/server";
import { json, fail, readBody, toErrorResponse } from "@/lib/server/http";
import { currentCustomer } from "@/lib/server/customers";
import { getDb, nowIso } from "@/lib/server/db";

/** Orodha ya bidhaa nilizopenda (mteja aliyeingia). */
export async function GET() {
  try {
    const customer = await currentCustomer();
    if (!customer) return fail("Ingia kwenye akaunti yako.", 401);

    const rows = getDb()
      .prepare(
        "SELECT slug FROM wishlists WHERE customer_id = ? ORDER BY created_at DESC",
      )
      .all(customer.id) as { slug: string }[];
    return json({ ok: true, slugs: rows.map((r) => r.slug) });
  } catch (error) {
    return toErrorResponse(error);
  }
}

/** Weka upendwa wote (merge kutoka localStorage baada ya kuingia). */
export async function PUT(req: NextRequest) {
  try {
    const customer = await currentCustomer();
    if (!customer) return fail("Ingia kwenye akaunti yako.", 401);

    const body = await readBody<{ slugs?: string[] }>(req);
    if (!body) return fail("Taarifa hazisahihi.");
    const slugs = (Array.isArray(body.slugs) ? body.slugs : [])
      .map((s) => String(s).trim())
      .filter(Boolean)
      .slice(0, 200);

    const db = getDb();
    const upsert = db.prepare(
      `INSERT OR IGNORE INTO wishlists (customer_id, slug, created_at)
       VALUES (?, ?, ?)`,
    );
    for (const slug of slugs) upsert.run(customer.id, slug, nowIso());

    const rows = db
      .prepare(
        "SELECT slug FROM wishlists WHERE customer_id = ? ORDER BY created_at DESC",
      )
      .all(customer.id) as { slug: string }[];
    return json({ ok: true, slugs: rows.map((r) => r.slug) });
  } catch (error) {
    return toErrorResponse(error);
  }
}

/** Ondoa bidhaa moja kutoka upendwa. */
export async function DELETE(req: NextRequest) {
  try {
    const customer = await currentCustomer();
    if (!customer) return fail("Ingia kwenye akaunti yako.", 401);

    const body = await readBody<{ slug?: string }>(req);
    if (!body?.slug) return fail("Weka bidhaa ya kuondoa.");
    getDb()
      .prepare(
        "DELETE FROM wishlists WHERE customer_id = ? AND slug = ?",
      )
      .run(customer.id, String(body.slug).trim());
    return json({ ok: true });
  } catch (error) {
    return toErrorResponse(error);
  }
}
