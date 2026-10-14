import { Resend } from "resend";
import { baseUrl } from "@/lib/seo";
import type { Customer } from "@/lib/server/customers";

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[char] ?? char;
  });
}

function publicAppUrl(): string {
  const configured =
    process.env.APP_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.VERCEL_URL;
  if (!configured) return baseUrl;
  const withProtocol = /^https?:\/\//i.test(configured)
    ? configured
    : `https://${configured}`;
  try {
    const parsed = new URL(withProtocol);
    if (parsed.protocol === "https:" || parsed.hostname === "localhost") {
      return parsed.origin;
    }
  } catch {
    // Use the canonical production URL when a malformed value is configured.
  }
  return baseUrl;
}

export async function sendPasswordResetEmail(
  customer: Customer,
  token: string,
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) throw new Error("RESEND_API_KEY is not configured.");

  const resetUrl = new URL("/reset-password", publicAppUrl());
  resetUrl.searchParams.set("token", token);

  const name = escapeHtml(customer.name);
  const link = escapeHtml(resetUrl.toString());
  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from: "Niffer Cosmetics <onboarding@resend.dev>",
    to: [customer.email!],
    subject: "Reset your password — Niffer Cosmetics",
    text: `Hello ${customer.name},\n\nUse this link to choose a new password: ${resetUrl}\n\nThis link expires in one hour and can only be used once. If you did not request this, you can ignore this email.`,
    html: `<!doctype html>
<html lang="en">
  <body style="margin:0;background:#09090b;color:#e4e4e7;font-family:Arial,Helvetica,sans-serif;padding:32px 16px;">
    <table role="presentation" style="width:100%;max-width:560px;margin:0 auto;border-collapse:collapse;background:#18181b;border:1px solid #27272a;border-radius:18px;overflow:hidden;">
      <tr><td style="padding:32px 32px 8px;color:#fda4af;font-size:12px;font-weight:700;letter-spacing:3px;text-transform:uppercase;">Niffer Cosmetics</td></tr>
      <tr><td style="padding:12px 32px 0;"><h1 style="margin:0;color:#fafafa;font-size:26px;line-height:1.25;">Reset your password</h1></td></tr>
      <tr><td style="padding:16px 32px 0;color:#d4d4d8;font-size:16px;line-height:1.65;">Hello ${name}, we received a request to reset the password for your account.</td></tr>
      <tr><td style="padding:28px 32px;text-align:center;"><a href="${link}" style="display:inline-block;border-radius:10px;background:#be123c;color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;padding:14px 24px;">Reset password</a></td></tr>
      <tr><td style="padding:0 32px;color:#a1a1aa;font-size:14px;line-height:1.65;">This link expires in one hour and can only be used once. If you did not request a reset, you can ignore this email.</td></tr>
      <tr><td style="padding:24px 32px 32px;color:#71717a;font-size:12px;line-height:1.6;">If the button does not work, copy this link into your browser:<br><a href="${link}" style="color:#fda4af;word-break:break-all;">${link}</a></td></tr>
    </table>
  </body>
</html>`,
  });

  if (error) throw new Error(error.message);
}
