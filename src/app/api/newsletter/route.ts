import { connection, type NextRequest } from "next/server";
import { json, fail, readBody, toErrorResponse } from "@/lib/server/http";
import { subscribeNewsletter, countSubscribers } from "@/lib/server/leads";
import { isAdminRequest } from "@/lib/server/auth";

/** Orodha ya waasisi wa jarida (admin). */
export async function GET() {
  await connection();
  try {
    if (!(await isAdminRequest())) {
      return fail("Ingia kama admin.", 401);
    }
    return json({ ok: true, total: countSubscribers() });
  } catch (error) {
    return toErrorResponse(error);
  }
}

/** Jiunge na jarida. */
export async function POST(req: NextRequest) {
  try {
    const body = await readBody<{ email?: string; source?: string }>(req);
    if (!body?.email) return fail("Weka anwani ya barua pepe.");
    const result = subscribeNewsletter(
      String(body.email),
      String(body.source ?? "site"),
    );
    return json(
      {
        ok: true,
        ...result,
        message: result.created
          ? "Asante! Umejiunga na jarida la Niffer."
          : "Barua pepe hii tayari iko kwenye jarida.",
      },
      result.created ? 201 : 200,
    );
  } catch (error) {
    return toErrorResponse(error);
  }
}
