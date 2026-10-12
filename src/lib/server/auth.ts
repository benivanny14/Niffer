import { cookies } from "next/headers";
import { randomBytes } from "node:crypto";
import { getDb, nowIso } from "@/lib/server/db";

/**
 * Admin auth — kijitibu cha kijitindo (session token kwenye cookie ya httpOnly,
 * huhifadhiwa kwenye DB `admin_sessions`). Nywila: `ADMIN_PASSWORD`
 * (chaguomsingi ya demo: niffer2026).
 */
export const ADMIN_COOKIE = "niffer_admin";
const SESSION_TTL_MS = 1000 * 60 * 60 * 12; // saa 12

export function adminPassword(): string {
  return process.env.ADMIN_PASSWORD || "niffer2026";
}

export function checkPassword(input: string): boolean {
  return input.trim() === adminPassword();
}

function purgeExpired(): void {
  getDb()
    .prepare("DELETE FROM admin_sessions WHERE expires_at < ?")
    .run(nowIso());
}

/** Fungua session mpya; rudisha token. */
export function createSession(): { token: string; maxAge: number } {
  purgeExpired();
  const token = randomBytes(24).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString();
  getDb()
    .prepare(
      "INSERT INTO admin_sessions (token, expires_at) VALUES (?, ?)",
    )
    .run(token, expiresAt);
  return { token, maxAge: Math.floor(SESSION_TTL_MS / 1000) };
}

/** Futa session ya sasa. */
export async function destroySession(): Promise<void> {
  const store = await cookies();
  const token = store.get(ADMIN_COOKIE)?.value;
  if (!token) return;
  getDb().prepare("DELETE FROM admin_sessions WHERE token = ?").run(token);
  // Pia futa cookie (kupitia header) — inafanywa na route handler.
}

/** Je, mtu aliyepo kwenye request ni admin? */
export async function isAdminRequest(): Promise<boolean> {
  const store = await cookies();
  const token = store.get(ADMIN_COOKIE)?.value;
  if (!token) return false;
  purgeExpired();
  const row = getDb()
    .prepare("SELECT token FROM admin_sessions WHERE token = ?")
    .get(token) as { token?: string } | undefined;
  return !!row?.token;
}
