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
    if (!customer) return fail("Sign in to your account.", 401);
    return json({
      ok: true,
      notifications: await listCustomerNotifications({
        customerId: customer.id,
        phone: customer.phone,
        limit: 50,
      }),
      unread: await countUnreadCustomerNotifications(customer.id, customer.phone),
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}

/**
 * Enter arifa kuwa imesomwa.
 * Body: `{ id }` — oda moja; au `{ all: true }` — zote.
 */
export async function PATCH(req: NextRequest) {
  try {
    const customer = await currentCustomer();
    if (!customer) return fail("Sign in to your account.", 401);

    const body = await readBody<{ id?: string; all?: boolean }>(req);
    if (body?.all) {
      const n = await markAllCustomerNotificationsRead(customer.id, customer.phone);
      return json({ ok: true, updated: n });
    }
if (!body?.id) return fail("Select a notification.");
    const updated = await markCustomerNotificationRead(body.id);
    return json({ ok: true, updated });
  } catch (error) {
    return toErrorResponse(error);
  }
}
