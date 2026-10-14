import type { NextRequest } from "next/server";
import { handleForgotPassword } from "@/lib/server/password-reset-routes";

export async function POST(request: NextRequest) {
  return handleForgotPassword(request);
}
