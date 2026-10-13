import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import {
  products as catalogProducts,
  reviews as catalogReviews,
} from "@/lib/data/catalog";
import { promoCodes } from "@/lib/promo";

/**
 * Database (SQLite kupitia `node:sqlite` ya Node 22+ — hakuna dependency ya ziada).
 *
 * - Faili: `.data/niffer.db` (au kutoka `NIFFER_DB_FILE`)
 * - Muunganiko mmoja umehifadhiwa kwenye `globalThis` uvumilie hot-reload.
 * - Kila moduli ya server inapiga `getDb()` kupata muunganiko huo.
 */
const SCHEMA = `
CREATE TABLE IF NOT EXISTS products (
  slug             TEXT PRIMARY KEY,
  id               TEXT NOT NULL,
  name             TEXT NOT NULL,
  category         TEXT NOT NULL,
  price_tsh        INTEGER NOT NULL,
  compare_at_tsh   INTEGER,
  short_description TEXT NOT NULL DEFAULT '',
  description      TEXT NOT NULL DEFAULT '',
  ingredients      TEXT NOT NULL DEFAULT '',
  how_to_use       TEXT NOT NULL DEFAULT '',
  rating           REAL NOT NULL DEFAULT 0,
  review_count     INTEGER NOT NULL DEFAULT 0,
  stock_base       INTEGER NOT NULL DEFAULT 0,
  badges           TEXT NOT NULL DEFAULT '[]',
  image            TEXT NOT NULL DEFAULT '',
  image_alt        TEXT NOT NULL DEFAULT '',
  region           TEXT NOT NULL DEFAULT '',
  city             TEXT NOT NULL DEFAULT '',
  updated_at       TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS stock (
  slug       TEXT PRIMARY KEY,
  qty        INTEGER NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS orders (
  code             TEXT PRIMARY KEY,
  created_at       TEXT NOT NULL,
  status           TEXT NOT NULL,
  customer         TEXT NOT NULL,
  payment          TEXT NOT NULL,
  lines            TEXT NOT NULL,
  subtotal_tsh     INTEGER NOT NULL,
  shipping_tsh     INTEGER NOT NULL,
  total_tsh        INTEGER NOT NULL,
  promo_code       TEXT,
  discount_tsh     INTEGER,
  history          TEXT NOT NULL DEFAULT '[]',
  demo             INTEGER NOT NULL DEFAULT 0,
  gift_card_code   TEXT,
  gift_discount_tsh INTEGER
);

CREATE TABLE IF NOT EXISTS order_events (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  code     TEXT NOT NULL,
  status   TEXT NOT NULL,
  at       TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS reviews (
  id            TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  location      TEXT NOT NULL DEFAULT '',
  rating        INTEGER NOT NULL DEFAULT 5,
  comment       TEXT NOT NULL,
  product_slug  TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'pending',
  created_at    TEXT
);

CREATE TABLE IF NOT EXISTS messages (
  id         TEXT PRIMARY KEY,
  kind       TEXT NOT NULL DEFAULT 'contact',
  name       TEXT NOT NULL DEFAULT '',
  phone      TEXT NOT NULL DEFAULT '',
  email      TEXT NOT NULL DEFAULT '',
  body       TEXT NOT NULL DEFAULT '{}',
  status     TEXT NOT NULL DEFAULT 'new',
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS newsletter (
  id         TEXT PRIMARY KEY,
  email      TEXT NOT NULL UNIQUE,
  source     TEXT NOT NULL DEFAULT 'site',
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS gift_cards (
  code       TEXT PRIMARY KEY,
  amount_tsh INTEGER NOT NULL,
  recipient  TEXT NOT NULL DEFAULT '',
  message    TEXT NOT NULL DEFAULT '',
  status     TEXT NOT NULL DEFAULT 'issued',
  created_at TEXT NOT NULL,
  expires_at TEXT,
  redeemed_at TEXT,
  order_code  TEXT
);

CREATE TABLE IF NOT EXISTS notifications (
  id         TEXT PRIMARY KEY,
  kind       TEXT NOT NULL DEFAULT 'info',
  title      TEXT NOT NULL,
  body       TEXT NOT NULL DEFAULT '',
  ref        TEXT NOT NULL DEFAULT '',
  status     TEXT NOT NULL DEFAULT 'new',
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS customer_notifications (
  id          TEXT PRIMARY KEY,
  customer_id TEXT,
  phone       TEXT NOT NULL DEFAULT '',
  order_code  TEXT NOT NULL DEFAULT '',
  kind        TEXT NOT NULL DEFAULT 'info',
  title       TEXT NOT NULL,
  body        TEXT NOT NULL DEFAULT '',
  status      TEXT NOT NULL DEFAULT 'new',
  created_at  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS wishlists (
  customer_id TEXT NOT NULL,
  slug        TEXT NOT NULL,
  created_at  TEXT NOT NULL,
  PRIMARY KEY (customer_id, slug)
);

CREATE TABLE IF NOT EXISTS promo_codes (
  code             TEXT PRIMARY KEY,
  label            TEXT NOT NULL,
  percent_off      INTEGER,
  free_shipping    INTEGER NOT NULL DEFAULT 0,
  min_subtotal_tsh INTEGER,
  active           INTEGER NOT NULL DEFAULT 1,
  created_at       TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS admin_sessions (
  token      TEXT PRIMARY KEY,
  expires_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS meta (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS customers (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  phone         TEXT NOT NULL UNIQUE,
  email         TEXT,
  password_hash TEXT NOT NULL,
  created_at    TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS customer_sessions (
  token       TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL,
  expires_at  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  token       TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL,
  expires_at  TEXT NOT NULL,
  used        INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS rfqs (
  code          TEXT PRIMARY KEY,
  business      TEXT NOT NULL DEFAULT '',
  name          TEXT NOT NULL,
  phone         TEXT NOT NULL,
  email         TEXT NOT NULL DEFAULT '',
  region        TEXT NOT NULL DEFAULT '',
  product_slug  TEXT NOT NULL DEFAULT '',
  product_name  TEXT NOT NULL DEFAULT '',
  qty           INTEGER NOT NULL DEFAULT 0,
  note          TEXT NOT NULL DEFAULT '',
  status        TEXT NOT NULL DEFAULT 'new',
  quote_tsh     INTEGER,
  unit_quote_tsh INTEGER,
  created_at    TEXT NOT NULL,
  updated_at    TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_order_events_code ON order_events(code, at);
CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_slug, status);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status, created_at);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at, status);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status, created_at);
CREATE INDEX IF NOT EXISTS idx_cust_notif_customer ON customer_notifications(customer_id);
CREATE INDEX IF NOT EXISTS idx_cust_notif_phone ON customer_notifications(phone);
CREATE INDEX IF NOT EXISTS idx_cust_notif_status ON customer_notifications(status, created_at);
CREATE INDEX IF NOT EXISTS idx_customer_sessions_customer ON customer_sessions(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_sessions_expires ON customer_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_reset_tokens_customer ON password_reset_tokens(customer_id, used);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires ON admin_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_rfqs_phone ON rfqs(phone);
CREATE INDEX IF NOT EXISTS idx_stock_slug ON stock(slug);
`;

export function nowIso(): string {
  return new Date().toISOString();
}

/** XML/SQL salama: null badala ya undefined. */
export function nul<T>(value: T | undefined | null): T | null {
  return value === undefined ? null : value;
}

function openDatabase(): DatabaseSync {
  const file =
    process.env.NIFFER_DB_FILE ||
    path.join(process.cwd(), ".data", "niffer.db");

  fs.mkdirSync(path.dirname(file), { recursive: true });

  const db = new DatabaseSync(file);
  db.exec("PRAGMA journal_mode = WAL;");
  db.exec("PRAGMA foreign_keys = ON;");
  db.exec(SCHEMA);
  migrate(db);
  seed(db);
  return db;
}

/** Ongeza safu mpya kwa jedwali lililokuwepo (hatua ya usalama kwa DB za zamani). */
function migrate(db: DatabaseSync): void {
  const columns = (table: string) =>
    (db.prepare(`PRAGMA table_info(${table})`).all() as unknown as {
      name: string;
    }[]).map((c) => c.name);

  const orders = columns("orders");
  if (!orders.includes("customer_id")) {
    db.exec("ALTER TABLE orders ADD COLUMN customer_id TEXT");
  }
  if (!orders.includes("payment_status")) {
    db.exec("ALTER TABLE orders ADD COLUMN payment_status TEXT NOT NULL DEFAULT 'pending'");
  }
  if (!orders.includes("payment_ref")) {
    db.exec("ALTER TABLE orders ADD COLUMN payment_ref TEXT");
  }
  if (!orders.includes("gift_card_code")) {
    db.exec("ALTER TABLE orders ADD COLUMN gift_card_code TEXT");
  }
  if (!orders.includes("gift_discount_tsh")) {
    db.exec("ALTER TABLE orders ADD COLUMN gift_discount_tsh INTEGER");
  }

  const productCols = columns("products");
  if (!productCols.includes("region")) {
    db.exec("ALTER TABLE products ADD COLUMN region TEXT NOT NULL DEFAULT ''");
  }
  if (!productCols.includes("city")) {
    db.exec("ALTER TABLE products ADD COLUMN city TEXT NOT NULL DEFAULT ''");
  }

  const giftCols = columns("gift_cards");
  if (!giftCols.includes("redeemed_at")) {
    db.exec("ALTER TABLE gift_cards ADD COLUMN redeemed_at TEXT");
  }
  if (!giftCols.includes("order_code")) {
    db.exec("ALTER TABLE gift_cards ADD COLUMN order_code TEXT");
  }
  if (!giftCols.includes("expires_at")) {
    db.exec("ALTER TABLE gift_cards ADD COLUMN expires_at TEXT");
  }

  // Kadi zilizotolewa kabla ya kipengele cha kuisha muda — wapa miaka 1.
  db.exec(
    `UPDATE gift_cards SET expires_at = datetime(created_at, '+1 year')
     WHERE expires_at IS NULL`,
  );

  // Promo codes: ingiza katalogi ya ndani mara moja (seed) — DB ndio mwanzo
  // wa ukweli baada ya admin kubadilisha au kuzima msimbo.
  const promoInsert = db.prepare(
    `INSERT INTO promo_codes (
       code, label, percent_off, free_shipping, min_subtotal_tsh, active, created_at
     ) VALUES (?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(code) DO NOTHING`,
  );
  for (const p of promoCodes) {
    promoInsert.run(
      p.code,
      p.label,
      p.percentOff ?? null,
      p.freeShipping ? 1 : 0,
      p.minSubtotalTsh ?? null,
      p.active ? 1 : 0,
      nowIso(),
    );
  }
}

/** Muunganiko wa pamoja (singleton). */
export function getDb(): DatabaseSync {
  const store = globalThis as unknown as { __nifferDb?: DatabaseSync };
  if (store.__nifferDb) return store.__nifferDb;
  const db = openDatabase();
  store.__nifferDb = db;
  return db;
}

/** Weka katalogi ndani ya DB (sync kila kuanza — repo ndio mwanzo wa ukweli). */
function seed(db: DatabaseSync) {
  const now = nowIso();
  const upsert = db.prepare(`
    INSERT INTO products (
      slug, id, name, category, price_tsh, compare_at_tsh,
      short_description, description, ingredients, how_to_use,
      rating, review_count, stock_base, badges, image, image_alt,
      region, city, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    /* Usibadilishe bidhaa zilizopo — DB ndio mwanzo wa ukweli baada ya
       admin kuhariri (bei/jina/picha). Bidhaa mpya zinaingizwa mara moja. */
    ON CONFLICT(slug) DO NOTHING
  `);

  for (const p of catalogProducts) {
    upsert.run(
      p.slug,
      p.id,
      p.name,
      p.category,
      p.priceTsh,
      nul(p.compareAtTsh),
      p.shortDescription,
      p.description,
      p.ingredients,
      p.howToUse,
      p.rating,
      p.reviewCount,
      p.stock,
      JSON.stringify(p.badges ?? []),
      p.image,
      p.imageAlt,
      p.region ?? "",
      p.city ?? "",
      now,
    );
  }

  // Rejesha eneo kwa bidhaa za zamani zilizokuwa bila mkoa/mji.
  const backfillLocation = db.prepare(
    `UPDATE products SET region = ?, city = ? WHERE slug = ? AND region = ''`,
  );
  for (const p of catalogProducts) {
    if (p.region) backfillLocation.run(p.region, p.city ?? "", p.slug);
  }
  // Stoo: hazibadiliki kwa kila kuanza — marekebisho ya admin na manunuzi ndio yanayoamua.
  const stockInsert = db.prepare(
    `INSERT INTO stock (slug, qty, updated_at) VALUES (?, ?, ?)
     ON CONFLICT(slug) DO NOTHING`,
  );
  for (const p of catalogProducts) {
    stockInsert.run(p.slug, p.stock, now);
  }

  // Hakiki mfano (seed) — mara moja tu.
  const reviewInsert = db.prepare(
    `INSERT OR IGNORE INTO reviews
       (id, customer_name, location, rating, comment, product_slug, status, created_at)
     VALUES (?, ?, ?, ?, ?, ?, 'approved', ?)`,
  );
  for (const r of catalogReviews) {
    reviewInsert.run(
      r.id,
      r.customerName,
      r.location,
      r.rating,
      r.comment,
      r.productSlug,
      now,
    );
  }
}

/** Safisha oda za demo (haipo kwenye DB — zinatokana na `demoOrders()`). */
export function isDemoCode(code: string): boolean {
  return /^NCF-[A-Z0-9]{4}$/.test(code.trim().toUpperCase());
}
