import { cookies } from "next/headers";
import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { getDb, nowIso } from "@/lib/server/db";
import { InputError } from "@/lib/server/errors";
import type { Order } from "@/lib/orders";
import { rowToOrder } from "@/lib/server/orders";

/**
 * Akaunti za wateja — nywila hashwa kwa scrypt (hakuna dependency ya ziada),
 * session token huhifadhiwa kwenye DB na cookie ya httpOnly (siku 30).
 */
export const CUSTOMER_COOKIE = "niffer_customer";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30; // siku 30

export type Customer = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  createdAt: string;
};

type CustomerRow = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  password_hash: string;
  created_at: string;
};

/* ============ Nywila ============ */

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `scrypt:${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [algo, salt, hash] = stored.split(":");
  if (algo !== "scrypt" || !salt || !hash) return false;
  const candidate = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  return (
    candidate.length === expected.length && timingSafeEqual(candidate, expected)
  );
}

function toCustomer(row: CustomerRow): Customer {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    email: row.email,
    createdAt: row.created_at,
  };
}

/* ============ Register / Login ============ */

export async function registerCustomer(input: {
  name?: string;
  phone?: string;
  email?: string;
  password?: string;
}): Promise<Customer> {
  const name = (input.name ?? "").trim();
  const phone = (input.phone ?? "").trim();
  const email = (input.email ?? "").trim().toLowerCase();
  const password = input.password ?? "";

  if (name.length < 2) throw new InputError("Please enter your name.");
  if (!/^[0-9+\s]{9,15}$/.test(phone)) {
    throw new InputError("Enter a valid phone number (for example, 0754 000 000).");
  }
  if (password.length < 6) {
    throw new InputError("Password must be at least 6 characters long.");
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new InputError("Invalid email address.");
  }

  const db = getDb();
  const exists = await db
    .prepare("SELECT id FROM customers WHERE phone = ?")
    .get(phone) as { id?: string } | undefined;
  if (exists) {
    throw new InputError(
      "This phone number already has an account. Sign in instead.",
      409,
    );
  }

  const id = `cus-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  const createdAt = nowIso();
  await db.prepare(
    `INSERT INTO customers (id, name, phone, email, password_hash, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
  ).run(id, name, phone, email || null, hashPassword(password), createdAt);

  return { id, name, phone, email: email || null, createdAt };
}

export async function loginCustomer(input: {
  phone?: string;
  password?: string;
}): Promise<Customer> {
  const phone = (input.phone ?? "").trim();
  const password = input.password ?? "";

  const row = await getDb()
    .prepare("SELECT * FROM customers WHERE phone = ?")
    .get(phone) as CustomerRow | undefined;

  // Ujumbe mmoja kwa kila hali (usambaze taarifa za akaunti).
  if (!row || !verifyPassword(password, row.password_hash)) {
    throw new InputError("Incorrect phone number or password.", 401);
  }
  return toCustomer(row);
}

/* ============ Kusahau nywila (password reset) ============ */

const RESET_TTL_MS = 1000 * 60 * 60;

function passwordResetDigest(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/** Create a random, single-use reset link token for an account email. */
export async function createPasswordReset(emailRaw: string): Promise<{
  customer: Customer;
  token: string;
} | null> {
  const email = emailRaw.trim().toLowerCase();
  if (!email) return null;
  const matchingRows = await getDb()
    .prepare("SELECT * FROM customers WHERE LOWER(email) = ? LIMIT 2")
    .all(email) as CustomerRow[];
  if (matchingRows.length !== 1 || !matchingRows[0]?.email) return null;
  const row = matchingRows[0];

  const token = randomBytes(32).toString("base64url");
  const createdAt = nowIso();
  const expiresAt = new Date(Date.now() + RESET_TTL_MS).toISOString();
  const db = getDb();
  await db.transaction(async (tx) => {
    await tx.prepare(
      "DELETE FROM password_reset_tokens WHERE customer_id = ? AND used = 0",
    ).run(row.id);
    await tx.prepare(
      `INSERT INTO password_reset_tokens (token, customer_id, expires_at, used, created_at)
       VALUES (?, ?, ?, 0, ?)`,
    ).run(passwordResetDigest(token), row.id, expiresAt, createdAt);
  });

  return { customer: toCustomer(row), token };
}

/** Verify a one-time reset token, hash the new password, and revoke sessions. */
export async function resetPasswordWithToken(
  tokenRaw: string,
  newPassword: string,
): Promise<Customer> {
  const token = tokenRaw.trim();
  if (!/^[A-Za-z0-9_-]{43}$/.test(token)) {
    throw new InputError("This reset link is invalid or has expired.");
  }
  if (newPassword.length < 8) {
    throw new InputError("Password must be at least 8 characters long.");
  }

  const db = getDb();
  const customerRow = await db.transaction(async (tx) => {
    const tokenDigest = passwordResetDigest(token);
    const resetRow = await tx
      .prepare("SELECT customer_id, expires_at FROM password_reset_tokens WHERE token = ? AND used = 0")
      .get(tokenDigest) as { customer_id: string; expires_at: string } | undefined;
    if (!resetRow || Date.parse(resetRow.expires_at) <= Date.now()) {
      throw new InputError("This reset link is invalid or has expired.");
    }

    const customerRow = await tx
      .prepare("SELECT * FROM customers WHERE id = ?")
      .get(resetRow.customer_id) as CustomerRow | undefined;
    if (!customerRow) throw new InputError("Account not found.", 404);

    const claimed = await tx.prepare(
      "UPDATE password_reset_tokens SET used = 1 WHERE token = ? AND used = 0 AND expires_at > ?",
    ).run(tokenDigest, nowIso());
    if (claimed.changes !== 1) {
      throw new InputError("This reset link is invalid or has expired.");
    }

    await tx.prepare("UPDATE customers SET password_hash = ? WHERE id = ?").run(
      hashPassword(newPassword),
      customerRow.id,
    );
    await tx.prepare(
      "DELETE FROM customer_sessions WHERE customer_id = ?",
    ).run(customerRow.id);
    return customerRow;
  });

  return toCustomer(customerRow);
}

/* ============ Sessions ============ */

async function purgeExpired(): Promise<void> {
  await getDb()
    .prepare("DELETE FROM customer_sessions WHERE expires_at < ?")
    .run(nowIso());
}

/** Fungua session mpya; rudisha token na muda wa kuishi (sekunde). */
export async function createCustomerSession(customerId: string): Promise<{
  token: string;
  maxAge: number;
}> {
  await purgeExpired();
  const token = randomBytes(24).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString();
  await getDb()
    .prepare(
      "INSERT INTO customer_sessions (token, customer_id, expires_at) VALUES (?, ?, ?)",
    )
    .run(token, customerId, expiresAt);
  return { token, maxAge: Math.floor(SESSION_TTL_MS / 1000) };
}

export async function destroyCustomerSession(): Promise<void> {
  const store = await cookies();
  const token = store.get(CUSTOMER_COOKIE)?.value;
  if (!token) return;
  await getDb()
    .prepare("DELETE FROM customer_sessions WHERE token = ?")
    .run(token);
}

/** Mteja wa oda hii (null kama hajaringia). */
export async function currentCustomer(): Promise<Customer | null> {
  const store = await cookies();
  const token = store.get(CUSTOMER_COOKIE)?.value;
  if (!token) return null;
  await purgeExpired();

  const row = await getDb()
    .prepare(
      `SELECT c.* FROM customer_sessions s
       JOIN customers c ON c.id = s.customer_id
       WHERE s.token = ?`,
    )
    .get(token) as CustomerRow | undefined;
  return row ? toCustomer(row) : null;
}

/* ============ Admin: wateja wote ============ */

export async function listAllCustomers(limit = 500): Promise<Customer[]> {
  const rows = await getDb()
    .prepare(
      "SELECT * FROM customers ORDER BY created_at DESC LIMIT ?",
    )
    .all(limit) as unknown as CustomerRow[];
  return rows.map(toCustomer);
}

/* ============ My orders ============ */

/**
 * Oda za mteja — zile alizoweka akiwa ameingia pamoja na zile za namba
 * ile ile ya simu (mteja aliyetangulia kuingia kabla ya akaunti).
 */
export async function listCustomerOrders(customer: Customer): Promise<Order[]> {
  const db = getDb();
  try {
    const rows = await db
      .prepare(
        `SELECT * FROM orders
         WHERE customer_id = ?
            OR customer::jsonb ->> 'phone' = ?
         ORDER BY created_at DESC LIMIT 100`,
      )
      .all(customer.id, customer.phone) as unknown as Parameters<
      typeof rowToOrder
    >[0][];
    return rows.map(rowToOrder);
  } catch {
    // json1 isiyopatikana — tumia customer_id pekee.
    const rows = await db
      .prepare(
        "SELECT * FROM orders WHERE customer_id = ? ORDER BY created_at DESC LIMIT 100",
      )
      .all(customer.id) as unknown as Parameters<typeof rowToOrder>[0][];
    return rows.map(rowToOrder);
  }
}
