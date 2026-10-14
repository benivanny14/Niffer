import { connection, type NextRequest } from "next/server";
import { json, fail, toErrorResponse } from "@/lib/server/http";
import { isAdminRequest } from "@/lib/server/auth";
import {
  listNotifications,
  countUnreadNotifications,
  markNotificationRead,
} from "@/lib/server/notify";

/** Arifa zote (admin). */
export async function GET() {
  await connection();
  try {
    if (!(await isAdminRequest())) {
      return fail("Sign in as an administrator.", 401);
    }
    return json({
      ok: true,
      notifications: await listNotifications(100),
      unread: await countUnreadNotifications(),
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}

/** Enter arifa kuwa imesomwa (admin). */
export async function PATCH(req: NextRequest) {
  try {
    if (!(await isAdminRequest())) {
      return fail("Sign in as an administrator.", 401);
    }
    const body = (await req.json().catch(() => null)) as {
      id?: string;
    } | null;
    if (!body?.id) return fail("Notification not found.");
    const updated = await markNotificationRead(body.id);
    return json({ ok: true, updated });
  } catch (error) {
    return toErrorResponse(error);
  }
}
