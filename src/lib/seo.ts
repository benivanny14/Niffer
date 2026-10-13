import { site } from "@/lib/site";

export const baseUrl = "https://niffercosmetics.co.tz";

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "CosmeticsStore",
    name: site.name,
    description:
      "Bidhaa za urembo halisi: skincare, makeup, na huduma za nywele — Tanzania.",
    url: baseUrl,
    telephone: site.phoneTel,
    email: site.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address,
      addressLocality: "Dar es Salaam",
      addressCountry: "TZ",
    },
    openingHours: "Mo-Sa 09:00-20:00",
    sameAs: [
      site.socials.instagram,
      site.socials.tiktok,
      site.socials.facebook,
    ],
  };
}

export function productJsonLd(product: {
  name: string;
  slug: string;
  shortDescription: string;
  priceTsh: number;
  compareAtTsh?: number;
  image: string;
  rating: number;
  reviewCount: number;
  brand?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.shortDescription,
    image: `${baseUrl}${product.image}`,
    brand: { "@type": "Brand", name: product.brand ?? site.name },
    offers: {
      "@type": "Offer",
      url: `${baseUrl}/bidhaa/${product.slug}`,
      priceCurrency: "TZS",
      price: product.priceTsh,
      availability: "https://schema.org/InStock",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: product.rating,
      reviewCount: product.reviewCount,
    },
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${baseUrl}${item.path}`,
    })),
  };
}

export function articleJsonLd(article: {
  title: string;
  slug: string;
  excerpt: string;
  date?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    url: `${baseUrl}/makala/${article.slug}`,
    mainEntityOfPage: `${baseUrl}/makala/${article.slug}`,
    author: { "@type": "Organization", name: site.name },
    publisher: {
      "@type": "Organization",
      name: site.name,
      url: baseUrl,
    },
    ...(article.date ? { datePublished: article.date } : {}),
  };
}
