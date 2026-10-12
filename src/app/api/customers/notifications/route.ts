import { connection, type NextRequest } from "next/server";
import { json, fail, readBody, toErrorResponse } from "@/lib/server/http";
import { currentCustomer } from "@/lib/server/customers";
import {
  listCustomerNotifications,
  countUnreadCustomerNotifications,
  markCustomerNotificationRead,
  markAllCustomerNotificationsRead,
} from "@/lib/server/customer-notify";

/** Arifa za mteja aliyeingia. */
export async function GET() {
  await connection();
  try {
    const customer = await currentCustomer();
    if (!customer) return fail("Ingia kwenye akaunti yako.", 401);
    return json({
      ok: true,
      notifications: listCustomerNotifications({
        customerId: customer.id,
        phone: customer.phone,
        limit: 50,
      }),
      unread: countUnreadCustomerNotifications(customer.id, customer.phone),
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}

/**
 * Weka arifa kuwa imesomwa.
 * Body: `{ id }` — oda moja; au `{ all: true }` — zote.
 */
export async function PATCH(req: NextRequest) {
  try {
    const customer = await currentCustomer();
    if (!customer) return fail("Ingia kwenye akaunti yako.", 401);

    const body = await readBody<{ id?: string; all?: boolean }>(req);
    if (body?.all) {
      const n = markAllCustomerNotificationsRead(customer.id, customer.phone);
      return json({ ok: true, updated: n });
    }
    if (!body?.id) return fail("Arifa haijachaguliwa.");
    const updated = markCustomerNotificationRead(body.id);
    return json({ ok: true, updated });
  } catch (error) {
    return toErrorResponse(error);
  }
}
