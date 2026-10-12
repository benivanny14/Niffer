import { connection } from "next/server";
import { json } from "@/lib/server/http";
import { listProducts, catalogStats } from "@/lib/server/catalog";

/** Bidhaa zote (kutoka DB + stoo halisi). */
export async function GET() {
  await connection();
  const products = listProducts();
  return json({ ok: true, count: products.length, products, ...catalogStats() });
}
