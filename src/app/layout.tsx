import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { FloatingActions } from "@/components/ui/FloatingActions";
import { StoreProvider } from "@/lib/store";
import { organizationJsonLd, baseUrl } from "@/lib/seo";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Niffer Cosmetics — Modern Beauty, Exceptional Quality",
    template: "%s | Niffer Cosmetics",
  },
  description:
    "Shop skincare, makeup and haircare at Niffer Cosmetics. We deliver across Tanzania with convenient mobile money payments.",
  keywords: [
    "cosmetics Tanzania",
    "skincare",
    "makeup",
    "beauty products Dar es Salaam",
    "Niffer Cosmetics",
  ],
  openGraph: {
    type: "website",
    locale: "en_TZ",
    siteName: "Niffer Cosmetics",
    title: "Niffer Cosmetics — Modern Beauty, Exceptional Quality",
    description:
      "Thoughtfully selected skincare, makeup and haircare. Great value, secure payments and fast delivery to your door.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Niffer Cosmetics",
    description:
      "Thoughtfully selected skincare, makeup and haircare across Tanzania.",
    images: ["/twitter-image"],
  },
  icons: {
    icon: "/icon.svg",
  },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: [
    { color: "#0f172a" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      translate="no"
      className={`${inter.variable} ${playfair.variable} h-full antialiased notranslate`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col bg-cream-50 text-ink-900">
        <script
          // Enter dark mode KABLA ya render pertama — hakuna flash ya mwanga.
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('niffer.theme');var d=t?t==='dark':true;if(d)document.documentElement.classList.add('dark');}catch(e){document.documentElement.classList.add('dark');}})();`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd()),
          }}
        />
        <StoreProvider>
          <a
            href="#main-content"
            className="sr-only z-100 rounded-full bg-ink-900 px-5 py-2.5 text-sm font-semibold text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
          >
            Skip to content
          </a>
          <SiteHeader />
          <main id="main-content" className="flex-1">
            {children}
          </main>
          <SiteFooter />
        </StoreProvider>
        <FloatingActions />
      </body>
    </html>
  );
}
