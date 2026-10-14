import Link from "next/link";
import { connection } from "next/server";
import { beautyVideos } from "@/lib/data/catalog";
import { listCategories, listProducts } from "@/lib/server/catalog";
import { listReviews } from "@/lib/server/leads";
import { getDb } from "@/lib/server/db";
import { latestArticles, formatDate } from "@/lib/data/articles";
import { formatTsh } from "@/lib/format";
import { ProductCard } from "@/components/catalog/ProductCard";
import { ProductImage } from "@/components/media/ProductImage";
import { VideoGallery } from "@/components/media/VideoGallery";
import { NewsletterForm } from "@/components/ui/NewsletterForm";
import { waLink } from "@/lib/site";
import {
  ArrowRightIcon,
  ChatIcon,
  PlayIcon,
  ShieldIcon,
  SparkleIcon,
  TagIcon,
  TruckIcon,
} from "@/components/ui/icons";

const trustPoints = [
  {
    icon: TruckIcon,
    title: "Fast delivery",
    description: "Dar es Salaam in 1–2 days · delivery across Tanzania",
  },
  {
    icon: ShieldIcon,
    title: "Product details you can trust",
    description: "Review prices, photos and details before you order",
  },
  {
    icon: ChatIcon,
    title: "Secure payments",
    description: "M-Pesa, Mixx by Yas, Airtel Money or cash on delivery",
  },
  {
    icon: TagIcon,
    title: "Great value",
    description: "Explore discounted products on our sale page",
  },
];

export default async function Home() {
  await connection();
  const [products, reviews, profileRow, categories] = await Promise.all([
    listProducts(),
    listReviews(8),
    getDb()
      .prepare("SELECT value FROM meta WHERE key = ?")
      .get("store_admin_profile_image")
      .catch(() => undefined) as Promise<{ value?: string } | undefined>,
    listCategories(),
  ]);
  const storeProfileImage = profileRow?.value ?? "";
  const onSale = products.filter((p) => p.compareAtTsh);
  const freshIn = products.filter((p) => p.badges.includes("new"));
  const latest = latestArticles(3);
  const categoryCounts = new Map<string, number>();
  for (const p of products) {
    categoryCounts.set(p.category, (categoryCounts.get(p.category) ?? 0) + 1);
  }

  return (
    <>
      <section className="hero-editorial relative overflow-hidden py-8 sm:py-12 lg:py-16">
        <div className="container-x">
          <div className="hero-editorial__frame">
            <div className="hero-editorial__copy animate-fade-up">
              <p className="hero-editorial__kicker"><span /> Beauty, carefully chosen for you</p>
              <h1 className="mt-6 max-w-xl font-display text-4xl leading-[0.98] tracking-[-0.04em] sm:text-5xl lg:text-[4.4rem]">
                Care for your skin.<br /><em>Feel like yourself.</em>
              </h1>
              <p className="mt-6 max-w-lg text-base leading-relaxed text-white/75 sm:text-lg">
                Thoughtfully selected skincare, makeup and haircare. Quality you can trust, with friendly local service.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/bidhaa" className="hero-editorial__button">
                  Shop products <ArrowRightIcon className="h-4 w-4" />
                </Link>
                <Link href="#video" className="hero-editorial__text-link">
                  <PlayIcon className="h-3.5 w-3.5" /> Beauty tips
                </Link>
              </div>
              <div className="hero-editorial__proof mt-10">
                <span className="hero-editorial__proof-mark"><SparkleIcon className="h-4 w-4" /></span>
                <p><strong>Your choice, our care.</strong><br /><span>Secure payments · Delivery across Tanzania</span></p>
              </div>
            </div>
            <div className="hero-editorial__visual animate-fade-in">
              <div className="hero-editorial__image-wrap">
                <ProductImage
                  src={storeProfileImage || "/images/packs/pack-135k-qe.jpg"}
                  alt={storeProfileImage ? "Niffer Cosmetics profile" : "Purest Glow Pack by Niffer Cosmetics"}
                  priority
                  className="hero-editorial__image"
                />
                <div className="hero-editorial__image-caption">
                  <span>{storeProfileImage ? "Our store" : "Everyday essentials"}</span>
                  <strong>{storeProfileImage ? "Niffer Cosmetics" : "Purest Glow Pack"}</strong>
                </div>
              </div>
              <Link href="/bidhaa/mwanachuo-pack-45k" className="hero-editorial__float-card">
                <span className="hero-editorial__float-icon"><SparkleIcon className="h-4 w-4" /></span>
                <span><small>Customer favorite</small><strong>Mwanachuo Pack</strong><b>{formatTsh(45000)}</b></span>
                <ArrowRightIcon className="ml-auto h-4 w-4" />
              </Link>
              <span className="hero-editorial__seal" aria-hidden="true">Niffer<br /><i>beauty</i></span>
            </div>
          </div>
          <div className="hero-editorial__bottomline">
            <span>Skincare</span><i /> <span>Makeup</span><i /> <span>Body care</span><i /> <span>Haircare</span>
            <Link href="/bidhaa">Explore the store <ArrowRightIcon className="h-3.5 w-3.5" /></Link>
          </div>
        </div>
      </section>

      <section className="trust-strip border-y border-cream-300 bg-cream-100/80">
        <div className="container-x grid gap-5 py-7 sm:grid-cols-2 lg:grid-cols-4">
          {trustPoints.map(({ icon: Icon, title, description }) => (
            <div key={title} className="trust-strip__item flex items-start gap-3 rounded-2xl border border-transparent p-2">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-100 text-accent ring-1 ring-brand-200">
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-sm font-semibold text-ink-900">{title}</h3>
                <p className="mt-0.5 text-sm text-ink-500">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="kategoria" className="category-section container-x scroll-mt-24 py-16 lg:py-24">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Explore</p>
            <h2 className="heading-display mt-2">Shop by category</h2>
          </div>
          <Link href="/bidhaa" className="group inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:text-accent">
            View all products
            <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        <ul className="category-grid mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <li key={category.slug}>
              <Link href={`/bidhaa?kategoria=${category.slug}`} className="category-tile card group flex h-full flex-col justify-between overflow-hidden p-6">
                <div className={`category-tile__swatch -mx-6 -mt-6 mb-5 h-28 border-b border-cream-300 ${category.swatch}`} aria-hidden />
                <div>
                  <span className="eyebrow">Niffer selection</span>
                  <h3 className="mt-2 font-display text-2xl text-ink-900">{category.name}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-500">{category.description}</p>
                </div>
                <div className="mt-5 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wide text-ink-400">
                    {categoryCounts.get(category.slug) ?? 0} products
                  </span>
                  <ArrowRightIcon className="h-4 w-4 text-accent transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>


      <section id="bidhaa" className="product-showcase scroll-mt-24 bg-cream-100 py-16 lg:py-24">
        <div className="container-x">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Customer favorites</p>
              <h2 className="heading-display mt-2">Popular products</h2>
            </div>
            <Link href="/bidhaa" className="group inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:text-accent">
              Browse categories
              <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          <ul className="product-grid mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 2xl:grid-cols-5">
            {products.slice(0, 8).map((product) => (
              <li key={product.id}>
                <ProductCard product={product} />
              </li>
            ))}
          </ul>
          <div className="mt-8 flex justify-center">
            <Link href="/bidhaa" className="btn-outline">
              View all {products.length} products
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {onSale.length > 0 ? (
        <section className="border-y border-ink-900 bg-brand-800 text-white">
          <div className="container-x flex flex-wrap items-center justify-between gap-6 py-12">
            <div className="max-w-xl">
              <p className="inline-flex items-center gap-1.5 rounded-full bg-gold-500 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-on-gold">
                <TagIcon className="h-3.5 w-3.5" />
                Limited-time offer
              </p>
              <h2 className="heading-display mt-4 text-white!">This week’s special offers</h2>
              <p className="mt-3 text-white/80">
                Save up to 18% on selected products. Shop soon while they are still in stock.
              </p>
            </div>
            <ul className="flex flex-wrap gap-3">
              {onSale.map((product) => (
                <li key={product.id}>
                  <Link href={`/bidhaa/${product.slug}`} className="btn-light flex-col rounded-2xl! px-5! py-3! text-left">
                    <span className="text-xs text-ink-500">{product.name}</span>
                    <span className="flex items-baseline gap-2">
                      <span className="font-semibold text-accent">{formatTsh(product.priceTsh)}</span>
                      {product.compareAtTsh ? (
                        <span className="text-xs text-ink-400 line-through">{formatTsh(product.compareAtTsh)}</span>
                      ) : null}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {freshIn.length > 0 ? (
        <section className="container-x py-16 lg:py-24">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Just arrived</p>
              <h2 className="heading-display mt-2">New arrivals</h2>
            </div>
            <Link href="/bidhaa?kipengele=mpya" className="group inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:text-accent">
              View all new arrivals
              <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
          <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {freshIn.map((product) => (
              <li key={product.id}>
                <ProductCard product={product} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section id="video" className="scroll-mt-24 bg-cream-100 py-16 lg:py-24">
        <div className="container-x">
          <div>
            <p className="eyebrow">Learn how to use your products</p>
            <h2 className="heading-display mt-2">Beauty videos</h2>
            <p className="mt-3 max-w-2xl text-ink-500">
              Practical tips for choosing and using beauty products.
            </p>
          </div>

          <VideoGallery videos={beautyVideos} />
        </div>
      </section>

      {reviews.length > 0 ? <section id="maoni" className="container-x scroll-mt-24 py-16 lg:py-24">
        <div className="max-w-2xl">
          <p className="eyebrow">Customer stories</p>
          <h2 className="heading-display mt-2">What customers say</h2>
        </div>
        <ul className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review) => (
            <li key={review.id}>
              <figure className="card flex h-full flex-col gap-3 p-6">
                <div className="text-sm font-medium text-gold-700">{review.rating}/5 · Verified review</div>
                <blockquote className="text-sm leading-relaxed text-ink-700">“{review.comment}”</blockquote>
                <figcaption className="mt-auto pt-2 text-sm">
                  <span className="font-semibold text-ink-900">{review.customerName}</span>
                  <span className="text-ink-400"> · {review.location}</span>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </section> : null}

      {latest.length > 0 ? (
        <section id="makala" className="scroll-mt-24 bg-cream-100 py-16 lg:py-24">
          <div className="container-x">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="eyebrow">The Niffer journal</p>
                <h2 className="heading-display mt-2">Beauty journal</h2>
                <p className="mt-3 max-w-2xl text-ink-500">
                  Helpful reading on skincare, makeup, haircare and fragrance.
                </p>
              </div>
              <Link href="/makala" className="group inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:text-accent">
                Read all articles
                <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
            <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {latest.map((article) => (
                <li key={article.slug}>
                  <Link href={`/makala/${article.slug}`} className="card group flex h-full flex-col overflow-hidden">
                    <div className="relative aspect-video bg-cream-200">
                      <ProductImage src={article.image} alt={article.title} className="absolute inset-0 h-full w-full" />
                    </div>
                    <div className="flex flex-1 flex-col gap-2 p-5">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gold-600">
                        {article.readMinutes} min read
                      </p>
                      <h3 className="font-display text-lg leading-snug text-ink-900 group-hover:text-accent">
                        {article.title}
                      </h3>
                      <p className="text-sm text-ink-500">{article.excerpt}</p>
                      <p className="mt-auto pt-3 text-xs text-ink-400">{formatDate(article.date)}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <section id="jaribio" className="border-t border-cream-300 bg-cream-100 py-16 lg:py-20">
        <div className="container-x grid items-center gap-8 lg:grid-cols-2">
          <div>
            <p className="eyebrow">The Niffer newsletter</p>
            <h2 className="heading-display mt-2 text-3xl sm:text-4xl">
              Offers and beauty tips, in your inbox
            </h2>
            <p className="mt-3 max-w-md text-ink-500">
              Sign up for offers, new arrivals and practical beauty tips.
            </p>
          </div>
          <NewsletterForm />
        </div>
      </section>

      <section className="border-t border-cream-300 bg-gold-100">
        <div className="container-x flex flex-col items-center gap-6 py-16 text-center">
          <SparkleIcon className="h-10 w-10 text-brand-600" />
          <h2 className="heading-display max-w-2xl">Ready to find your new favorites?</h2>
          <p className="max-w-xl text-ink-500">
            Call us, message us on WhatsApp or browse the store. We are happy to help you find what suits you.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/bidhaa" className="btn-primary">
              Shop now
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
            <a href={waLink("Hello Niffer Cosmetics, could you help me choose a product?")} target="_blank" rel="noopener noreferrer" className="btn-outline">
              <ChatIcon className="h-4 w-4" />
              Message us on WhatsApp
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
