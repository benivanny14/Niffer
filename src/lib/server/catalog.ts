import { products, type Product } from "@/lib/data/catalog";
import { articles, type Article } from "@/lib/data/articles";
import { getStockMap } from "@/lib/server/orders";

/** Bidhaa zote na stoo halisi kutoka DB. */
export function listProducts(): Product[] {
  const stock = getStockMap();
  return products.map((p) => ({ ...p, stock: stock[p.slug] ?? p.stock }));
}

export function findProduct(slug: string): Product | undefined {
  const product = products.find((p) => p.slug === slug);
  if (!product) return undefined;
  const stock = getStockMap()[product.slug];
  return { ...product, stock: stock ?? product.stock };
}

export type SearchResult =
  | { type: "product"; slug: string; name: string; hint: string; href: string }
  | { type: "article"; slug: string; name: string; hint: string; href: string };

const norm = (value: string) => value.toLowerCase().trim();

/** Utafitaji kwenye bidhaa na makala (kupitia API). */
export function searchCatalog(query: string, limit = 24): SearchResult[] {
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

  const productHits = products
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
export function catalogStats(): {
  productCount: number;
  articleCount: number;
} {
  return { productCount: products.length, articleCount: articles.length };
}

export type { Article };
