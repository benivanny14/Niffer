import { connection } from "next/server";
import { json } from "@/lib/server/http";
import { getDb } from "@/lib/server/db";

/** Minimal health check: expose availability only, not internal inventory metrics. */
export async function GET() {
  await connection();
  try {
    // A lightweight query confirms database connectivity without disclosing
    // business data such as catalog size to anonymous callers.
    await getDb().prepare("SELECT 1").get();

    return json({
      ok: true,
      service: "available",
    });
  } catch (error) {
    console.error("[health] PostgreSQL check failed:", error);
    return json({
      ok: false,
      service: "unavailable",
    }, 503);
  }
}
