import { connection } from "next/server";
import { json } from "@/lib/server/http";
import {
  CUSTOMER_COOKIE,
  destroyCustomerSession,
} from "@/lib/server/customers";

/** Toka kwenye akaunti — futa session na cookie. */
export async function POST() {
  await connection();
  await destroyCustomerSession();
  const res = json({ ok: true });
  res.cookies.set(CUSTOMER_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
