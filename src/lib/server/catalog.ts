import { getDb } from "@/lib/server/db";
import {
  products as catalogProducts,
  type CategorySlug,
  type Product,
  type ProductBadge,
} from "@/lib/data/catalog";
import { articles, type Article } from "@/lib/data/articles";
import { getStockMap } from "@/lib/server/orders";

/**
 * Katalogi ya server — DB ndio mwanzo wa ukweli (admin anaweza kurekebisha
 * bei, jina na picha kupitia dashibodi). Mdunzo wa code hutumika kama fallback
 * kwa DB mpya/tupu.
 */

type ProductRow = {
  slug: string;
  id: string;
  name: string;
  category: string;
  price_tsh: number;
  compare_at_tsh: number | null;
  short_description: string;
  description: string;
  ingredients: string;
  how_to_use: string;
  rating: number;
  review_count: number;
  stock_base: number;
  badges: string;
  image: string;
  image_alt: string;
  region: string;
  city: string;
  updated_at: string;
};

function rowToProduct(row: ProductRow): Product {
  let badges: ProductBadge[] = [];
  try {
    const parsed = JSON.parse(row.badges ?? "[]");
    if (Array.isArray(parsed)) badges = parsed as ProductBadge[];
  } catch {
    badges = [];
  }
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: row.category as CategorySlug,
    priceTsh: row.price_tsh,
    compareAtTsh: row.compare_at_tsh ?? undefined,
    shortDescription: row.short_description,
    description: row.description,
    ingredients: row.ingredients,
    howToUse: row.how_to_use,
    rating: row.rating,
    reviewCount: row.review_count,
    stock: row.stock_base,
    badges,
    image: row.image,
    imageAlt: row.image_alt,
    region: row.region || undefined,
    city: row.city || undefined,
  };
}

/** Bidhaa zote (DB) pamoja na stoo halisi — mpangilio wa asili wa katalogi. */
export async function listProducts(): Promise<Product[]> {
  let rows: ProductRow[] = [];
  try {
    rows = await getDb()
      .prepare("SELECT * FROM products ORDER BY updated_at, slug")
      .all() as ProductRow[];
  } catch {
    rows = [];
  }

  const base = rows.length > 0 ? rows.map(rowToProduct) : catalogProducts;
  const stock = await getStockMap();
  return base.map((p) => ({ ...p, stock: stock[p.slug] ?? p.stock }));
}

/** Bidhaa moja kutoka DB. */
export async function findProduct(slug: string): Promise<Product | undefined> {
  try {
    const row = await getDb()
      .prepare("SELECT * FROM products WHERE slug = ?")
      .get(slug) as ProductRow | undefined;
    if (row) {
      const stock = (await getStockMap())[slug];
      const product = rowToProduct(row);
      return { ...product, stock: stock ?? product.stock };
    }
  } catch {
    /* DB haijasoma — angalia fallback */
  }
  const fallback = catalogProducts.find((p) => p.slug === slug);
  if (!fallback) return undefined;
  const stock = (await getStockMap())[fallback.slug];
  return { ...fallback, stock: stock ?? fallback.stock };
}

export type SearchResult =
  | { type: "product"; slug: string; name: string; hint: string; href: string }
  | { type: "article"; slug: string; name: string; hint: string; href: string };

const norm = (value: string) => value.toLowerCase().trim();

/** Utafitaji kwenye bidhaa (DB) na makala (kupitia API). */
export async function searchCatalog(query: string, limit = 24): Promise<SearchResult[]> {
  const q = norm(query);
  if (!q) return [];

  const terms = q.split(/\s+/).filter(Boolean);
  const score = (haystack: string) => {
    const target = norm(haystack);
    let total = 0;
    for (const term of terms) {
      if (target.includes(term)) total += term.length;
      else return 0;
    }
    return total;
  };

  const productHits = (await listProducts())
    .map((p) => ({
      p,
      value: score(
        `${p.name} ${p.category} ${p.shortDescription} ${p.description} ${p.ingredients}`,
      ),
    }))
    .filter((hit) => hit.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, limit)
    .map<SearchResult>(({ p }) => ({
      type: "product",
      slug: p.slug,
      name: p.name,
      hint: p.shortDescription,
      href: `/bidhaa/${p.slug}`,
    }));

  const articleHits = articles
    .map((a) => ({
      a,
      value: score(`${a.title} ${a.excerpt} ${a.category}`),
    }))
    .filter((hit) => hit.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, Math.max(3, Math.floor(limit / 3)))
    .map<SearchResult>(({ a }) => ({
      type: "article",
      slug: a.slug,
      name: a.title,
      hint: a.excerpt,
      href: `/makala/${a.slug}`,
    }));

  return [...productHits, ...articleHits].slice(0, limit);
}

/** Takwimu za haraka kwa dashibodi. */
export async function catalogStats(list?: Product[]): Promise<{
  productCount: number;
  articleCount: number;
}> {
  if (list) return { productCount: list.length, articleCount: articles.length };
  try {
    const row = await getDb()
      .prepare("SELECT count(*) AS c FROM products")
      .get() as { c: string | number } | undefined;
    return { productCount: Number(row?.c ?? catalogProducts.length), articleCount: articles.length };
  } catch {
    return { productCount: catalogProducts.length, articleCount: articles.length };
  }
}

export type { Article };
