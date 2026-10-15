import Link from "next/link";
import { categories } from "@/lib/data/catalog";
import { site } from "@/lib/site";
import {
  ChatIcon,
  FacebookIcon,
  InstagramIcon,
  PhoneIcon,
  SparkleIcon,
  TiktokIcon,
} from "@/components/ui/icons";

const serviceLinks = [
  { href: "/kuhusu", label: "About Niffer" },
  { href: "/usafirishaji", label: "Shipping & Payments" },
  { href: "/marejesho", label: "Returns" },
  { href: "/maswali", label: "FAQs" },
  { href: "/fuatilia", label: "Track Your Order" },
  { href: "/hakiki", label: "Customer Reviews" },
  { href: "/upendwa", label: "Your Wishlist" },
];

const exploreLinks = [
  { href: "/makala", label: "Beauty Journal" },
  { href: "/ofa", label: "Offers & Discounts" },
  { href: "/zawadi", label: "Gift Cards" },
  { href: "/jumla", label: "Wholesale" },
  { href: "/jumla/ombi", label: "Track a Quote" },
  { href: "/matawi", label: "Our Locations" },
  { href: "/swali", label: "Routine Quiz" },
  { href: "/harufu", label: "Find a Fragrance" },
];

export function SiteFooter() {
  return (
    <footer id="wasiliana" className="site-footer border-t border-cream-300">
        <div className="site-footer__main container-x grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <div className="max-w-xs">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-accent ring-1 ring-brand-200">
              <SparkleIcon className="h-5 w-5" />
            </span>
            <span className="flex flex-col leading-none">
              <span className="font-display text-xl font-semibold text-ink-900">Niffer</span>
              <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gold-600">
                Cosmetics
              </span>
            </span>
          </Link>
          <p className="mt-4 text-sm leading-relaxed text-ink-500">
            Thoughtfully selected skincare, makeup, haircare and more.
            We deliver across Tanzania with friendly, attentive service.
          </p>
        </div>

        <nav aria-label="Categories">
          <p className="eyebrow">Categories</p>
          <ul className="mt-4 space-y-2.5">
            {categories.map((category) => (
              <li key={category.slug}>
                <Link
                  href={`/bidhaa?kategoria=${category.slug}`}
                  className="text-sm text-ink-500 transition-colors hover:text-accent"
                >
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Customer service">
          <p className="eyebrow">Customer service</p>
          <ul className="mt-4 space-y-2.5">
            {serviceLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-ink-500 transition-colors hover:text-accent"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Explore">
          <p className="eyebrow">Explore</p>
          <ul className="mt-4 space-y-2.5">
            {exploreLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-ink-500 transition-colors hover:text-accent"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <p className="eyebrow">Contact us</p>
          <ul className="mt-4 space-y-3">
            <li className="flex items-start gap-2.5 text-sm text-ink-500">
              <PhoneIcon className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
              <a href={`tel:${site.phoneTel}`} className="transition-colors hover:text-accent">
                {site.phoneDisplay}
              </a>
            </li>
            <li className="flex items-start gap-2.5 text-sm text-ink-500">
              <ChatIcon className="mt-0.5 h-4 w-4 shrink-0 text-success-600" />
              <a
                href={`https://wa.me/${site.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-accent"
              >
                Order on WhatsApp
              </a>
            </li>
            <li className="text-sm text-ink-500">
              {site.address}
              <br />
              {site.hours}
            </li>
          </ul>
          <div className="mt-5 flex flex-wrap gap-2">
            {['M-Pesa', 'Mixx by Yas', 'Airtel Money', 'Pay on delivery'].map((method) => (
              <span
                key={method}
                className="rounded-full border border-cream-300 bg-surface px-3 py-1 text-xs font-medium text-ink-500"
              >
                {method}
              </span>
            ))}
          </div>
          <div className="mt-5 flex gap-2">
            <a
              href={site.socials.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="rounded-full border border-cream-300 bg-surface p-2 text-ink-500 transition-colors hover:text-accent"
            >
              <InstagramIcon className="h-4.5 w-4.5" />
            </a>
            <a
              href={site.socials.tiktok}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok"
              className="rounded-full border border-cream-300 bg-surface p-2 text-ink-500 transition-colors hover:text-accent"
            >
              <TiktokIcon className="h-4.5 w-4.5" />
            </a>
            <a
              href={site.socials.facebook}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="rounded-full border border-cream-300 bg-surface p-2 text-ink-500 transition-colors hover:text-accent"
            >
              <FacebookIcon className="h-4.5 w-4.5" />
            </a>
          </div>
        </div>
      </div>

      <div className="site-footer__bottom border-t border-cream-300">
        <div className="container-x flex flex-col items-center justify-between gap-2 py-5 text-xs text-ink-400 sm:flex-row">
          <p>© 2026 Niffer Cosmetics. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/akaunti" className="hover:text-accent">Account</Link>
            <span>All prices are in Tanzanian Shillings (TSh)</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
