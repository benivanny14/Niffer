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
import { InstagramShowcase } from "@/components/instagram/InstagramShowcase";
import { RatingStars } from "@/components/ui/RatingStars";
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
  await connection();
  const products = await listProducts();
  const onSale = products.filter((p) => p.compareAtTsh);
  const freshIn = products.filter((p) => p.badges.includes("new"));
  const reviews = await listReviews(8);
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
              <p className="hero-editorial__kicker"><span /> Urembo uliochaguliwa kwa ajili yako</p>
              <h1 className="mt-6 max-w-xl font-display text-4xl leading-[0.98] tracking-[-0.04em] sm:text-5xl lg:text-[4.4rem]">
                Jitunze kwa <em>upendo.</em><br />Ang&apos;aa kwa uhakika.
              </h1>
              <p className="mt-6 max-w-lg text-base leading-relaxed text-white/75 sm:text-lg">
                Skincare, makeup na bidhaa za nywele tulizochagua kwa uangalifu. Ubora unaouamini, huduma iliyo karibu nawe.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/bidhaa" className="hero-editorial__button">
                  Gundua bidhaa <ArrowRightIcon className="h-4 w-4" />
                </Link>
                <Link href="#video" className="hero-editorial__text-link">
                  <PlayIcon className="h-3.5 w-3.5" /> Vidokezo vya urembo
                </Link>
              </div>
              <div className="hero-editorial__proof mt-10">
                <span className="hero-editorial__proof-mark"><SparkleIcon className="h-4 w-4" /></span>
                <p><strong>Chaguo lako, huduma yetu.</strong><br /><span>Malipo salama · Tunafikisha Tanzania nzima</span></p>
              </div>
            </div>
            <div className="hero-editorial__visual animate-fade-in">
              <div className="hero-editorial__image-wrap">
                <ProductImage src="/images/packs/pack-135k-qe.jpg" alt="Purest Glow Pack ya Niffer Cosmetics" priority className="hero-editorial__image" />
                <div className="hero-editorial__image-caption"><span>Ritual ya kila siku</span><strong>Purest Glow Pack</strong></div>
              </div>
              <Link href="/bidhaa/mwanachuo-pack-45k" className="hero-editorial__float-card">
                <span className="hero-editorial__float-icon"><SparkleIcon className="h-4 w-4" /></span>
                <span><small>Inayopendwa</small><strong>Mwanachuo Pack</strong><b>{formatTsh(45000)}</b></span>
                <ArrowRightIcon className="ml-auto h-4 w-4" />
              </Link>
              <span className="hero-editorial__seal" aria-hidden="true">Niffer<br /><i>beauty</i></span>
            </div>
          </div>
          <div className="hero-editorial__bottomline">
            <span>Skincare</span><i /> <span>Makeup</span><i /> <span>Body care</span><i /> <span>Nywele</span>
            <Link href="/bidhaa">Tazama duka lote <ArrowRightIcon className="h-3.5 w-3.5" /></Link>
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
            <p className="eyebrow">Vinjari</p>
            <h2 className="heading-display mt-2">Kategoria zetu</h2>
          </div>
          <Link href="/bidhaa" className="group inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:text-accent">
            Ona bidhaa zote
            <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        <ul className="category-grid mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <li key={category.slug}>
              <Link href={`/bidhaa?kategoria=${category.slug}`} className="category-tile card group flex h-full flex-col justify-between overflow-hidden p-6">
                <div className={`category-tile__swatch -mx-6 -mt-6 mb-5 h-28 border-b border-cream-300 ${category.swatch}`} aria-hidden />
                <div>
                  <span className="eyebrow">Niffer edit</span>
                  <h3 className="mt-2 font-display text-2xl text-ink-900">{category.name}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-500">{category.description}</p>
                </div>
                <div className="mt-5 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wide text-ink-400">
                    Bidhaa {categoryCounts.get(category.slug) ?? 0}
                  </span>
                  <ArrowRightIcon className="h-4 w-4 text-accent transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <InstagramShowcase />

      <section id="bidhaa" className="product-showcase scroll-mt-24 bg-cream-100 py-16 lg:py-24">
        <div className="container-x">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Chaguo la wateja</p>
              <h2 className="heading-display mt-2">Bidhaa maarufu</h2>
            </div>
            <Link href="/bidhaa" className="group inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:text-accent">
              Vinjari kategoria
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
              Tazama bidhaa zote {products.length}
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
                Punguzo la muda
              </p>
              <h2 className="heading-display mt-4 text-white!">Ofa maalum wiki hii</h2>
              <p className="mt-3 text-white/80">
                Punguza hadi 18% kwa bidhaa zilizochaguliwa. Usikose — stoo ni ndogo kwa baadhi ya bidhaa.
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
              <p className="eyebrow">Zilizofika hivi karibuni</p>
              <h2 className="heading-display mt-2">Bidhaa mpya</h2>
            </div>
            <Link href="/bidhaa?kipengele=mpya" className="group inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:text-accent">
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

      <section id="video" className="scroll-mt-24 bg-cream-100 py-16 lg:py-24">
        <div className="container-x">
          <div>
            <p className="eyebrow">Funika ndani</p>
            <h2 className="heading-display mt-2">Video za urembo</h2>
            <p className="mt-3 max-w-2xl text-ink-500">
              Mwongozo wa matumizi, rutini za kila siku na vidokezo kutoka kwa wataalamu wetu wa urembo.
            </p>
          </div>

          <VideoGallery videos={beautyVideos} />
        </div>
      </section>

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
                <blockquote className="text-sm leading-relaxed text-ink-700">“{review.comment}”</blockquote>
                <figcaption className="mt-auto pt-2 text-sm">
                  <span className="font-semibold text-ink-900">{review.customerName}</span>
                  <span className="text-ink-400"> · {review.location}</span>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </section>

      {latest.length > 0 ? (
        <section id="makala" className="scroll-mt-24 bg-cream-100 py-16 lg:py-24">
          <div className="container-x">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="eyebrow">Jarida la Niffer</p>
                <h2 className="heading-display mt-2">Makala za urembo</h2>
                <p className="mt-3 max-w-2xl text-ink-500">
                  Mwongozo wa Kiswahili wa skincare, makeup, nywele na harufu — ulioandikwa na wataalamu wetu.
                </p>
              </div>
              <Link href="/makala" className="group inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:text-accent">
                Soma zote
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
                        {article.readMinutes} dakika za kusoma
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
            <p className="eyebrow">Jarida la Niffer</p>
            <h2 className="heading-display mt-2 text-3xl sm:text-4xl">
              Pokea ofa na vidokezo kwa barua pepe
            </h2>
            <p className="mt-3 max-w-md text-ink-500">
              Jiunge na wateja 10,000+ wanaopata punguzo maalum, bidhaa mpya, na mwongozo wa urembo kwa Kiswahili.
            </p>
          </div>
          <NewsletterForm />
        </div>
      </section>

      <section className="border-t border-cream-300 bg-gold-100">
        <div className="container-x flex flex-col items-center gap-6 py-16 text-center">
          <SparkleIcon className="h-10 w-10 text-brand-600" />
          <h2 className="heading-display max-w-2xl">Tayari kuanza safari yako ya urembo?</h2>
          <p className="max-w-xl text-ink-500">
            Piga simu, tuma WhatsApp, au vinjari duka letu mtandaoni. Tunakusaidia kuchagua bidhaa zinazokufaa.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/bidhaa" className="btn-primary">
              Nunua sasa
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
            <a href={waLink("Habari Niffer Cosmetics, naomba msaada wa kuchagua bidhaa.")} target="_blank" rel="noopener noreferrer" className="btn-outline">
              <ChatIcon className="h-4 w-4" />
              WhatsApp oda
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
