import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import {
  products as catalogProducts,
  reviews as catalogReviews,
} from "@/lib/data/catalog";

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
  updated_at       TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS stock (
  slug       TEXT PRIMARY KEY,
  qty        INTEGER NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS orders (
  code         TEXT PRIMARY KEY,
  created_at   TEXT NOT NULL,
  status       TEXT NOT NULL,
  customer     TEXT NOT NULL,
  payment      TEXT NOT NULL,
  lines        TEXT NOT NULL,
  subtotal_tsh INTEGER NOT NULL,
  shipping_tsh INTEGER NOT NULL,
  total_tsh    INTEGER NOT NULL,
  promo_code   TEXT,
  discount_tsh INTEGER,
  history      TEXT NOT NULL DEFAULT '[]',
  demo         INTEGER NOT NULL DEFAULT 0
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
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS admin_sessions (
  token      TEXT PRIMARY KEY,
  expires_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS meta (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
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
  seed(db);
  return db;
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
      rating, review_count, stock_base, badges, image, image_alt, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(slug) DO UPDATE SET
      id = excluded.id,
      name = excluded.name,
      category = excluded.category,
      price_tsh = excluded.price_tsh,
      compare_at_tsh = excluded.compare_at_tsh,
      short_description = excluded.short_description,
      description = excluded.description,
      ingredients = excluded.ingredients,
      how_to_use = excluded.how_to_use,
      rating = excluded.rating,
      review_count = excluded.review_count,
      stock_base = excluded.stock_base,
      badges = excluded.badges,
      image = excluded.image,
      image_alt = excluded.image_alt,
      updated_at = excluded.updated_at
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
      now,
    );
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
