/**
 * Katalogi halisi — pack za Niffer Cosmetics kwa picha halisi.
 * Kila pack ni bidhaa moja kwenye katalogi kwa bei ya picha (TSH).
 */

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: CategorySlug;
  priceTsh: number;
  compareAtTsh?: number;
  shortDescription: string;
  description: string;
  ingredients: string;
  howToUse: string;
  rating: number;
  reviewCount: number;
  stock: number;
  badges: ProductBadge[];
  region?: string;
  city?: string;
  image: string;
  imageAlt: string;
};

export type ProductBadge = "new" | "bestseller" | "sale" | "low-stock";

export type CategorySlug = string;

export type Category = {
  slug: CategorySlug;
  name: string;
  description: string;
  productCount: number;
  swatch: string;
};

export const categories: Category[] = [
  {
    slug: "mwanachuo-pack",
    name: "Mwanachuo Pack",
    description: "Maseti rahisi ya bei nafuu kwa wanafunzi",
    productCount: 10,
    swatch: "bg-brand-100",
  },
  {
    slug: "purest-glow",
    name: "Purest Glow",
    description: "Pack zenye The Purest Glow — mwanga na unyevu",
    productCount: 8,
    swatch: "bg-gold-100",
  },
  {
    slug: "body-care",
    name: "Body Care",
    description: "Body lotions, oils na scrub za mwili",
    productCount: 12,
    swatch: "bg-cream-200",
  },
  {
    slug: "skincare",
    name: "Skincare",
    description: "Cream, serums na vitu vya ngozi ya uso",
    productCount: 2,
    swatch: "bg-brand-50",
  },
];

type Seed = Omit<
  Product,
  | "ingredients"
  | "howToUse"
  | "rating"
  | "reviewCount"
  | "region"
  | "city"
  | "stock"
> & {
  stock?: number;
};

const COMMON_INGREDIENTS =
  "Mchanganyiko wa bidhaa halisi zilizopo kwenye pack — angalia kila bidhaa kwa madhumuni kamili.";

const HOW_TO_USE =
  "Tumia kila bidhaa kwenye pack kulingana na maagizo yake. Kwa body care: paka lotion au cream baada ya kuoga wakati ngozi bado ni mnyevu.";

function fromSeed(seed: Seed): Product {
  const { stock: stockOpt, ...rest } = seed;
  return {
    ...rest,
    stock: stockOpt ?? 25,
    ingredients: COMMON_INGREDIENTS,
    howToUse: HOW_TO_USE,
    rating: 0,
    reviewCount: 0,
    region: "Dar es Salaam",
    city: "Kinondoni",
  };
}

const seeds: Seed[] = [
  // Mwanachuo Pack (10)
  {
    id: "p-001",
    slug: "mwanachuo-pack-45k",
    name: "Mwanachuo Pack — Queen Elizabeth",
    category: "mwanachuo-pack",
    priceTsh: 45000,
    shortDescription:
      "Queen Elizabeth cocoa butter cream na glycerin — msingi wa ngozi laini kwa bei ya mwanafunzi.",
    description:
      "Pack hii ya Mwanachuo inajumuisha Queen Elizabeth Cocoa Butter Cream na Precious Glycerin. Nafuu na yenye ufanisi — inafaa kwa mwanafunzi anayeanza ratiba ya ngozi. Bidhaa halisi, malipo salama, na usafirishaji haraka Dar es Salaam.",
    badges: ["bestseller"],
    image: "/images/packs/pack-queen-elizabeth-45k.jpg",
    imageAlt: "Mwanachuo Pack 45,000 — Queen Elizabeth cocoa butter",
  },
  {
    id: "p-002",
    slug: "mwanachuo-pack-65k-vaseline",
    name: "Mwanachuo Pack — Vaseline + Purest Glow",
    category: "mwanachuo-pack",
    priceTsh: 65000,
    shortDescription:
      "Purest Glow shower gel, Vaseline Cocoa Radiant lotion, na Queen Elizabeth cream — bei ya mwanachuo.",
    description:
      "Pack kamili ya mwanafunzi: Purest Glow Glutathione & Amino Acid Shower Gel, Vaseline Intensive Care Cocoa Radiant, na Queen Elizabeth Cocoa Butter. Ngozi safi, laini, na yenye mwanga kwa bei nafuu.",
    badges: [],
    image: "/images/packs/pack-mwanachuo-65k-vaseline.jpg",
    imageAlt: "Mwanachuo Pack 65,000 — Vaseline na Purest Glow",
  },
  {
    id: "p-003",
    slug: "mwanachuo-pack-65k-purest-glow",
    name: "Mwanachuo Pack — Purest Glow + Queen Elizabeth",
    category: "mwanachuo-pack",
    priceTsh: 65000,
    shortDescription:
      "Purest Glow shower gel na Queen Elizabeth cream + glycerin — rahisi na yenye ufanisi.",
    description:
      "Kwa mwanafunzi anayependa Purest Glow: pack hii ina Purest Glow Glutathione Shower Gel na Queen Elizabeth Cocoa Butter Cream pamoja na Glycerin. Mchanganyiko rahisi wa kila siku kwa ngozi yenye mwanga.",
    badges: [],
    image: "/images/packs/pack-mwanachuo-65k-purest-glow.jpg",
    imageAlt: "Mwanachuo Pack 65,000 — Purest Glow na Queen Elizabeth",
  },
  {
    id: "p-004",
    slug: "mwanachuo-pack-80k",
    name: "Mwanachuo Pack — St Ives",
    category: "mwanachuo-pack",
    priceTsh: 80000,
    shortDescription:
      "St Ives scrub, lotion, na ziada — mwanafunzi anayependa ngozi laini.",
    description:
      "Pack yenye St Ives products kwa mwanachuo. Scrub laini huondoa seli za mwisho, lotion huweka unyevu, na muundo unafaa kwa ngozi ya mijini. Bei ya mwanafunzi bila kuathiri ubora.",
    badges: ["new"],
    image: "/images/packs/pack-mwanachuo-80k-st-ives.jpg",
    imageAlt: "Mwanachuo Pack 80,000 — St Ives",
  },
  {
    id: "p-005",
    slug: "mwanachuo-pack-90k",
    name: "Mwanachuo Pack — Vaseline + SAFE",
    category: "mwanachuo-pack",
    priceTsh: 90000,
    shortDescription:
      "Vaseline Daily Brightening, SAFE Vitamin C serum, na Queen Elizabeth — mwanga kwa mwanafunzi.",
    description:
      "Pack hii ina Vaseline Healthy Bright Daily Brightening Lotion, SAFE Double Care Vitamin C + Glutathione, na Queen Elizabeth Cocoa Butter. Mchanganyiko wa bei nafuu wenye matokeo ya kuona.",
    badges: ["bestseller"],
    image: "/images/packs/pack-mwanachuo-90k.jpg",
    imageAlt: "Mwanachuo Pack 90,000 — Vaseline na SAFE",
  },
  {
    id: "p-006",
    slug: "mwanachuo-pack-95k-argan",
    name: "Mwanachuo Pack — Argan",
    category: "mwanachuo-pack",
    priceTsh: 95000,
    shortDescription:
      "Argan oil, scrub, na cream — tiba ya ngozi kavu kwa mwanafunzi.",
    description:
      "Pack ya argan kwa wanafunzi: oil, scrub na cream zinazosaidia ngozi kavu na iliyochoka. Inafaa kwa wale wanaotaka tiba rahisi ya wiki nzima kwa bei ya mwanafunzi.",
    badges: [],
    image: "/images/packs/pack-mwanachuo-95k-argan.jpg",
    imageAlt: "Mwanachuo Pack 95,000 — Argan",
  },
  {
    id: "p-007",
    slug: "mwanachuo-pack-95k-mixa",
    name: "Mwanachuo Pack — Mixa",
    category: "mwanachuo-pack",
    priceTsh: 95000,
    shortDescription:
      "Mixa lotions na scrub — ngozi laini kwa mwanafunzi wa chuo.",
    description:
      "Mixa products kwa mwanachuo: lotions na scrub zinazofaa kwa aina zote za ngozi. Muundo wa kifanshi wa Ulaya kwa bei ya mwanafunzi wa Tanzania.",
    badges: [],
    image: "/images/packs/pack-mwanachuo-95k-mixa.jpg",
    imageAlt: "Mwanachuo Pack 95,000 — Mixa",
  },
  {
    id: "p-008",
    slug: "mwanachuo-pack-95k-palmers",
    name: "Mwanachuo Pack — Palmer's",
    category: "mwanachuo-pack",
    priceTsh: 95000,
    shortDescription:
      "Palmer's cocoa butter lotion, oil, na cream — ngozi yenye unyevu mchana kutwa.",
    description:
      "Palmer's Cocoa Butter Formula pack kwa mwanachuo: body lotion, body oil, na cream. Wenye Vitamin E na cocoa butter huinua ngozi kavu na kuacha mwanga wa afya.",
    badges: ["bestseller"],
    image: "/images/packs/pack-mwanachuo-95k-palmers.jpg",
    imageAlt: "Mwanachuo Pack 95,000 — Palmer's",
  },
  {
    id: "p-009",
    slug: "mwanachuo-pack-100k-rose",
    name: "Mwanachuo Pack — Rose",
    category: "mwanachuo-pack",
    priceTsh: 100000,
    shortDescription:
      "Rose water scrub, lotion, na cream — harufu ya maua kwa mwanafunzi.",
    description:
      "Pack ya rose kwa wanafunzi: scrub na cream zenye harufu ya maua ya rose. Inafaa kwa mchana na jioni, na ni bora kwa wale wanaopenda harufu nyepesi ya asili.",
    badges: ["new"],
    image: "/images/packs/pack-mwanachuo-100k-rose.jpg",
    imageAlt: "Mwanachuo Pack 100,000 — Rose",
  },
  {
    id: "p-010",
    slug: "mwanachuo-pack-100k-purest-glow",
    name: "Mwanachuo Pack — Purest Glow",
    category: "mwanachuo-pack",
    priceTsh: 100000,
    shortDescription:
      "Purest Glow shower gel, lotion, na cream — mwanga kamili kwa bei ya mwanafunzi.",
    description:
      "Pack kamili ya Purest Glow kwa mwanachuo: shower gel, lotion, na cream. Mchanganyiko unaotoa mwanga wa asili na unyevu wa muda mrefu kwa bei ya chuo.",
    badges: ["bestseller"],
    image: "/images/packs/pack-mwanachuo-100k-purest-glow.jpg",
    imageAlt: "Mwanachuo Pack 100,000 — Purest Glow",
  },

  // Purest Glow (8)
  {
    id: "p-011",
    slug: "purest-glow-pack-65k",
    name: "Purest Glow Pack — Queen Elizabeth",
    category: "purest-glow",
    priceTsh: 65000,
    shortDescription:
      "Purest Glow shower gel na Queen Elizabeth cream — mwanga rahisi kwa siku.",
    description:
      "Pack ndogo ya Purest Glow: Glutathione & Amino Acid Shower Gel pamoja na Queen Elizabeth Cocoa Butter. Rahisi, nafuu, na yenye matokeo ya kuona ndani ya wiki chache.",
    badges: [],
    image: "/images/packs/pack-65k-qe.jpg",
    imageAlt: "Purest Glow Pack 65,000 — Queen Elizabeth",
  },
  {
    id: "p-012",
    slug: "purest-glow-pack-100k",
    name: "Purest Glow Pack — Vaseline + Queen Elizabeth",
    category: "purest-glow",
    priceTsh: 100000,
    shortDescription:
      "Purest Glow, Vaseline lotion, na Queen Elizabeth — ngozi laini na yenye mwanga.",
    description:
      "Purest Glow shower gel, Vaseline Intensive Care Cocoa Radiant lotion, na Queen Elizabeth Cocoa Butter + Glycerin. Mseto kamili wa asubuhi na jioni kwa ngozi yenye mwanga.",
    badges: ["bestseller"],
    image: "/images/packs/pack-100k-vaseline-qe.jpg",
    imageAlt: "Purest Glow Pack 100,000 — Vaseline na Queen Elizabeth",
  },
  {
    id: "p-013",
    slug: "purest-glow-pack-110k",
    name: "Purest Glow Pack — American Dream",
    category: "purest-glow",
    priceTsh: 110000,
    shortDescription:
      "Purest Glow yellow scrub gel, Palmer's oil, na American Dream cream.",
    description:
      "Tumeric & Kojic Acid Whitening Scrub Shower Gel, Palmer's Cocoa Butter Body Oil, na American Dream Cocoa Butter Cream. Mchanganyiko wa kusafisha na kulisha ngozi kwa mwanga wa asili.",
    badges: [],
    image: "/images/packs/pack-110k-american-dream.jpg",
    imageAlt: "Purest Glow Pack 110,000 — American Dream",
  },
  {
    id: "p-014",
    slug: "purest-glow-pack-135k",
    name: "Purest Glow Pack — Queen Elizabeth Set",
    category: "purest-glow",
    priceTsh: 135000,
    shortDescription:
      "Purest Glow red + yellow, Palmer's oil, na Queen Elizabeth cream + glycerin.",
    description:
      "Pack kamili: Purest Glow Glutathione (nyekundu) na Tumeric & Kojic (njano), Palmer's Cocoa Butter Body Oil, Queen Elizabeth Cream na Glycerin. Kusafisha, kulisha, na kuacha ngozi yenye mwanga.",
    badges: ["bestseller"],
    image: "/images/packs/pack-135k-qe.jpg",
    imageAlt: "Purest Glow Pack 135,000 — Queen Elizabeth Set",
  },
  {
    id: "p-015",
    slug: "purest-glow-pack-170k",
    name: "Purest Glow Pack — Dr Teal's",
    category: "purest-glow",
    priceTsh: 170000,
    shortDescription:
      "Purest Glow, Dr Teal's lotion + scrub, na Palmer's oil — spa nyumbani.",
    description:
      "Purest Glow Glutathione Shower Gel, Dr Teal's Body Lotion (Glow & Radiance), Dr Teal's Shea Sugar Scrub, na Palmer's Cocoa Butter Body Oil. Mchanganyiko wa spa unaojisikia nyumbani.",
    badges: ["new"],
    image: "/images/packs/pack-170k-dr-teals.jpg",
    imageAlt: "Purest Glow Pack 170,000 — Dr Teal's",
  },
  {
    id: "p-016",
    slug: "purest-glow-pack-185k",
    name: "Purest Glow Pack — Palmer's Full",
    category: "purest-glow",
    priceTsh: 185000,
    shortDescription:
      "Purest Glow red + yellow, Palmer's lotion, oil, na bonus cream.",
    description:
      "Pack kamili ya Palmer's na Purest Glow: shower gels mbili, Palmer's Cocoa Butter Lotion, Body Oil, na Cream ya ziada. Unyevu wa saa 24 kwa ngozi ya mwili mzima.",
    badges: ["bestseller"],
    image: "/images/packs/pack-185k-palmers-full.jpg",
    imageAlt: "Purest Glow Pack 185,000 — Palmer's Full",
  },
  {
    id: "p-017",
    slug: "purest-glow-pack-200k",
    name: "Purest Glow Pack — Belle Glow + Mixa",
    category: "purest-glow",
    priceTsh: 200000,
    shortDescription:
      "Purest Glow red + yellow, Belle Glow serum, na Mixa cream.",
    description:
      "Purest Glow shower gels mbili, Belle Glow Body Serum Oil, na Mixa La Crème Nutritive. Mchanganyiko wa mwanga, unyevu, na harufu nzuri kwa ngozi ya mwili.",
    badges: [],
    image: "/images/packs/pack-200k-belle-mixa.jpg",
    imageAlt: "Purest Glow Pack 200,000 — Belle Glow na Mixa",
  },
  {
    id: "p-018",
    slug: "purest-glow-pack-340k",
    name: "Purest Glow Pack — Mixa Double",
    category: "purest-glow",
    priceTsh: 340000,
    compareAtTsh: 400000,
    shortDescription:
      "Purest Glow x4, Palmer's oil, na Mixa x2 — pack kubwa zaidi ya familia.",
    description:
      "Pack kubwa zaidi: Purest Glow shower gels nne (mbili nyekundu, mbili njano), Palmer's Cocoa Butter Body Oil, na Mixa lotions mbili. Inafaa kwa familia au kwa yule anayetaka stoo ya muda mrefu.",
    badges: ["sale", "bestseller"],
    image: "/images/packs/pack-340k-mixa-double.jpg",
    imageAlt: "Purest Glow Pack 340,000 — Mixa Double",
  },

  // Body Care (11)
  {
    id: "p-019",
    slug: "body-pack-125k",
    name: "Body Pack — Executive Glow + Queen Elizabeth",
    category: "body-care",
    priceTsh: 125000,
    shortDescription:
      "Purest Glow yellow, Executive Glow Carrote lotion, na Queen Elizabeth cream.",
    description:
      "Tumeric & Kojic Acid Scrub, Executive Glow Carrote Super Lightening Lotion, na Queen Elizabeth Cocoa Butter + Glycerin. Mseto wa mwili kwa mwanga na unyevu.",
    badges: [],
    image: "/images/packs/pack-125k-executive-qe.jpg",
    imageAlt: "Body Pack 125,000 — Executive Glow na Queen Elizabeth",
  },
  {
    id: "p-020",
    slug: "body-pack-140k",
    name: "Body Pack — Belle Glow + Palmer's",
    category: "body-care",
    priceTsh: 140000,
    shortDescription:
      "Belle Glow serum + cream na Palmer's lotion — mwanga wa ngozi ya mwili.",
    description:
      "Belle Glow Body Serum Oil, Belle Glow Advance Brightening Cream, na Palmer's Cocoa Butter Daily Skin Therapy Lotion. Mseto wa mwanga na unyevu kwa ngozi ya mwili mzima.",
    badges: ["bestseller"],
    image: "/images/packs/pack-140k-belle-palmers.jpg",
    imageAlt: "Body Pack 140,000 — Belle Glow na Palmer's",
  },
  {
    id: "p-021",
    slug: "body-pack-160k",
    name: "Body Pack — Executive Glow + Coffee Scrub",
    category: "body-care",
    priceTsh: 160000,
    shortDescription:
      "Purest Glow yellow, Executive Glow, Queen Elizabeth, na Coffee Sea Salt Scrub.",
    description:
      "Pack kamili ya body: Purest Glow Scrub Gel, Executive Glow Carrote Lotion, Queen Elizabeth Cream + Glycerin, na Coffee Sea Salt Bath Whitening SPA Scrub. Kusafisha, kulisha, na kuacha ngozi laini.",
    badges: [],
    image: "/images/packs/pack-160k-executive-coffee.jpg",
    imageAlt: "Body Pack 160,000 — Executive Glow na Coffee Scrub",
  },
  {
    id: "p-022",
    slug: "body-pack-165k",
    name: "Body Pack — Palmer's + Executive Glow",
    category: "body-care",
    priceTsh: 165000,
    shortDescription:
      "Executive Glow Carrote na Palmer's trio — lotion, oil, na cream.",
    description:
      "Executive Glow Carrote Super Lightening Lotion, Palmer's Cocoa Butter Body Oil, Palmer's Heals & Softens Cream, na Palmer's Daily Skin Therapy Lotion. Unyevu wa saa 24 kwa ngozi ya mwili.",
    badges: [],
    image: "/images/packs/pack-165k-palmers-executive.jpg",
    imageAlt: "Body Pack 165,000 — Palmer's na Executive Glow",
  },
  {
    id: "p-023",
    slug: "body-pack-195k-coffee",
    name: "Body Pack — Purest Glow + Coffee Scrub",
    category: "body-care",
    priceTsh: 195000,
    shortDescription:
      "Purest Glow yellow, Executive Glow, Queen Elizabeth, na Coffee Scrub.",
    description:
      "Tumeric & Kojic Acid Scrub, Executive Glow Carrote Lotion, Queen Elizabeth Cream + Glycerin, na Coffee Sea Salt Whitening SPA Scrub. Mseto wa kina wa body care kwa wiki nzima.",
    badges: ["bestseller"],
    image: "/images/packs/pack-195k-executive-coffee.jpg",
    imageAlt: "Body Pack 195,000 — Purest Glow na Coffee Scrub",
  },
  {
    id: "p-024",
    slug: "body-pack-195k-purec",
    name: "Body Pack — PureC Egyptian Gold",
    category: "body-care",
    priceTsh: 195000,
    shortDescription:
      "PureC Egyptian Gold shower milk, Executive Glow, Queen Elizabeth, na Coffee Scrub.",
    description:
      "PureC Egyptian Magic Whitening Gold Lightening Shower Milk, Executive Glow Carrote Lotion, Queen Elizabeth Cream + Glycerin, na Coffee Sea Salt Scrub. Mseto wa kimataifa kwa ngozi ya mwili.",
    badges: ["new"],
    image: "/images/packs/pack-195k-purec-egyptian.jpg",
    imageAlt: "Body Pack 195,000 — PureC Egyptian Gold",
  },
  {
    id: "p-025",
    slug: "body-pack-195k-vivida",
    name: "Body Pack — Vivida Extra Glow",
    category: "body-care",
    priceTsh: 195000,
    shortDescription:
      "Vivida Milk & Honey shower gel, Executive Glow, Queen Elizabeth, na Coffee Scrub.",
    description:
      "Vivida Extra Glow Shower Gel (Milk & Honey), Executive Glow Carrote Lotion, Queen Elizabeth Cream + Glycerin, na Coffee Sea Salt Scrub. Harufu ya asili ya maziwi na asali kwa ngozi yenye mwanga.",
    badges: [],
    image: "/images/packs/pack-195k-vivida.jpg",
    imageAlt: "Body Pack 195,000 — Vivida Extra Glow",
  },
  {
    id: "p-026",
    slug: "body-pack-200k-glass",
    name: "Body Pack — Glass Skin Spring",
    category: "body-care",
    priceTsh: 200000,
    shortDescription:
      "Glass Skin Almond Milk & Honey shower gel, Executive Glow, Queen Elizabeth, na Coffee Scrub.",
    description:
      "Glass Skin Spring Almond Milk & Honey Shower Gel (Extreme Brightening), Executive Glow Carrote Lotion, Queen Elizabeth Cream + Glycerin, na Coffee Sea Salt Scrub. Ngozi laini kama glasi.",
    badges: ["bestseller"],
    image: "/images/packs/pack-200k-glass-skin.jpg",
    imageAlt: "Body Pack 200,000 — Glass Skin Spring",
  },
  {
    id: "p-027",
    slug: "body-pack-225k",
    name: "Body Pack — Veet Gold Sugar & Milk",
    category: "body-care",
    priceTsh: 225000,
    shortDescription:
      "Veet Gold Sugar & Milk Body Magic, Executive Glow, Queen Elizabeth, na Coffee Scrub.",
    description:
      "Veet Gold Sugar & Milk Body Magic Shower Bath, Executive Glow Carrote Lotion, Queen Elizabeth Cream + Glycerin, na Coffee Sea Salt Scrub. Whitening body magic kwa ngozi ya mwili mzima.",
    badges: [],
    image: "/images/packs/pack-225k-veet-gold.jpg",
    imageAlt: "Body Pack 225,000 — Veet Gold Sugar & Milk",
  },
  {
    id: "p-028",
    slug: "body-pack-245k-coconut",
    name: "Body Pack — OGX Coconut Coffee",
    category: "body-care",
    priceTsh: 245000,
    shortDescription:
      "OGX Coconut Coffee scrub, Executive Glow, Queen Elizabeth, na Coffee Scrub.",
    description:
      "OGX Smoothing Coconut Coffee Scrub & Wash, Executive Glow Carrote Lotion, Queen Elizabeth Cream + Glycerin, na Coffee Sea Salt Scrub. Harufu ya kahawa na nazi kwa body spa nyumbani.",
    badges: ["new"],
    image: "/images/packs/pack-245k-ogx-coconut.jpg",
    imageAlt: "Body Pack 245,000 — OGX Coconut Coffee",
  },
  {
    id: "p-029",
    slug: "body-pack-245k-rose",
    name: "Body Pack — OGX Rose Water",
    category: "body-care",
    priceTsh: 245000,
    shortDescription:
      "OGX Rose Water scrub, Executive Glow, Queen Elizabeth, na Coffee Scrub.",
    description:
      "OGX Rose Water & Pink Sea Salt Scrub & Wash, Executive Glow Carrote Lotion, Queen Elizabeth Cream + Glycerin, na Coffee Sea Salt Scrub. Harufu ya rose na chumvi ya bahari kwa ngozi laini.",
    badges: ["bestseller"],
    image: "/images/packs/pack-245k-ogx-rose.jpg",
    imageAlt: "Body Pack 245,000 — OGX Rose Water",
  },
  {
    id: "p-030",
    slug: "body-pack-265k",
    name: "Body Pack — EOS Pistachio",
    category: "body-care",
    priceTsh: 265000,
    shortDescription:
      "EOS Cashmere body wash + 24H lotion, Executive Glow, na Palmer's oil.",
    description:
      "EOS Shea Better Cashmere Body Wash na 24H Moisture Body Lotion (Crème de Pistachio), Executive Glow Carrote, na Palmer's Cocoa Butter Body Oil. Seti ya kimataifa ya body care kwa unyevu wa saa 24.",
    badges: ["bestseller"],
    image: "/images/packs/pack-265k-eos.jpg",
    imageAlt: "Body Pack 265,000 — EOS Pistachio",
  },

  // Skincare (3)
  {
    id: "p-031",
    slug: "skincare-pack-175k",
    name: "Skincare Pack — Belle Glow + Palmer's",
    category: "skincare",
    priceTsh: 175000,
    shortDescription:
      "Belle Glow shimmer oil + cream, Palmer's heals cream, na Palmer's lotion.",
    description:
      "Belle Glow Body Shimmer Oil, Belle Glow Advance Brightening Cream, Palmer's Heals & Softens Cream, na Palmer's Cocoa Butter Daily Skin Therapy. Mseto wa ngozi ya uso na mwili kwa mwanga wa ndani.",
    badges: ["bestseller"],
    image: "/images/packs/pack-175k-belle-palmers.jpg",
    imageAlt: "Skincare Pack 175,000 — Belle Glow na Palmer's",
  },
  {
    id: "p-032",
    slug: "skincare-pack-185k",
    name: "Skincare Pack — Belle Glow + Vitamin E",
    category: "skincare",
    priceTsh: 185000,
    shortDescription:
      "Belle Glow serum + cream, Vitamin E body cream, na Coffee Scrub.",
    description:
      "Belle Glow Body Serum Oil, Belle Glow Advance Brightening Cream, Vitamin E Intensive All Over Body Cream, na Coffee Sea Salt Whitening SPA Scrub. Mseto wa skincare na body scrub kwa mwanga kamili.",
    badges: ["new"],
    image: "/images/packs/pack-185k-belle-vitamin-e.jpg",
    imageAlt: "Skincare Pack 185,000 — Belle Glow na Vitamin E",
  },
];

export const products: Product[] = seeds.map(fromSeed);

export type BeautyVideo = {
  id: string;
  title: string;
  description: string;
  duration: string;
  providerId?: string;
  mp4Url?: string;
  thumbnail: string;
  relatedProductSlug?: string;
};

export const beautyVideos: BeautyVideo[] = [
  {
    id: "v-001",
    title: "Video ya Purest Glow Pack",
    description:
      "Ona jinsi pack za Purest Glow zinavyoonekana — ubora na matokeo halisi.",
    duration: "0:30",
    mp4Url: "/videos/video-1.mp4",
    thumbnail: "/images/packs/pack-135k-qe.jpg",
    relatedProductSlug: "purest-glow-pack-135k",
  },
  {
    id: "v-002",
    title: "Video ya Body Care Pack",
    description:
      "Body care packs — Executive Glow, Queen Elizabeth, na Coffee Scrub pamoja.",
    duration: "0:30",
    mp4Url: "/videos/video-2.mp4",
    thumbnail: "/images/packs/pack-195k-executive-coffee.jpg",
    relatedProductSlug: "body-pack-195k-coffee",
  },
  {
    id: "v-003",
    title: "Video ya Mwanachuo Pack",
    description:
      "Mwanachuo Pack — bei nafuu na ubora kwa wanafunzi.",
    duration: "0:30",
    mp4Url: "/videos/video-3.mp4",
    thumbnail: "/images/packs/pack-mwanachuo-90k.jpg",
    relatedProductSlug: "mwanachuo-pack-90k",
  },
  {
    id: "v-004",
    title: "Video ya EOS + Executive Pack",
    description:
      "EOS Pistachio na Executive Glow — seti ya kimataifa ya body care.",
    duration: "0:30",
    mp4Url: "/videos/video-4.mp4",
    thumbnail: "/images/packs/pack-265k-eos.jpg",
    relatedProductSlug: "body-pack-265k",
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getProductsByCategory(category: CategorySlug): Product[] {
  return products.filter((p) => p.category === category);
}

export function featuredProducts(): Product[] {
  return products.filter((p) => p.badges.includes("bestseller"));
}

export function newArrivals(): Product[] {
  return products.filter((p) => p.badges.includes("new"));
}

export function saleProducts(): Product[] {
  return products.filter((p) => p.badges.includes("sale"));
}

export function searchProducts(query: string): Product[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return products.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.shortDescription.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q),
  );
}
