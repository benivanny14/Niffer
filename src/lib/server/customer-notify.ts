import { getDb, nowIso } from "@/lib/server/db";

/**
 * Arifa za mteja (customer notifications) — mteja huona ujumbe wa admin
 * kwenye akaunti yake. Kila arifa ina `order_code` (ikiwa ni ya oda) ili
 * mteja aweze kufuatilia oda yake kwa urahisi.
 */

export type CustomerNotification = {
  id: string;
  customerId: string | null;
  phone: string;
  orderCode: string;
  kind: string;
  title: string;
  body: string;
  status: "new" | "read";
  createdAt: string;
};

const makeId = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

/** Tuma arifa kwa mteja (kwa customerId au phone). */
export async function notifyCustomer(input: {
  customerId?: string;
  phone?: string;
  orderCode?: string;
  kind?: string;
  title: string;
  body?: string;
}): Promise<void> {
  try {
    await getDb()
      .prepare(
        `INSERT INTO customer_notifications
           (id, customer_id, phone, order_code, kind, title, body, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'new', ?)`,
      )
      .run(
        makeId("cnf"),
        input.customerId ?? null,
        (input.phone ?? "").slice(0, 20),
        (input.orderCode ?? "").slice(0, 20),
        input.kind ?? "info",
        input.title.slice(0, 200),
        (input.body ?? "").slice(0, 800),
        nowIso(),
      );
  } catch (error) {
    console.error("[notifyCustomer] imeshindikana kuhifadhi:", error);
  }
}

/** Arifa za mteja (mpya kwanza). */
export async function listCustomerNotifications(
  opts: { customerId?: string; phone?: string; limit?: number } = {},
): Promise<CustomerNotification[]> {
  const limit = Math.min(Math.max(opts.limit ?? 50, 1), 200);
  const clauses: string[] = [];
  const params: (string | number)[] = [];
  if (opts.customerId) {
    clauses.push("customer_id = ?");
    params.push(opts.customerId);
  }
  if (opts.phone) {
    clauses.push("phone = ?");
    params.push(opts.phone);
  }
  if (clauses.length === 0) return [];
  const where = clauses.join(" OR ");
  const rows = await getDb()
    .prepare(
      `SELECT * FROM customer_notifications WHERE ${where}
       ORDER BY created_at DESC LIMIT ?`,
    )
    .all(...params, limit) as unknown as {
    id: string;
    customer_id: string | null;
    phone: string;
    order_code: string;
    kind: string;
    title: string;
    body: string;
    status: string;
    created_at: string;
  }[];
  return rows.map((r) => ({
    id: r.id,
    customerId: r.customer_id,
    phone: r.phone,
    orderCode: r.order_code,
    kind: r.kind,
    title: r.title,
    body: r.body,
    status: r.status as CustomerNotification["status"],
    createdAt: r.created_at,
  }));
}

/** Idadi ya arifa ambazo bado hazijasomwa. */
export async function countUnreadCustomerNotifications(
  customerId: string,
  phone?: string,
): Promise<number> {
  const clauses = ["status = 'new'"];
  const params: (string | number)[] = [];
  if (customerId) {
    clauses.push("customer_id = ?");
    params.push(customerId);
  }
  if (phone) {
    clauses.push("phone = ?");
    params.push(phone);
  }
  if (params.length === 0) return 0;
  const row = await getDb()
    .prepare(
      `SELECT COUNT(*) AS n FROM customer_notifications WHERE ${clauses.join(" OR ")}`,
    )
    .get(...params) as { n?: number } | undefined;
  return Number(row?.n ?? 0);
}

/** Enter arifa kuwa imesomwa. */
export async function markCustomerNotificationRead(id: string): Promise<boolean> {
  const result = await getDb()
    .prepare("UPDATE customer_notifications SET status = 'read' WHERE id = ?")
    .run(id);
  return Number((await result).changes) > 0;
}

/** Enter zote kuwa zimesomwa (mteja alipoingia). */
export async function markAllCustomerNotificationsRead(
  customerId: string,
  phone?: string,
): Promise<number> {
  const clauses = ["status = 'new'"];
  const params: (string | number)[] = [];
  if (customerId) {
    clauses.push("customer_id = ?");
    params.push(customerId);
  }
  if (phone) {
    clauses.push("phone = ?");
    params.push(phone);
  }
  if (params.length === 0) return 0;
  const result = await getDb()
    .prepare(
      `UPDATE customer_notifications SET status = 'read' WHERE ${clauses.join(" OR ")}`,
    )
    .run(...params);
  return Number((await result).changes);
}
