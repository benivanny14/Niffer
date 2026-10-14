import { connection } from "next/server";
import { fail, json, toErrorResponse } from "@/lib/server/http";
import { isAdminRequest } from "@/lib/server/auth";
import { getDb, nowIso } from "@/lib/server/db";
import { getAdminProfileImageUrl, signAdminProfileUpload } from "@/lib/server/cloudinary";

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

/** Sign a direct-to-Cloudinary upload; only admins can obtain a signature. */
export async function POST() {
  await connection();
  try {
    if (!(await isAdminRequest())) return fail("Sign in as an administrator to change the store image.", 401);
    return json({ ok: true, upload: signAdminProfileUpload() });
  } catch (error) {
    return toErrorResponse(error);
  }
}

/** Verify the fixed Cloudinary asset exists, then publish its URL in Neon. */
export async function PUT() {
  await connection();
  try {
    if (!(await isAdminRequest())) return fail("Sign in as an administrator to change the store image.", 401);
    const image = await getAdminProfileImageUrl();
    await getDb().prepare(
      `INSERT INTO meta (key, value) VALUES (?, ?)
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
    ).run(PROFILE_KEY, image);

    return json({ ok: true, image, updatedAt: nowIso() });
  } catch (error) {
    return toErrorResponse(error);
  }
}
