import { connection, type NextRequest } from "next/server";
import { json, fail, readBody, toErrorResponse } from "@/lib/server/http";
import { createPasswordReset } from "@/lib/server/customers";
import { sendCustomerEmail, notifyAdmin } from "@/lib/server/notify";
import { rateLimit, rateLimitMessage } from "@/lib/server/rate-limit";

const GENERIC =
  "Ikiwa akaunti ipo na ina barua pepe, utapokea msimbo wa kubadili nywila. Angalia barua pepe yako.";

/**
 * Ombi la kusahau nywila — jibu ni daima la jumla (usambaze taarifa
 * za akaunti). Msimbo hutumwa kwa barua pepe (Resend, ikiwa imewekwa);
 * akaunti bila barua pepe huhitaji msaada wa simu kwa admin.
 */
export async function POST(req: NextRequest) {
  await connection();
  try {
    const limited = rateLimit(req, "customer-forgot", 3, 300);
    if (!limited.ok) {
      return fail(rateLimitMessage(limited.retryAfterSec), 429);
    }
    const body = await readBody<{ phone?: string }>(req);
    if (!body?.phone?.trim()) return fail("Weka namba yako ya simu.");

    const result = await createPasswordReset(body.phone);
    if (result?.customer.email) {
      const sent = await sendCustomerEmail(
        result.customer.email,
        "[Niffer] Msimbo wa kubadili nywila",
        `Habari ${result.customer.name},\n\n` +
          `Msimbo wako wa kubadili nywila ni: ${result.code}\n\n` +
          `Msimbo huu unaisha baada ya dakika 15. Kama huomba msimbo huu, ` +
          `puuza ujumbe huu.\n\nNiffer Cosmetics`,
      );
      if (!sent) {
        // Barua pepe haijaweza kutumwa — arifu admin ili amuite mteja.
        await notifyAdmin({
          kind: "info",
          title: "Ombi la kubadili nywila",
          body: `${result.customer.name} (${result.customer.phone}) anaomba kubadili nywila. Barua pepe haijatumwa — piga simu kumsaidia. Msimbo: ${result.code}`,
          ref: "/admin",
        });
      }
    }
    return json({ ok: true, message: GENERIC });
  } catch (error) {
    return toErrorResponse(error);
  }
}
