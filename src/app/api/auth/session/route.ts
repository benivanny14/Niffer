import { connection } from "next/server";
import { json } from "@/lib/server/http";
import { isAdminRequest } from "@/lib/server/auth";

/** Je, kuna admin session hai? */
export async function GET() {
  await connection();
  const authed = await isAdminRequest();
  return json({ ok: true, authed });
}
