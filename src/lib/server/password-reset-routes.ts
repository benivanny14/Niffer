import { connection, type NextRequest } from "next/server";
import { createPasswordReset, resetPasswordWithToken } from "@/lib/server/customers";
import { toErrorResponse, json, fail, readBody } from "@/lib/server/http";
import { rateLimit, rateLimitMessage } from "@/lib/server/rate-limit";
import { notifyAdmin } from "@/lib/server/notify";
import { sendPasswordResetEmail } from "@/lib/server/password-reset-email";

const GENERIC_RESPONSE =
  "If an account with that email exists, a password reset link will be sent.";

export async function handleForgotPassword(req: NextRequest) {
  await connection();
  try {
    const limited = rateLimit(req, "password-reset-request", 3, 300);
    if (!limited.ok) return fail(rateLimitMessage(limited.retryAfterSec), 429);

    const body = await readBody<{ email?: string }>(req);
    const email = body?.email?.trim().toLowerCase() ?? "";
    if (!email) return fail("Enter your email address.");
    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return json({ ok: true, message: GENERIC_RESPONSE });
    }

    const reset = await createPasswordReset(email);
    if (reset) {
      try {
        await sendPasswordResetEmail(reset.customer, reset.token);
      } catch (error) {
        // Keep the response identical for existing and unknown addresses.
        console.error("[password-reset] Email delivery failed.", error);
      }
    }
    return json({ ok: true, message: GENERIC_RESPONSE });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function handleResetPassword(req: NextRequest) {
  await connection();
  try {
    const limited = rateLimit(req, "password-reset-submit", 10, 300);
    if (!limited.ok) return fail(rateLimitMessage(limited.retryAfterSec), 429);

    const body = await readBody<{
      token?: string;
      password?: string;
      confirmPassword?: string;
    }>(req);
    if (!body?.token || !body.password) {
      return fail("A reset link and new password are required.");
    }
    if (body.password !== body.confirmPassword) {
      return fail("The passwords do not match.");
    }

    const customer = await resetPasswordWithToken(body.token, body.password);
    await notifyAdmin({
      kind: "info",
      title: "Password changed",
      body: `${customer.name} (${customer.phone}) changed their password.`,
      ref: "/admin",
    });
    return json({ ok: true, message: "Your password has been reset. You can now sign in." });
  } catch (error) {
    return toErrorResponse(error);
  }
}
