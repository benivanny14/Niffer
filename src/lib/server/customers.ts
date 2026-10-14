import { cookies } from "next/headers";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
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
  const email = (input.email ?? "").trim();
  const password = input.password ?? "";

  if (name.length < 2) throw new InputError("Jina halisi linahitajika.");
  if (!/^[0-9+\s]{9,15}$/.test(phone)) {
    throw new InputError("Weka namba sahihi ya simu (mfano 0754 000 000).");
  }
  if (password.length < 6) {
    throw new InputError("Nywila lazima iwe na herufi 6 au zaidi.");
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new InputError("Barua pepe si sahihi.");
  }

  const db = getDb();
  const exists = await db
    .prepare("SELECT id FROM customers WHERE phone = ?")
    .get(phone) as { id?: string } | undefined;
  if (exists) {
    throw new InputError(
      "Namba hii tayari ina akaunti. Ingia badala ya kujiandikishe.",
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
    throw new InputError("Simu au nywila si sahihi.", 401);
  }
  return toCustomer(row);
}

/* ============ Kusahau nywila (password reset) ============ */

const RESET_TTL_MS = 1000 * 60 * 15; // dakika 15
const RESET_CODE_ALPHABET = "23456789"; // bila 0/1/O/I — urahisi wa kuandika

/** Msimbo wa tarakimu 6 usiolingana na nyingine (salama kwa kuandika). */
function resetCode(): string {
  let out = "";
  for (let i = 0; i < 6; i += 1) {
    out += RESET_CODE_ALPHABET[Math.floor(Math.random() * RESET_CODE_ALPHABET.length)];
  }
  return out;
}

/**
 * Tengeneza msimbo wa kubadili nywila kwa simu.
 * Rudisha { customer, code } ikiwa akaunti ipo; null ikiwa hakuna.
 * (Mwombaji hajapata taarifa — route hujibu ujumbe wa jumla.)
 */
export async function createPasswordReset(phoneRaw: string): Promise<{
  customer: Customer;
  code: string;
} | null> {
  const phone = phoneRaw.trim();
  if (!phone) return null;
  const row = await getDb()
    .prepare("SELECT * FROM customers WHERE phone = ?")
    .get(phone) as CustomerRow | undefined;
  if (!row) return null;

  const db = getDb();
  // Ondoa msimbo wowote wa awali wa akaunti hii.
  await db.prepare(
    "DELETE FROM password_reset_tokens WHERE customer_id = ? AND used = 0",
  ).run(row.id);

  const code = resetCode();
  const createdAt = nowIso();
  const expiresAt = new Date(Date.now() + RESET_TTL_MS).toISOString();
  await db.prepare(
    `INSERT INTO password_reset_tokens (token, customer_id, expires_at, used, created_at)
     VALUES (?, ?, ?, 0, ?)`,
  ).run(code, row.id, expiresAt, createdAt);

  return { customer: toCustomer(row), code };
}

/** Thibitisha msimbo na weka nywila mpya; invalidate sessions zote. */
export async function resetPasswordWithToken(
  codeRaw: string,
  newPassword: string,
): Promise<Customer> {
  const code = codeRaw.trim();
  if (!/^[0-9]{6}$/.test(code)) {
    throw new InputError("Msimbo wa tarakimu 6 unahitajika.");
  }
  if (newPassword.length < 6) {
    throw new InputError("Nywila lazima iwe na herufi 6 au zaidi.");
  }

  const db = getDb();
  const row = await db
    .prepare(
      "SELECT * FROM password_reset_tokens WHERE token = ? AND used = 0",
    )
    .get(code) as
    | { token: string; customer_id: string; expires_at: string }
    | undefined;
  if (!row || Date.parse(row.expires_at) < Date.now()) {
    throw new InputError("Msimbo si sahihi au umeisha muda wake.", 400);
  }

  const customerRow = await db
    .prepare("SELECT * FROM customers WHERE id = ?")
    .get(row.customer_id) as CustomerRow | undefined;
  if (!customerRow) throw new InputError("Akaunti haipatikani.", 404);

  try {
    await db.transaction(async (tx) => {
    await tx.prepare("UPDATE customers SET password_hash = ? WHERE id = ?").run(
      hashPassword(newPassword),
      customerRow.id,
    );
    await tx.prepare(
      "UPDATE password_reset_tokens SET used = 1 WHERE token = ?",
    ).run(code);
    // Futa session zote — mteja aliyepo aingie upya na nywila mpya.
    await tx.prepare(
      "DELETE FROM customer_sessions WHERE customer_id = ?",
    ).run(customerRow.id);
    });
  } catch (error) {
    throw error;
  }

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

/* ============ Oda zangu ============ */

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
