import { connection } from "next/server";
import { json, fail, toErrorResponse } from "@/lib/server/http";
import { isAdminRequest } from "@/lib/server/auth";
import { listAllCustomers } from "@/lib/server/customers";

/** Wateja wote (admin pekee). */
export async function GET() {
  await connection();
  try {
    if (!(await isAdminRequest())) {
      return fail("Ingia kama admin kuona wateja.", 401);
    }
    const customers = await listAllCustomers();
    return json({ ok: true, count: customers.length, customers });
  } catch (error) {
    return toErrorResponse(error);
  }
}
