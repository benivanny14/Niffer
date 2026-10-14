import type { NextRequest } from "next/server";
import { handleResetPassword } from "@/lib/server/password-reset-routes";

/** Compatibility endpoint. Password reset now requires a one-time email token. */
export async function POST(request: NextRequest) {
  return handleResetPassword(request);
}
