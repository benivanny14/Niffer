import type { NextRequest } from "next/server";
import { handleForgotPassword } from "@/lib/server/password-reset-routes";

/** Compatibility endpoint. Password reset now uses an email link. */
export async function POST(request: NextRequest) {
  return handleForgotPassword(request);
}
