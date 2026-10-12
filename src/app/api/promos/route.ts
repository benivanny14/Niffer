import { type NextRequest } from "next/server";
import { json, fail, readBody, toErrorResponse } from "@/lib/server/http";
import { listPromoRules, createPromoRule } from "@/lib/server/promo";
import { isAdminRequest } from "@/lib/server/auth";

/** Promo zote (admin). */
export async function GET() {
  try {
    if (!(await isAdminRequest())) {
      return fail("Ingia kama admin.", 401);
    }
    return json({ ok: true, promos: listPromoRules() });
  } catch (error) {
    return toErrorResponse(error);
  }
}

/** Ongeza msimbo mpya (admin). */
export async function POST(req: NextRequest) {
  try {
    if (!(await isAdminRequest())) {
      return fail("Ingia kama admin.", 401);
    }
    const body = await readBody<{
      code?: string;
      label?: string;
      percentOff?: number;
      freeShipping?: boolean;
      minSubtotalTsh?: number;
    }>(req);
    if (!body) return fail("Taarifa za msimbo hazisahihi.");
    const promo = createPromoRule(body);
    return json({ ok: true, promo }, 201);
  } catch (error) {
    return toErrorResponse(error);
  }
}
