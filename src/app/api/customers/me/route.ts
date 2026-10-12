import { connection } from "next/server";
import { json } from "@/lib/server/http";
import { currentCustomer } from "@/lib/server/customers";

/** Taarifa za mteja aliyeingia (null kama hajaringia). */
export async function GET() {
  await connection();
  const customer = await currentCustomer();
  return json({ ok: true, customer });
}
