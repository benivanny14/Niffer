import { connection, type NextRequest } from "next/server";
import { json, fail, readBody, intParam, toErrorResponse } from "@/lib/server/http";
import { addMessage, listMessages, countUnreadMessages } from "@/lib/server/leads";
import { isAdminRequest } from "@/lib/server/auth";

/** Ujumbe wote wa fomu (admin pekee). */
export async function GET(req: NextRequest) {
  await connection();
  try {
    if (!(await isAdminRequest())) {
      return fail("Ingia kama admin kuona ujumbe.", 401);
    }
    const limit = intParam(req.nextUrl.searchParams.get("limit"), 100, 500);
    return json({
      ok: true,
      messages: listMessages(limit),
      unread: countUnreadMessages(),
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}

/** Hifadhi ujumbe wa fomu (wasiliana / jumla). */
export async function POST(req: NextRequest) {
  try {
    const body = await readBody<{
      kind?: "contact" | "wholesale" | "giftcard";
      name?: string;
      phone?: string;
      email?: string;
      body?: Record<string, string>;
    }>(req);
    if (!body) return fail("Ujumbe haujajazwa vizuri.");
    const message = addMessage(body);
    return json({ ok: true, message }, 201);
  } catch (error) {
    return toErrorResponse(error);
  }
}
