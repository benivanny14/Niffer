import { connection, type NextRequest } from "next/server";
import { json, fail, readBody, toErrorResponse } from "@/lib/server/http";
import { issueGiftCard, listGiftCards } from "@/lib/server/leads";
import { isAdminRequest } from "@/lib/server/auth";

/** Kadi zote zilizotolewa (admin). */
export async function GET() {
  await connection();
  try {
    if (!(await isAdminRequest())) {
      return fail("Ingia kama admin.", 401);
    }
    return json({ ok: true, giftCards: listGiftCards() });
  } catch (error) {
    return toErrorResponse(error);
  }
}

/** Toa kadi ya zawadi mpya (msimbo wa pekee). */
export async function POST(req: NextRequest) {
  try {
    const body = await readBody<{
      amountTsh?: number;
      recipient?: string;
      message?: string;
    }>(req);
    if (!body) return fail("Taarifa za kadi hazisahihi.");
    const giftCard = issueGiftCard(body);
    return json({ ok: true, giftCard }, 201);
  } catch (error) {
    return toErrorResponse(error);
  }
}
