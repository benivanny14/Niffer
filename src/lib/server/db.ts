import { Pool, type PoolClient, type QueryResultRow } from "@neondatabase/serverless";
import {
  products as catalogProducts,
  reviews as catalogReviews,
} from "@/lib/data/catalog";
import { promoCodes } from "@/lib/promo";

/**
 * Neon PostgreSQL connection pool. All query methods are asynchronous.
 * Runtime requires DATABASE_URL; schema initialization runs once per instance.
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
  gift_discount_tsh INTEGER,
  customer_id      TEXT,
  payment_status   TEXT NOT NULL DEFAULT 'pending',
  payment_ref      TEXT
);

CREATE TABLE IF NOT EXISTS order_events (
  id       BIGSERIAL PRIMARY KEY,
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

type DbRow = Record<string, unknown>;

type DbResult<T extends DbRow = DbRow> = { rows: T[]; rowCount: number | null };

function toPostgresPlaceholders(statement: string): string {
  let index = 0;
  return statement.replace(/\?/g, () => `$${++index}`);
}

export class NeonDatabase {
  constructor(
    private readonly pool: Pool,
    private readonly client?: PoolClient,
    private readonly skipReady = false,
  ) {}

  private async ready() {
    if (!this.skipReady) await ensureDatabaseReady();
  }

  async query<T extends DbRow = DbRow>(statement: string, values: unknown[] = []): Promise<DbResult<T>> {
    await this.ready();
    return (this.client ?? this.pool).query<T>(toPostgresPlaceholders(statement), values);
  }

  prepare(statement: string) {
    return {
      all: async (...values: unknown[]) => (await this.query(statement, values)).rows,
      get: async (...values: unknown[]) => (await this.query(statement, values)).rows[0],
      run: async (...values: unknown[]) => {
        const result = await this.query(statement, values);
        return { changes: result.rowCount ?? 0 };
      },
    };
  }

  async exec(statement: string): Promise<void> {
    await this.ready();
    await (this.client ?? this.pool).query(statement);
  }

  async transaction<T>(work: (tx: NeonDatabase) => Promise<T>): Promise<T> {
    await this.ready();
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await work(new NeonDatabase(this.pool, client, true));
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

type DbGlobals = typeof globalThis & {
  __nifferPool?: Pool;
  __nifferDb?: NeonDatabase;
  __nifferDbReady?: Promise<void>;
};

function getPool(): Pool {
  const globals = globalThis as DbGlobals;
  if (globals.__nifferPool) return globals.__nifferPool;
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error('DATABASE_URL haijawekwa.');
  const pool = new Pool({ connectionString, max: 5, idleTimeoutMillis: 5_000, connectionTimeoutMillis: 10_000 });
  globals.__nifferPool = pool;
  return pool;
}

export function getDb(): NeonDatabase {
  const globals = globalThis as DbGlobals;
  return (globals.__nifferDb ??= new NeonDatabase(getPool()));
}

/** Create PostgreSQL schema and seed once per warm serverless instance. */
export async function ensureDatabaseReady(): Promise<void> {
  const globals = globalThis as DbGlobals;
  if (globals.__nifferDbReady) return globals.__nifferDbReady;
  const pool = getPool();
  globals.__nifferDbReady = (async () => {
    const statements = SCHEMA.split(';').map((sql) => sql.trim()).filter(Boolean);
    for (const statement of statements) await pool.query(statement);
    await migrate(pool);
    await seed(pool);
  })().catch((error) => {
    globals.__nifferDbReady = undefined;
    throw error;
  });
  return globals.__nifferDbReady;
}

async function migrate(pool: Pool): Promise<void> {
  await pool.query(`UPDATE gift_cards
    SET expires_at = (created_at::timestamptz + INTERVAL '1 year')::text
    WHERE expires_at IS NULL`);
  for (const promo of promoCodes) {
    await pool.query(
      `INSERT INTO promo_codes (code, label, percent_off, free_shipping, min_subtotal_tsh, active, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT (code) DO NOTHING`,
      [promo.code, promo.label, promo.percentOff ?? null, promo.freeShipping ? 1 : 0, promo.minSubtotalTsh ?? null, promo.active ? 1 : 0, nowIso()],
    );
  }
}

async function seed(pool: Pool): Promise<void> {
  const now = nowIso();
  for (const p of catalogProducts) {
    await pool.query(
      `INSERT INTO products (slug,id,name,category,price_tsh,compare_at_tsh,short_description,description,ingredients,how_to_use,rating,review_count,stock_base,badges,image,image_alt,region,city,updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)
       ON CONFLICT (slug) DO NOTHING`,
      [p.slug,p.id,p.name,p.category,p.priceTsh,nul(p.compareAtTsh),p.shortDescription,p.description,p.ingredients,p.howToUse,p.rating,p.reviewCount,p.stock,JSON.stringify(p.badges ?? []),p.image,p.imageAlt,p.region ?? '',p.city ?? '',now],
    );
    if (p.region) await pool.query("UPDATE products SET region=$1,city=$2 WHERE slug=$3 AND region=''", [p.region,p.city ?? '',p.slug]);
    await pool.query('INSERT INTO stock (slug,qty,updated_at) VALUES ($1,$2,$3) ON CONFLICT (slug) DO NOTHING', [p.slug,p.stock,now]);
  }
  for (const review of catalogReviews) {
    await pool.query(
      `INSERT INTO reviews (id,customer_name,location,rating,comment,product_slug,status,created_at)
       VALUES ($1,$2,$3,$4,$5,$6,'approved',$7) ON CONFLICT (id) DO NOTHING`,
      [review.id,review.customerName,review.location,review.rating,review.comment,review.productSlug,now],
    );
  }
}
/** Safisha oda za demo (haipo kwenye DB â€” zinatokana na `demoOrders()`). */
export function isDemoCode(code: string): boolean {
  return /^NCF-[A-Z0-9]{4}$/.test(code.trim().toUpperCase());
}
