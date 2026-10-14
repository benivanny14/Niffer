import type { NextRequest } from "next/server";
import { handleResetPassword } from "@/lib/server/password-reset-routes";

export async function POST(request: NextRequest) {
  return handleResetPassword(request);
}
