import type { Metadata } from "next";
import Link from "next/link";
import {
  articleCategories,
  articles,
  formatDate,
  type Article,
} from "@/lib/data/articles";
import { ProductImage } from "@/components/media/ProductImage";
import { ArrowRightIcon } from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "Makala za Urembo",
  description:
    "Mwongozo wa Kiswahili wa skincare, makeup, nywele na harufu kutoka kwa wataalamu wa Niffer Cosmetics.",
};

const categoryNames = Object.fromEntries(
  articleCategories.map((c) => [c.slug, c.name]),
) as Record<Article["category"], string>;

export default function MakalaPage() {
  const [featured, ...rest] = [...articles].sort(
    (a, b) => Date.parse(b.date) - Date.parse(a.date),
  );

  return (
    <div className="container-x py-12 lg:py-16">
      <p className="eyebrow">Jarida la Niffer</p>
      <h1 className="heading-display mt-2">Makala za urembo</h1>
      <p className="mt-3 max-w-2xl text-ink-500">
        Mwongozo wa Kiswahili wa skincare, makeup, nywele na harufu — ulioandikwa
        na wataalamu wetu wa urembo.
      </p>

      {/* Makala kuu */}
      {featured ? (
        <Link
          href={`/makala/${featured.slug}`}
          className="card group mt-10 grid overflow-hidden md:grid-cols-2"
        >
          <div className="relative aspect-video bg-gradient-to-br from-brand-200 via-cream-200 to-gold-100 md:aspect-auto md:min-h-72">
            <ProductImage
              src={featured.image}
              alt={featured.title}
              className="absolute inset-0 h-full w-full"
            />
          </div>
          <div className="flex flex-col justify-center p-7">
            <p className="eyebrow">
              {categoryNames[featured.category]} · {formatDate(featured.date)}
            </p>
            <h2 className="mt-2 font-display text-2xl leading-snug text-ink-900 group-hover:text-brand-700">
              {featured.title}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-500">
              {featured.excerpt}
            </p>
            <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700">
              Soma zaidi
              <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>
        </Link>
      ) : null}

      {/* Orodha */}
      <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {rest.map((article) => (
          <li key={article.slug}>
            <Link
              href={`/makala/${article.slug}`}
              className="card group flex h-full flex-col overflow-hidden"
            >
              <div className="relative aspect-video bg-gradient-to-br from-brand-100 via-cream-200 to-gold-100">
                <ProductImage
                  src={article.image}
                  alt={article.title}
                  className="absolute inset-0 h-full w-full"
                />
              </div>
              <div className="flex flex-1 flex-col gap-2 p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-gold-600">
                  {categoryNames[article.category]} · {article.readMinutes} dakika
                </p>
                <h2 className="font-display text-lg leading-snug text-ink-900 group-hover:text-brand-700">
                  {article.title}
                </h2>
                <p className="text-sm text-ink-500">{article.excerpt}</p>
                <p className="mt-auto pt-3 text-xs text-ink-400">
                  {article.author} · {formatDate(article.date)}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
