import Link from "next/link";
import { connection } from "next/server";
import { beautyVideos, categories } from "@/lib/data/catalog";
import { listProducts } from "@/lib/server/catalog";
import { listReviews } from "@/lib/server/leads";
import { latestArticles, formatDate } from "@/lib/data/articles";
import { formatTsh } from "@/lib/format";
import { ProductCard } from "@/components/catalog/ProductCard";
import { ProductImage } from "@/components/media/ProductImage";
import { VideoGallery } from "@/components/media/VideoGallery";
import { RatingStars } from "@/components/ui/RatingStars";
import { NewsletterForm } from "@/components/ui/NewsletterForm";
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
    title: "Usafirishaji wa haraka",
    description: "Dar es Salaam ndani ya siku 1–2 · mikoa yote ya Tanzania",
  },
  {
    icon: ShieldIcon,
    title: "Bidhaa halisi 100%",
    description: "Tunahakikisha ubora kutoka kwa wasambazaji waliothibitishwa",
  },
  {
    icon: ChatIcon,
    title: "Malipo salama",
    description: "M-Pesa, Mixx by Yas, Airtel Money au malipo poa baada ya kupokea",
  },
  {
    icon: TagIcon,
    title: "Bei za ushindani",
    description: "Punguzo na ofa maalum kwa wateja wetu waaminifu",
  },
];

export default async function Home() {
  // Katalogi na hakiki kutoka DB (admin + wateja) — dynamic render.
  await connection();
  const products = listProducts();
  const onSale = products.filter((p) => p.compareAtTsh);
  const freshIn = products.filter((p) => p.badges.includes("new"));
  const reviews = listReviews(8);
  const latest = latestArticles(3);

  return (
    <>
      {/* ============ HERO ============ */}
      <section className="relative overflow-hidden">
        <div className="container-x grid items-center gap-12 py-16 lg:grid-cols-2 lg:py-24">
          <div className="animate-fade-up">
            <p className="eyebrow">Urembo halisi · Tanzania</p>
            <h1 className="heading-display mt-4">
              Urembo wako, ubora wetu —{" "}
              <span className="text-accent">Niffer Cosmetics</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-500">
              Bidhaa za skincare, makeup na nywele zilizochaguliwa kwa makini.
              Bei nafuu, malipo salama ya mobile money, na usafirishaji wa
              haraka hadi mlangoni kwako.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/bidhaa" className="btn-primary">
                Nunua sasa
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
              <Link href="#video" className="btn-outline">
                <PlayIcon className="h-3.5 w-3.5" />
                Angalia video za urembo
              </Link>
            </div>
            <dl className="mt-10 flex flex-wrap gap-x-10 gap-y-4">
              {[
                ["10k+", "Wateja wenye kuridhika"],
                ["100+", "Bidhaa zilizochaguliwa"],
                ["4.8", "Ukadiriaji wa wateja"],
              ].map(([value, label]) => (
                <div key={label}>
                  <dt className="sr-only">{label}</dt>
                  <dd className="font-display text-3xl font-semibold text-ink-900">
                    {value}
                  </dd>
                  <dd className="mt-1 text-xs uppercase tracking-wide text-ink-400">
                    {label}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative mx-auto aspect-4/5 w-full max-w-md animate-fade-in overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-brand-200 via-cream-200 to-gold-100 lg:aspect-3/4">
            <ProductImage
              src="/images/hero.svg"
              alt="Bidhaa za Niffer Cosmetics"
              priority
              className="h-full w-full"
            />
            <div className="card absolute bottom-6 left-6 right-6 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-gold-600">
                Inayouzwa zaidi
              </p>
              <div className="mt-1 flex items-baseline justify-between gap-3">
                <p className="font-display text-lg text-ink-900">
                  Radiance Vitamin C Serum
                </p>
                <p className="text-sm font-semibold text-accent">
                  {formatTsh(32000)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ TRUST STRIP ============ */}
      <section className="border-y border-cream-300 bg-cream-100">
        <div className="container-x grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
          {trustPoints.map(({ icon: Icon, title, description }) => (
            <div key={title} className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-100 text-accent">
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

      {/* ============ KATEGORIA ============ */}
      <section id="kategoria" className="container-x scroll-mt-24 py-16 lg:py-24">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Vinjari</p>
            <h2 className="heading-display mt-2">Kategoria zetu</h2>
          </div>
          <Link
            href="/bidhaa"
            className="group inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:text-accent"
          >
            Ona bidhaa zote
            <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <li key={category.slug}>
              <Link
                href={`/bidhaa?kategoria=${category.slug}`}
                className="card group flex h-full flex-col justify-between overflow-hidden p-6"
              >
                <div
                  className={`-mx-6 -mt-6 mb-5 h-24 bg-gradient-to-r ${category.gradient}`}
                  aria-hidden
                />
                <div>
                  <h3 className="font-display text-xl text-ink-900">
                    {category.name}
                  </h3>
                  <p className="mt-1.5 text-sm text-ink-500">
                    {category.description}
                  </p>
                </div>
                <div className="mt-5 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wide text-ink-400">
                    Bidhaa {category.productCount}
                  </span>
                  <ArrowRightIcon className="h-4 w-4 text-accent transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* ============ BIDHAA MAARUFU ============ */}
      <section id="bidhaa" className="scroll-mt-24 bg-cream-100 py-16 lg:py-24">
        <div className="container-x">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Chaguo la wateja</p>
              <h2 className="heading-display mt-2">Bidhaa maarufu</h2>
            </div>
            <Link
              href="/bidhaa"
              className="group inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:text-accent"
            >
              Vinjari kategoria
              <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <li key={product.id}>
                <ProductCard product={product} />
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ============ PUNGUZO ============ */}
      {onSale.length > 0 ? (
        <section className="border-y border-cream-300 bg-gradient-to-r from-brand-800 via-brand-700 to-brand-800 text-white">
          <div className="container-x flex flex-wrap items-center justify-between gap-6 py-12">
            <div className="max-w-xl">
              <p className="inline-flex items-center gap-1.5 rounded-full bg-gold-500 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-on-gold">
                <TagIcon className="h-3.5 w-3.5" />
                Punguzo la muda
              </p>
              <h2 className="heading-display mt-4 text-white!">
                Ofa maalum wiki hii
              </h2>
              <p className="mt-3 text-white/80">
                Pungua hadi 18% kwa bidhaa zilizochaguliwa. Usikose — stoo ni
                ndogo kwa baadhi ya bidhaa.
              </p>
            </div>
            <ul className="flex flex-wrap gap-3">
              {onSale.map((product) => (
                <li key={product.id}>
                  <Link
                    href={`/bidhaa/${product.slug}`}
                    className="btn-light flex-col rounded-2xl! px-5! py-3! text-left"
                  >
                    <span className="text-xs text-ink-500">{product.name}</span>
                    <span className="flex items-baseline gap-2">
                      <span className="font-semibold text-accent">
                        {formatTsh(product.priceTsh)}
                      </span>
                      {product.compareAtTsh ? (
                        <span className="text-xs text-ink-400 line-through">
                          {formatTsh(product.compareAtTsh)}
                        </span>
                      ) : null}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {/* ============ MPYA ============ */}
      {freshIn.length > 0 ? (
        <section className="container-x py-16 lg:py-24">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Zilizofika hivi karibuni</p>
              <h2 className="heading-display mt-2">Bidhaa mpya</h2>
            </div>
            <Link
              href="/bidhaa?kipengele=mpya"
              className="group inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:text-accent"
            >
              Zote mpya
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

      {/* ============ VIDEO ============ */}
      <section id="video" className="scroll-mt-24 bg-cream-100 py-16 lg:py-24">
        <div className="container-x">
          <div>
            <p className="eyebrow">Funika ndani</p>
            <h2 className="heading-display mt-2">Video za urembo</h2>
            <p className="mt-3 max-w-2xl text-ink-500">
              Mwongozo wa matumizi, rutini za kila siku na vidokezo kutoka kwa
              wataalamu wetu wa urembo.
            </p>
          </div>

          <VideoGallery videos={beautyVideos} />
        </div>
      </section>

      {/* ============ MAONI ============ */}
      <section id="maoni" className="container-x scroll-mt-24 py-16 lg:py-24">
        <div className="max-w-2xl">
          <p className="eyebrow">Wateja wanavyosema</p>
          <h2 className="heading-display mt-2">Maoni ya wateja</h2>
        </div>
        <ul className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review) => (
            <li key={review.id}>
              <figure className="card flex h-full flex-col gap-3 p-6">
                <RatingStars rating={review.rating} size="md" />
                <blockquote className="text-sm leading-relaxed text-ink-700">
                  “{review.comment}”
                </blockquote>
                <figcaption className="mt-auto pt-2 text-sm">
                  <span className="font-semibold text-ink-900">
                    {review.customerName}
                  </span>
                  <span className="text-ink-400"> · {review.location}</span>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </section>

      {/* ============ MAKALA ============ */}
      {latest.length > 0 ? (
        <section id="makala" className="scroll-mt-24 bg-cream-100 py-16 lg:py-24">
          <div className="container-x">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="eyebrow">Jarida la Niffer</p>
                <h2 className="heading-display mt-2">Makala za urembo</h2>
                <p className="mt-3 max-w-2xl text-ink-500">
                  Mwongozo wa Kiswahili wa skincare, makeup, nywele na harufu —
                  ulioandikwa na wataalamu wetu.
                </p>
              </div>
              <Link
                href="/makala"
                className="group inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:text-accent"
              >
                Soma zote
                <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
            <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {latest.map((article) => (
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
                        {article.readMinutes} dakika za kusoma
                      </p>
                      <h3 className="font-display text-lg leading-snug text-ink-900 group-hover:text-accent">
                        {article.title}
                      </h3>
                      <p className="text-sm text-ink-500">{article.excerpt}</p>
                      <p className="mt-auto pt-3 text-xs text-ink-400">
                        {formatDate(article.date)}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {/* ============ NEWSLETTER ============ */}
      <section id="jaribio" className="border-t border-cream-300 bg-cream-100 py-16 lg:py-20">
        <div className="container-x grid items-center gap-8 lg:grid-cols-2">
          <div>
            <p className="eyebrow">Jarida la Niffer</p>
            <h2 className="heading-display mt-2 text-3xl sm:text-4xl">
              Pokea ofa na vidokezo kwa barua pepe
            </h2>
            <p className="mt-3 max-w-md text-ink-500">
              Jiunge na wateja 10,000+ wanaopata punguzo maalum, bidhaa mpya,
              na mwongozo wa urembo kwa Kiswahili.
            </p>
          </div>
          <NewsletterForm />
        </div>
      </section>

      {/* ============ CTA ============ */}
      <section className="border-t border-cream-300 bg-gradient-to-r from-gold-100 via-cream-200 to-brand-100">
        <div className="container-x flex flex-col items-center gap-6 py-16 text-center">
          <SparkleIcon className="h-10 w-10 text-brand-600" />
          <h2 className="heading-display max-w-2xl">
            Tayari kuanza safari yako ya urembo?
          </h2>
          <p className="max-w-xl text-ink-500">
            Piga simu, tuma WhatsApp, au vinjari duka letu mtandaoni. Tunakusaidia
            kuchagua bidhaa zinazokufaa.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/bidhaa" className="btn-primary">
              Nunua sasa
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
            <a
              href="https://wa.me/255754000000"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline"
            >
              <ChatIcon className="h-4 w-4" />
              WhatsApp oda
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
