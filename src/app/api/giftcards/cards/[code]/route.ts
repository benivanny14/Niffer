import { type NextRequest } from "next/server";
import { fail, json } from "@/lib/server/http";
import { isAdminRequest } from "@/lib/server/auth";
import { reviewLegacyGiftCard } from "@/lib/server/leads";

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ code: string }> }) {
  if (!(await isAdminRequest())) return fail("Sign in as an administrator.", 401);
  const body = await req.json().catch(() => null) as { action?: string } | null;
  if (body?.action !== "verify_payment" && body?.action !== "approve") return fail("Choose a valid review action.");
  const { code } = await ctx.params;
  const changed = await reviewLegacyGiftCard(code, body.action);
  if (!changed) return fail("The gift card cannot be reviewed in its current state.", 409);
  return json({ ok: true });
}
