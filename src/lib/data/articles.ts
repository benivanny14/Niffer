/** Practical guides to choosing and using beauty products. */

export type Article = {
  slug: string;
  title: string;
  excerpt: string;
  category: "skincare" | "makeup" | "haircare" | "fragrance" | "news";
  author: string;
  date: string;
  readMinutes: number;
  image: string;
  body: { heading?: string; paragraph: string }[];
  relatedProductSlugs: string[];
};

export const articleCategories: { slug: Article["category"]; name: string }[] = [
  { slug: "skincare", name: "Skincare" },
  { slug: "makeup", name: "Makeup" },
  { slug: "haircare", name: "Haircare" },
  { slug: "fragrance", name: "Fragrance" },
  { slug: "news", name: "News" },
];

export const articles: Article[] = [
  {
    slug: "rutini-ya-skincare-ya-asubuhi",
    title: "A simple morning skincare routine",
    excerpt: "Cleansing, moisturising and sun protection make a simple place to start.",
    category: "skincare",
    author: "Niffer Team",
    date: "2026-09-12",
    readMinutes: 4,
    image: "/images/packs/pack-135k-qe.jpg",
    body: [
      { paragraph: "A morning routine does not need many products. Choose a few steps that suit you and follow each product label." },
      { heading: "1. Cleanse gently", paragraph: "Use a cleanser suited to your skin and lukewarm water. Rinse well, then pat your face dry with a clean towel." },
      { heading: "2. Moisturise", paragraph: "If your skin feels dry, apply moisturiser after cleansing. Start with a small amount and add more only if needed." },
      { heading: "3. Apply sunscreen", paragraph: "When outdoors during the day, use sunscreen with SPF 30 or higher as directed. Reapply especially after swimming or sweating." },
      { paragraph: "A new product may not suit every skin type. Test it on a small area first and stop using it if irritation persists." },
    ],
    relatedProductSlugs: ["purest-glow-pack-65k", "purest-glow-pack-100k", "purest-glow-pack-135k"],
  },
  {
    slug: "lipstick-ya-muda-mrefu-hatua-kwa-hatua",
    title: "How to apply lipstick neatly",
    excerpt: "Prep your lips, apply light layers and take your time around the edges.",
    category: "makeup",
    author: "Niffer Team",
    date: "2026-09-28",
    readMinutes: 3,
    image: "/images/packs/pack-200k-glass-skin.jpg",
    body: [
      { paragraph: "Lipstick applies more evenly to clean, prepared lips. Results vary by product and activity, so you may need to reapply." },
      { heading: "1. Prep your lips", paragraph: "Apply a little lip balm if your lips feel dry. Let it settle, then remove any excess before applying colour." },
      { heading: "2. Define the edges", paragraph: "Use a lip liner close to your lipstick shade, or skip this step for a softer look." },
      { heading: "3. Apply lipstick", paragraph: "Apply a thin layer from the centre of your lips. Add another layer if you want more colour." },
      { heading: "4. Blot and tidy", paragraph: "Gently press a tissue between your lips. Check the edges in good light and touch up where needed." },
    ],
    relatedProductSlugs: ["body-pack-200k-glass", "body-pack-245k-rose"],
  },
  {
    slug: "kuchagua-perfume-inayokufaa",
    title: "How to find a fragrance you love",
    excerpt: "Try one fragrance at a time and give it a few minutes before deciding.",
    category: "fragrance",
    author: "Niffer Team",
    date: "2026-10-02",
    readMinutes: 4,
    image: "/images/packs/pack-265k-eos.jpg",
    body: [
      { paragraph: "Fragrance is personal. You may prefer a different scent from your friends, so try it for yourself when possible." },
      { heading: "Start with notes you enjoy", paragraph: "Citrus scents have bright, zesty notes; floral scents suggest flowers; vanilla or woody notes can feel warmer. These are only guides, so try the fragrance itself." },
      { heading: "Test before you buy", paragraph: "If possible, test a small amount on your skin or a tester strip. Give it a few minutes before deciding, and avoid spraying near your eyes or irritated skin." },
      { heading: "Follow the label", paragraph: "Follow the bottle directions. If spraying it on clothing, check the label and test an unseen area first to avoid stains." },
    ],
    relatedProductSlugs: ["body-pack-265k", "body-pack-140k"],
  },
  {
    slug: "nywele-zinazoumiza-5-tiba-za-argan",
    title: "Caring for dry or fragile hair",
    excerpt: "Simple washing and care habits that are gentle on your hair.",
    category: "haircare",
    author: "Niffer Team",
    date: "2026-10-05",
    readMinutes: 4,
    image: "/images/packs/pack-mwanachuo-95k-argan.jpg",
    body: [
      { paragraph: "Dryness or breakage can have different causes. Start with gentle care and choose products for your hair needs." },
      { heading: "Wash gently", paragraph: "Apply shampoo mainly to your scalp and massage with your fingertips. Wash as often as suits your hair and follow the product directions." },
      { heading: "Use conditioner", paragraph: "After shampooing, apply conditioner to the lengths and ends. Leave it on as directed, then rinse." },
      { heading: "Limit heat", paragraph: "If you use heated tools, choose a suitable lower setting and use a heat protectant intended for that purpose." },
      { paragraph: "Argan oils or products may be part of your routine if they suit you. Follow the label; no single product solves every hair concern." },
    ],
    relatedProductSlugs: ["mwanachuo-pack-95k-argan", "body-pack-195k-coffee"],
  },
  {
    slug: "habari-kubwa-niffer-duka-jipya-dar",
    title: "How to order from Niffer Cosmetics",
    excerpt: "Find a product, check the details and choose a convenient way to complete your order.",
    category: "news",
    author: "Niffer Team",
    date: "2026-10-08",
    readMinutes: 2,
    image: "/images/packs/pack-245k-ogx-rose.jpg",
    body: [
      { paragraph: "Search for a product by name or browse a category. Open its page to check details, price, and availability." },
      { heading: "Review your selection", paragraph: "Choose the products you want and add them to your cart. Before continuing, check the names, quantities, and total." },
      { heading: "Enter delivery details", paragraph: "Enter your name, phone number, and delivery address. Review the costs and estimated delivery time shown at checkout." },
      { heading: "Need help?", paragraph: "Contact us by phone or WhatsApp using the details on our contact page if you have a question about a product or order." },
    ],
    relatedProductSlugs: [],
  },
];

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-TZ", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function getArticleBySlug(slug: string): Article | undefined {
  return articles.find((a) => a.slug === slug);
}

export function articlesByCategory(category: Article["category"]): Article[] {
  return articles.filter((a) => a.category === category);
}

export function latestArticles(count = 3): Article[] {
  return [...articles]
    .sort((a, b) => Date.parse(b.date) - Date.parse(a.date))
    .slice(0, count);
}
