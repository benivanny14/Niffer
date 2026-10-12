import { cookies } from "next/headers";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { getDb, nowIso } from "@/lib/server/db";
import { InputError } from "@/lib/server/orders";
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

export function registerCustomer(input: {
  name?: string;
  phone?: string;
  email?: string;
  password?: string;
}): Customer {
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
  const exists = db
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
  db.prepare(
    `INSERT INTO customers (id, name, phone, email, password_hash, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
  ).run(id, name, phone, email || null, hashPassword(password), createdAt);

  return { id, name, phone, email: email || null, createdAt };
}

export function loginCustomer(input: {
  phone?: string;
  password?: string;
}): Customer {
  const phone = (input.phone ?? "").trim();
  const password = input.password ?? "";

  const row = getDb()
    .prepare("SELECT * FROM customers WHERE phone = ?")
    .get(phone) as CustomerRow | undefined;

  // Ujumbe mmoja kwa kila hali (usambaze taarifa za akaunti).
  if (!row || !verifyPassword(password, row.password_hash)) {
    throw new InputError("Simu au nywila si sahihi.", 401);
  }
  return toCustomer(row);
}

/* ============ Sessions ============ */

function purgeExpired(): void {
  getDb()
    .prepare("DELETE FROM customer_sessions WHERE expires_at < ?")
    .run(nowIso());
}

/** Fungua session mpya; rudisha token na muda wa kuishi (sekunde). */
export function createCustomerSession(customerId: string): {
  token: string;
  maxAge: number;
} {
  purgeExpired();
  const token = randomBytes(24).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString();
  getDb()
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
  getDb()
    .prepare("DELETE FROM customer_sessions WHERE token = ?")
    .run(token);
}

/** Mteja wa oda hii (null kama hajaringia). */
export async function currentCustomer(): Promise<Customer | null> {
  const store = await cookies();
  const token = store.get(CUSTOMER_COOKIE)?.value;
  if (!token) return null;
  purgeExpired();

  const row = getDb()
    .prepare(
      `SELECT c.* FROM customer_sessions s
       JOIN customers c ON c.id = s.customer_id
       WHERE s.token = ?`,
    )
    .get(token) as CustomerRow | undefined;
  return row ? toCustomer(row) : null;
}

/* ============ Oda zangu ============ */

/**
 * Oda za mteja — zile alizoweka akiwa ameingia pamoja na zile za namba
 * ile ile ya simu (mteja aliyetangulia kuingia kabla ya akaunti).
 */
export function listCustomerOrders(customer: Customer): Order[] {
  const db = getDb();
  try {
    const rows = db
      .prepare(
        `SELECT * FROM orders
         WHERE customer_id = ?
            OR json_extract(customer, '$.phone') = ?
         ORDER BY created_at DESC LIMIT 100`,
      )
      .all(customer.id, customer.phone) as unknown as Parameters<
      typeof rowToOrder
    >[0][];
    return rows.map(rowToOrder);
  } catch {
    // json1 isiyopatikana — tumia customer_id pekee.
    const rows = db
      .prepare(
        "SELECT * FROM orders WHERE customer_id = ? ORDER BY created_at DESC LIMIT 100",
      )
      .all(customer.id) as unknown as Parameters<typeof rowToOrder>[0][];
    return rows.map(rowToOrder);
  }
}
