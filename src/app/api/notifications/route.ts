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
      return fail("Ingia kama admin.", 401);
    }
    return json({
      ok: true,
      notifications: listNotifications(100),
      unread: countUnreadNotifications(),
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}

/** Weka arifa kuwa imesomwa (admin). */
export async function PATCH(req: NextRequest) {
  try {
    if (!(await isAdminRequest())) {
      return fail("Ingia kama admin.", 401);
    }
    const body = (await req.json().catch(() => null)) as {
      id?: string;
    } | null;
    if (!body?.id) return fail("Arifa haipatikani.");
    const updated = markNotificationRead(body.id);
    return json({ ok: true, updated });
  } catch (error) {
    return toErrorResponse(error);
  }
}
