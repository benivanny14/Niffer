import { getDb, nowIso } from "@/lib/server/db";

/**
 * Arifa ndani ya dashibodi (admin) + hook nyepesi ya barua pepe.
 *
 * Email address: ikiwa `RESEND_API_KEY` imewekwa, tunatuma barua kwa
 * `ADMIN_EMAIL` kupitia Resend API (bila dependency ya ziada). Ikiwa
 * hakuna kitu kimejazwa, arifa hubaki kwenye DB pekee — hakuna hitilafu.
 */

export type NotificationKind = "oda" | "hakiki" | "rfq" | "malipo" | "info";

export type Notification = {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  ref: string;
  status: "new" | "read";
  createdAt: string;
};

const id = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

/** Save arifa (dashboard) — hairudishi hitilafu kwa msikilizaji. */
export async function notify(input: {
  kind?: NotificationKind;
  title: string;
  body?: string;
  ref?: string;
}): Promise<void> {
  try {
    await getDb()
      .prepare(
        `INSERT INTO notifications (id, kind, title, body, ref, status, created_at)
         VALUES (?, ?, ?, ?, ?, 'new', ?)`,
      )
      .run(
        id("ntf"),
        input.kind ?? "info",
        input.title.slice(0, 200),
        (input.body ?? "").slice(0, 500),
        (input.ref ?? "").slice(0, 60),
        nowIso(),
      );
  } catch (error) {
    console.error("[notify] imeshindikana kuhifadhi:", error);
  }
}

export async function listNotifications(limit = 100): Promise<Notification[]> {
  const rows = await getDb()
    .prepare("SELECT * FROM notifications ORDER BY created_at DESC LIMIT ?")
    .all(limit) as unknown as {
    id: string;
    kind: string;
    title: string;
    body: string;
    ref: string;
    status: string;
    created_at: string;
  }[];
  return rows.map((r) => ({
    id: r.id,
    kind: r.kind as NotificationKind,
    title: r.title,
    body: r.body,
    ref: r.ref,
    status: r.status as Notification["status"],
    createdAt: r.created_at,
  }));
}

export async function countUnreadNotifications(): Promise<number> {
  const row = await getDb()
    .prepare("SELECT COUNT(*) AS n FROM notifications WHERE status = 'new'")
    .get() as { n?: number } | undefined;
  return Number(row?.n ?? 0);
}

/** Enter arifa kuwa imesomwa (admin). */
export async function markNotificationRead(notificationId: string): Promise<boolean> {
  const result = await getDb()
    .prepare("UPDATE notifications SET status = 'read' WHERE id = ?")
    .run(notificationId);
  return (await result).changes > 0;
}

/* ============ Email address (Resend — nyepesi, hiari) ============ */

async function sendAdminEmail(title: string, body: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const to = process.env.ADMIN_EMAIL?.trim();
  if (!apiKey || !to) return;

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM?.trim() || "Niffer <onboarding@resend.dev>",
        to: [to],
        subject: `[Niffer] ${title}`,
        text: body,
      }),
    });
  } catch (error) {
    // Email address si hitilafu ya kuzuia — DB ndio mwanzo wa ukweli.
    console.error("[notify] barua pepe haijatumwa:", error);
  }
}

/** Tuma arifa: DB + (nyepesi) barua pepe kwa admin. */
export async function notifyAdmin(input: {
  kind?: NotificationKind;
  title: string;
  body?: string;
  ref?: string;
}): Promise<void> {
  await notify(input);
  void sendAdminEmail(input.title, [input.body, input.ref ? `Ref: ${input.ref}` : ""].filter(Boolean).join("\n"));
}

/** Tuma barua pepe kwa mteja (Resend — nyepesi; hakuna hitilafu kama hakuna API key). */
export async function sendCustomerEmail(
  to: string,
  subject: string,
  text: string,
): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey || !to.trim()) return false;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM?.trim() || "Niffer <onboarding@resend.dev>",
        to: [to],
        subject,
        text,
      }),
    });
    return res.ok;
  } catch (error) {
    console.error("[sendCustomerEmail] barua pepe haijatumwa:", error);
    return false;
  }
}
