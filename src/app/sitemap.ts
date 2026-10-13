import type { MetadataRoute } from "next";
import { products } from "@/lib/data/catalog";
import { articles } from "@/lib/data/articles";
import { baseUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // Kurasa ZINAZOTAFUTWA tu — /fuatilia, /upendwa, /ukoko, /kikapu, /akaunti
  // ni za kibinafsi (noindex), hazitakiwi kwenye sitemap.
  const staticRoutes = [
    "",
    "/bidhaa",
    "/ofa",
    "/zawadi",
    "/jumla",
    "/jumla/ombi",
    "/swali",
    "/harufu",
    "/makala",
    "/hakiki",
    "/matawi",
    "/wasiliana",
    "/kuhusu",
    "/usafirishaji",
    "/marejesho",
    "/maswali",
    "/tafuta",
    "/jarida/acha",
    "/masharti",
    "/faragha",
  ].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.7,
  }));

  const productRoutes = products.map((product) => ({
    url: `${baseUrl}/bidhaa/${product.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const articleRoutes = articles.map((article) => ({
    url: `${baseUrl}/makala/${article.slug}`,
    lastModified: new Date(article.date),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...productRoutes, ...articleRoutes];
}
