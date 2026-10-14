import { connection } from "next/server";
import { json } from "@/lib/server/http";
import { getDb } from "@/lib/server/db";

/** Afya ya mfumo: DB, muda na idadi ya bidhaa. */
export async function GET() {
  await connection();
  const row = await getDb()
    .prepare("SELECT COUNT(*) AS n FROM products")
    .get() as { n?: number } | undefined;

  return json({
    ok: true,
    service: "niffer-api",
    time: new Date().toISOString(),
    database: "postgresql",
    products: Number(row?.n ?? 0),
  });
}
