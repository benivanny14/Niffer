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

/** Takwimu za dashibodi ya admin. */
export async function GET() {
  await connection();
  try {
    if (!(await isAdminRequest())) {
      return fail("Ingia kama admin kuona takwimu.", 401);
    }

    const stock = getStockMap();
    const lowStock = Object.entries(stock)
      .filter(([, qty]) => qty <= 10)
      .map(([slug, qty]) => ({ slug, qty }))
      .sort((a, b) => a.qty - b.qty);

    return json({
      ok: true,
      orders: orderStats(),
      catalog: catalogStats(),
      messages: {
        total: listMessages(500).length,
        unread: countUnreadMessages(),
      },
      subscribers: countSubscribers(),
      giftCards: listGiftCards(200).length,
      lowStock,
      reviews: { pending: countPendingReviews() },
      notifications: { unread: countUnreadNotifications() },
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
