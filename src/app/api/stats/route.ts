import { connection } from "next/server";
import { json, fail, toErrorResponse } from "@/lib/server/http";
import { isAdminRequest } from "@/lib/server/auth";
import { orderStats, getStockMap } from "@/lib/server/orders";
import {
  countSubscribers,
  countUnreadMessages,
  listMessages,
  listGiftCards,
  countPendingReviews,
} from "@/lib/server/leads";
import { countUnreadNotifications } from "@/lib/server/notify";
import { catalogStats } from "@/lib/server/catalog";
import { getDb } from "@/lib/server/db";

/** Takwimu za dashibodi ya admin. */
export async function GET() {
  await connection();
  try {
    if (!(await isAdminRequest())) {
      return fail("Sign in as an administrator to view analytics.", 401);
    }

    const stock = await getStockMap();
    const lowStock = Object.entries(stock)
      .filter(([, qty]) => qty <= 10)
      .map(([slug, qty]) => ({ slug, qty }))
      .sort((a, b) => a.qty - b.qty);

    // Bidhaa zilizouzwa (jumla ya qty kwenye oda zote).
    const soldBySlug: Record<string, number> = {};
    try {
      const rows = await getDb()
        .prepare(
          `SELECT lines FROM orders WHERE demo = 0`,
        )
        .all() as { lines: string }[];
      for (const row of rows) {
        try {
          const lines = JSON.parse(row.lines) as { slug: string; qty: number }[];
          for (const line of lines) {
            soldBySlug[line.slug] = (soldBySlug[line.slug] ?? 0) + line.qty;
          }
        } catch {
          /* lines si JSON sahihi */
        }
      }
    } catch {
      /* DB haijasoma */
    }

    return json({
      ok: true,
      orders: await orderStats(),
      catalog: await catalogStats(),
      messages: {
        total: (await listMessages(500)).length,
        unread: await countUnreadMessages(),
      },
      subscribers: await countSubscribers(),
      giftCards: (await listGiftCards(200)).length,
      lowStock,
      soldBySlug,
      reviews: { pending: await countPendingReviews() },
      notifications: { unread: await countUnreadNotifications() },
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
