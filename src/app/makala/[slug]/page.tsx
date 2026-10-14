import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  articles,
  formatDate,
  getArticleBySlug,
} from "@/lib/data/articles";
import { getProductBySlug } from "@/lib/data/catalog";
import { formatTsh } from "@/lib/format";
import { articleJsonLd, breadcrumbJsonLd } from "@/lib/seo";
import { ProductImage } from "@/components/media/ProductImage";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { ArrowRightIcon } from "@/components/ui/icons";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return articles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return { title: "Article not found" };
  return {
    title: article.title,
    description: article.excerpt,
    alternates: { canonical: `/makala/${article.slug}` },
    openGraph: {
      type: "article",
      locale: "en_TZ",
      siteName: "Niffer Cosmetics",
      title: article.title,
      description: article.excerpt,
      publishedTime: article.date,
      images: [{ url: article.image, width: 1200, height: 630 }],
    },
  };
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();

  const related = article.relatedProductSlugs
    .map((s) => getProductBySlug(s))
    .filter((p): p is NonNullable<typeof p> => p !== undefined);
  const others = articles
    .filter((a) => a.slug !== article.slug)
    .slice(0, 3);

  return (
    <div className="container-x max-w-3xl py-12 lg:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleJsonLd(article)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Home", path: "/" },
              { name: "Journal", path: "/makala" },
              { name: article.title, path: `/makala/${article.slug}` },
            ]),
          ),
        }}
      />
      <nav aria-label="Breadcrumb" className="text-sm text-ink-400">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link href="/" className="hover:text-accent">
              Home
            </Link>
          </li>
          <li aria-hidden>›</li>
          <li>
            <Link href="/makala" className="hover:text-accent">
              Articles
            </Link>
          </li>
          <li aria-hidden>›</li>
          <li className="text-ink-700">{article.title}</li>
        </ol>
      </nav>

      <article className="mt-8">
        <p className="eyebrow">
          {article.category} · {formatDate(article.date)}
        </p>
        <h1 className="heading-display mt-2">{article.title}</h1>
        <p className="mt-3 text-sm text-ink-400">
          {article.author} · {article.readMinutes} min read
        </p>

        <div className="relative mt-8 aspect-video overflow-hidden rounded-2xl border border-cream-300 bg-cream-200">
          <ProductImage
            src={article.image}
            alt={article.title}
            className="absolute inset-0 h-full w-full"
            priority
          />
        </div>

        <div className="mt-10 space-y-6">
          {article.body.map((block, i) => (
            <div key={i}>
              {block.heading ? (
                <h2 className="mb-2 font-display text-2xl text-ink-900">
                  {block.heading}
                </h2>
              ) : null}
              <p className="leading-relaxed text-ink-500">{block.paragraph}</p>
            </div>
          ))}
        </div>
      </article>

      {/* Related products */}
      {related.length > 0 ? (
        <section className="mt-14 border-t border-cream-300 pt-10">
          <h2 className="font-display text-2xl text-ink-900">
            Products mentioned in this article
          </h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2">
            {related.map((product) => (
              <li
                key={product.id}
                className="card flex items-center gap-4 p-4"
              >
                <Link
                  href={`/bidhaa/${product.slug}`}
                  className="h-20 w-16 shrink-0 overflow-hidden rounded-xl border border-cream-300"
                >
                  <ProductImage
                    src={product.image}
                    alt={product.imageAlt}
                    className="h-full w-full"
                  />
                </Link>
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/bidhaa/${product.slug}`}
                    className="block truncate text-sm font-semibold text-ink-900 hover:text-accent"
                  >
                    {product.name}
                  </Link>
                  <p className="mt-0.5 text-sm font-semibold text-accent">
                    {formatTsh(product.priceTsh)}
                  </p>
                </div>
                <AddToCartButton
                  slug={product.slug}
                  compact
                  disabled={product.stock === 0}
                  className="shrink-0"
                />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* More articles */}
      <section className="mt-14 border-t border-cream-300 pt-10">
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-display text-2xl text-ink-900">
            More articles
          </h2>
          <Link
            href="/makala"
            className="group inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:text-accent"
          >
                  All articles
            <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
        <ul className="mt-6 grid gap-4 sm:grid-cols-3">
          {others.map((other) => (
            <li key={other.slug}>
              <Link
                href={`/makala/${other.slug}`}
                className="card group flex h-full flex-col overflow-hidden"
              >
                <div className="relative aspect-video bg-cream-200">
                  <ProductImage
                    src={other.image}
                    alt={other.title}
                    className="absolute inset-0 h-full w-full"
                  />
                </div>
                <div className="flex flex-1 flex-col gap-1.5 p-4">
                  <h3 className="font-display text-base leading-snug text-ink-900 group-hover:text-accent">
                    {other.title}
                  </h3>
                  <p className="mt-auto pt-2 text-xs text-ink-400">
                    {formatDate(other.date)}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
