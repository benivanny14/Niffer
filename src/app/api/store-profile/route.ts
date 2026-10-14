import { connection, type NextRequest } from "next/server";
import { fail, json, toErrorResponse } from "@/lib/server/http";
import { isAdminRequest } from "@/lib/server/auth";
import { getDb, nowIso } from "@/lib/server/db";
import { uploadAdminProfileImage } from "@/lib/server/cloudinary";

// Keep comfortably below Vercel Functions' 4.5 MB total request payload limit.
const MAX_SIZE = 4 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
const PROFILE_KEY = "store_admin_profile_image";

/** Public store identity image; the URL is shared by every visitor. */
export async function GET() {
  await connection();
  try {
    const row = await getDb().prepare("SELECT value FROM meta WHERE key = ?").get(PROFILE_KEY) as
      | { value: string }
      | undefined;
    return json({ ok: true, image: row?.value ?? "" });
  } catch (error) {
    return toErrorResponse(error);
  }
}

/** Only an authenticated admin may change the public profile image. */
export async function POST(req: NextRequest) {
  await connection();
  try {
    if (!(await isAdminRequest())) return fail("Ingia kama admin kubadilisha picha ya duka.", 401);

    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return fail("Chagua picha kwanza.");
    if (!ALLOWED_TYPES.has(file.type)) {
      return fail("Tumia picha ya JPG, PNG, WebP au AVIF.");
    }
    if (file.size > MAX_SIZE) return fail("Picha isizidi 4MB.");

    const image = await uploadAdminProfileImage(file);
    await getDb().prepare(
      `INSERT INTO meta (key, value) VALUES (?, ?)
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
    ).run(PROFILE_KEY, image);

    return json({ ok: true, image, updatedAt: nowIso() });
  } catch (error) {
    return toErrorResponse(error);
  }
}
