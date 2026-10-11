import type { MetadataRoute } from "next";
import { baseUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/akaunti", "/ukoko", "/odha/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
