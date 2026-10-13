/**
 * Sample catalog data — yaani ya mpangilio tu (mock).
 * Baada ya module ya database/products kujengwa, data halisi zitakuja
 * kutoka Prisma/DB kupitia features/catalog service. Badilisha hapa.
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
  /** Mkoa ambapo bidhaa hii inapatikana zaidi (uchujaji wa eneo kama jiji.com). */
  region?: string;
  /** Mji/taasisi ndani ya mkoa (uchujaji kwa mji). */
  city?: string;
  /**
   * Media module: ProductImage hutumia `image` kama `/images/products/<slug>.svg`.
   * Baada ya media module halisi, badilisha na ProductMedia (picha + video).
   */
  image: string;
  imageAlt: string;
};

export type ProductBadge = "new" | "bestseller" | "sale" | "low-stock";

export type CategorySlug =
  | "skincare"
  | "makeup"
  | "haircare"
  | "fragrance"
  | "body-care"
  | "accessories";

export type Category = {
  slug: CategorySlug;
  name: string;
  description: string;
  productCount: number;
  /** Rangi imara ya bendi ya juu (editorial — si gradient). */
  swatch: string;
};

export const categories: Category[] = [
  {
    slug: "skincare",
    name: "Skincare",
    description: "Cleansers, serums, moisturizers na sunscreen",
    productCount: 24,
    swatch: "bg-brand-100",
  },
  {
    slug: "makeup",
    name: "Makeup",
    description: "Lipsticks, foundations, mascaras na zaidi",
    productCount: 31,
    swatch: "bg-gold-100",
  },
  {
    slug: "haircare",
    name: "Haircare",
    description: "Shampoos, conditioners na hair treatments",
    productCount: 18,
    swatch: "bg-cream-200",
  },
  {
    slug: "fragrance",
    name: "Fragrance",
    description: "Perfumes na body mists za kila siku",
    productCount: 12,
    swatch: "bg-brand-50",
  },
  {
    slug: "body-care",
    name: "Body Care",
    description: "Body lotions, scrubs na soaps",
    productCount: 15,
    swatch: "bg-gold-100",
  },
  {
    slug: "accessories",
    name: "Accessories",
    description: "Tools, brushes na vitendegea vya urembo",
    productCount: 9,
    swatch: "bg-cream-200",
  },
];

export const products: Product[] = [
  {
    id: "p-001",
    slug: "radiance-vitamin-c-serum",
    name: "Radiance Vitamin C Serum",
    category: "skincare",
    priceTsh: 32000,
    compareAtTsh: 40000,
    shortDescription:
      "Serum yenye Vitamin C 20% na hyaluronic acid kwa ngozi angavu na yenye mwanga.",
    description:
      "Radiance Vitamin C Serum ni tiba ya kila siku kwa ngozi iliyochoka na isiyo na mwanga. Wenye Vitamin C ya 20% (ascorbic acid) pamoja na hyaluronic acid, serum hii inasaidia kurejesha mwanga asili wa ngozi, kupunguza alama za chunvi, na kuzuia uharibiku wa mazingira. Inafaa kwa aina zote za ngozi na inatumika kila asubuhi kabla ya sunscreen.",
    ingredients:
      "20% L-Ascorbic Acid, Hyaluronic Acid, Vitamin E, Ferulic Acid, Aloe Vera Extract, Glycerin.",
    howToUse:
      "Baada ya kusafisha uso, tia tone 3–4 kwenye viganja vyako na paka kwenye uso na shingo kwa miezi. Fuatilia na moisturizer na sunscreen ya SPF 30+.",
    rating: 4.8,
    reviewCount: 126,
    stock: 40,
    badges: ["bestseller", "sale"],
    region: "Dar es Salaam",
    city: "Kinondoni",
    image: "/images/products/radiance-vitamin-c-serum.svg",
    imageAlt: "Radiance Vitamin C Serum chupa ya glasi ya dhahabu",
  },
  {
    id: "p-002",
    slug: "velvet-matte-lipstick-set",
    name: "Velvet Matte Lipstick Set",
    category: "makeup",
    priceTsh: 24500,
    shortDescription:
      "Seti ya miwili ya lipstick ya matte ya muda mrefu, nyumbafu na nyekundu.",
    description:
      "Seti hii ya Velvet Matte Lipstick inajumuisha nyumbafu na nyekundu — rangi mbili zinazofaa kwa matukio yote. Muundo wa velvet matte hutoa rangi kamili bila kukausha midomo, na unadumu kwa saa 8+ bila kufuta. Imeandaliwa na vitamin E ili kudumisha unyevu wa midomo.",
    ingredients:
      "Dimethicone, Ricinus Communis (Castor) Oil, Vitamin E, Beeswax, Natural Pigments.",
    howToUse:
      "Paka kwenye midomo safi. Kwa matokeo bora, tia lip balm kwanza, futa ziada, kisha paka lipstick kwa tabaka mbili.",
    rating: 4.7,
    reviewCount: 89,
    stock: 25,
    badges: ["new"],
    region: "Dar es Salaam",
    city: "Ilala",
    image: "/images/products/velvet-matte-lipstick-set.svg",
    imageAlt: "Velvet Matte Lipstick Set ya vipande viwili vya rangi",
  },
  {
    id: "p-003",
    slug: "hydra-glow-moisturizer",
    name: "Hydra Glow Moisturizer",
    category: "skincare",
    priceTsh: 28000,
    shortDescription:
      "Moisturizer yenye hyaluronic acid na aloe vera kwa urembo wa asili kila siku.",
    description:
      "Hydra Glow Moisturizer ni nyunyo rahisi ya unyevu wa muda mrefu. Wenye hyaluronic acid ya triple-weight na aloe vera, huongeza unyevu mara moja na kudumisha ngozi laini saa 24. Muundo wake mwepesi haufinyangi ngozi na unafaa chini ya makeup.",
    ingredients:
      "Hyaluronic Acid, Aloe Vera, Shea Butter, Glycerin, Ceramide Complex, Vitamin B5.",
    howToUse:
      "Paka tabaka nyepesi kwenye uso na shingo mara mbili kwa siku — asubuhi na jioni — baada ya serum.",
    rating: 4.9,
    reviewCount: 203,
    stock: 5,
    badges: ["bestseller", "low-stock"],
    region: "Dar es Salaam",
    city: "Kinondoni",
    image: "/images/products/hydra-glow-moisturizer.svg",
    imageAlt: "Hydra Glow Moisturizer kasha la nyeupe",
  },
  {
    id: "p-004",
    slug: "silk-touch-conditioner",
    name: "Silk Touch Conditioner",
    category: "haircare",
    priceTsh: 19500,
    shortDescription:
      "Conditioner laini yenye argan oil kwa nywele zenye unyevu na mwanga.",
    description:
      "Silk Touch Conditioner huondoa kuzora na kurejesha unyevu kwa nywele kavu au zilizodhurika. Wenye argan oil na keratin, hufanya nywele kuwa laini, rahisi kusuka, na zenye mwanga wa afya. Inafaa kwa nywele zilizopishwa rangi na zisizopishwa.",
    ingredients:
      "Argan Oil, Keratin, Coconut Oil, Glycerin, Shea Butter, Panthenol.",
    howToUse:
      "Baada ya shampoo, paka kwenye nywele kutoka katikati hadi ukingo. Acha kwa dakika 2–3 kisha suka kwa maji baridi.",
    rating: 4.6,
    reviewCount: 54,
    stock: 60,
    badges: [],
    region: "Mwanza",
    city: "Nyamagana",
    image: "/images/products/silk-touch-conditioner.svg",
    imageAlt: "Silk Touch Conditioner chupa ya dhahabu",
  },
  {
    id: "p-005",
    slug: "amber-nights-eau-de-parfum",
    name: "Amber Nights Eau de Parfum",
    category: "fragrance",
    priceTsh: 45000,
    compareAtTsh: 55000,
    shortDescription:
      "Perfume ya amber na vanilla — harufu ya jioni isiyosahaulika.",
    description:
      "Amber Nights ni harufu ya jioni yenye mchanganyiko wa amber, vanilla, na msitu wa cedar. Inaanzia kwa midundo ya bergamot na kuishia kwenye base ya musk na vanilla — harufu yenye muda mrefu inayodumu saa 8–10. Inafaa kwa matukio maalum na kwa mtu anayependa harufu yenye utajiri.",
    ingredients:
      "Alcohol Denat., Parfum, Amber Accord, Vanilla Absolute, Cedarwood, Bergamot, Musk.",
    howToUse:
      "Paka kwenye maeneo ya nabii — shingo, nyuma ya masikio, na pulse points. Usifute ili iendelee kudumu.",
    rating: 4.8,
    reviewCount: 72,
    stock: 18,
    badges: ["sale"],
    region: "Dar es Salaam",
    city: "Ubungo",
    image: "/images/products/amber-nights-eau-de-parfum.svg",
    imageAlt: "Amber Nights perfume chupa ya dhahabu na nyeusi",
  },
  {
    id: "p-006",
    slug: "nourishing-body-lotion",
    name: "Nourishing Body Lotion",
    category: "body-care",
    priceTsh: 15000,
    shortDescription:
      "Body lotion yenye shea butter kwa ngozi laini na yenye unyevu mchana kutwa.",
    description:
      "Nourishing Body Lotion huinua ngozi kavu kwa shea butter na vitamin E. Muundo wake wa kina huingia haraka na hauna ukoko, huchafulia ngozi laini na yenye unyevu mchana kutwa. Ina harufu nyepesi ya cream na inafaa kwa aina zote za ngozi.",
    ingredients:
      "Shea Butter, Vitamin E, Glycerin, Coconut Oil, Aloe Vera, Jojoba Oil.",
    howToUse:
      "Paka kwenye ngozi ya mwili mara moja au mbili kwa siku, hasa baada ya kuoga wakati ngozi bado ni mnyevu.",
    rating: 4.5,
    reviewCount: 41,
    stock: 80,
    badges: ["new"],
    region: "Mwanza",
    city: "Ilemela",
    image: "/images/products/nourishing-body-lotion.svg",
    imageAlt: "Nourishing Body Lotion chupa ya cream",
  },
  {
    id: "p-007",
    slug: "gentle-foam-cleanser",
    name: "Gentle Foam Cleanser",
    category: "skincare",
    priceTsh: 18000,
    shortDescription:
      "Cleanser ya foam laini huondoa uchafu bila kukausha ngozi yako.",
    description:
      "Gentle Foam Cleanser ni hatua ya kwanza ya usafi wa ngozi. Wenye pH sahihi (5.5) na chamomile, huondoa uchafu, mafuta ya ziada, na alama za makeup bila kuvunja kinga ya ngozi. Ngozi hubaki safi, laini, na haijaachwa kukaushwa.",
    ingredients:
      "Chamomile Extract, Glycerin, Cocamidopropyl Betaine, Panthenol, Allantoin.",
    howToUse:
      "Paka kwenye uso wa mnyevu, piga mviringo kwa dakika 60, kisha suka na maji ya uvuguvugu. Tumia asubuhi na jioni.",
    rating: 4.7,
    reviewCount: 98,
    stock: 55,
    badges: ["bestseller"],
    region: "Arusha",
    city: "Arusha Jiji",
    image: "/images/products/gentle-foam-cleanser.svg",
    imageAlt: "Gentle Foam Cleanser chupa nyeupe",
  },
  {
    id: "p-008",
    slug: "sun-shield-spf50",
    name: "Sun Shield SPF 50",
    category: "skincare",
    priceTsh: 22000,
    shortDescription:
      "Sunscreen ya SPF 50 PA++++ bila ukungu — kinga ya jua kila siku.",
    description:
      "Sun Shield SPF 50 hutoa kinga ya juu dhidi ya miale ya UVA na UVB bila kuacha ukungu nyeupe kwenye ngozi ya giza. Muundo wake wa gel-cream unafaa chini ya makeup na hauna mafuta. Ni hatua muhimu ya mwisho ya skincare kila asubuhi.",
    ingredients:
      "Zinc Oxide, Octinoxate, Niacinamide, Hyaluronic Acid, Vitamin E, Green Tea Extract.",
    howToUse:
      "Paka kiasi cha kijiko kidogo (¼ teaspoon) kwenye uso na shingo dakika 15 kabla ya kuchukuliwa na jua. Rudia kila saa 2 ikiwa uko nje.",
    rating: 4.9,
    reviewCount: 167,
    stock: 35,
    badges: ["bestseller"],
    region: "Dar es Salaam",
    city: "Temeke",
    image: "/images/products/sun-shield-spf50.svg",
    imageAlt: "Sun Shield SPF 50 chupa ya machungwa",
  },
  {
    id: "p-009",
    slug: "volumizing-mascara",
    name: "Volumizing Mascara",
    category: "makeup",
    priceTsh: 16500,
    shortDescription:
      "Mascara ya volume na urefu — macho makubwa kwa tabaka moja.",
    description:
      "Volumizing Mascara huongeza urefu na unene kwa kila unyunyizaji. Brush yake ya nyumba hukamata kila unywele wa jicho, huku muundo wake wa smudge-proof ukidumu saa 12 bila kuyeyuka. Inaondolewa rahisi na cleanser ya ngozi.",
    ingredients:
      "Water, Beeswax, Carnauba Wax, Panthenol, Vitamin E, Iron Oxides.",
    howToUse:
      "Paka kutoka msingi hadi ukingo wa unywele kwa mtindo wa zigzag. Rudia tabaka la pili kwa volume zaidi. Acha kukauka sekunde 30 kabla ya kufunga jicho.",
    rating: 4.6,
    reviewCount: 112,
    stock: 42,
    badges: ["new"],
    region: "Arusha",
    city: "Arusha Jiji",
    image: "/images/products/volumizing-mascara.svg",
    imageAlt: "Volumizing Mascara nyeusi na brush",
  },
  {
    id: "p-010",
    slug: "argan-repair-shampoo",
    name: "Argan Repair Shampoo",
    category: "haircare",
    priceTsh: 17500,
    shortDescription:
      "Shampoo ya argan repair huondoa uchafu na kurejesha nywele zilizodhurika.",
    description:
      "Argan Repair Shampoo husafisha nywele kwa upole huku ikizirejeshea. Wenye argan oil, biotin, na protein, huimarisha nywele zilizopishwa rangi, zilizokorofishwa, au zilizodhurika kwa joto. Inatoa unyevu na mwanga bila kuyeyusha rangi.",
    ingredients:
      "Argan Oil, Biotin, Hydrolyzed Keratin, Coconut Cleanser, Panthenol, Aloe Vera.",
    howToUse:
      "Paka kwenye nywele mnyevu, piga massage kwenye scalpa kwa dakika 1, kisha suka. Rudia kama inahitajika. Fuatilia na Silk Touch Conditioner.",
    rating: 4.7,
    reviewCount: 88,
    stock: 48,
    badges: [],
    region: "Mwanza",
    city: "Nyamagana",
    image: "/images/products/argan-repair-shampoo.svg",
    imageAlt: "Argan Repair Shampoo chupa ya kahawia",
  },
  {
    id: "p-011",
    slug: "tropical-bloom-body-mist",
    name: "Tropical Bloom Body Mist",
    category: "fragrance",
    priceTsh: 14000,
    shortDescription:
      "Body mist ya maua ya tropiki — harufu nyepesi ya kila siku.",
    description:
      "Tropical Bloom Body Mist ni harufu nyepesi ya kila siku yenye maua ya frangipani, coconut, na citrus. Ni nyepesi kuliko perfume na inafaa kwa matumizi ya mchana au kama refresh ya mchana. Inaonyeshwa kwa chupa ya spray yenye rahisi kubebeka.",
    ingredients:
      "Alcohol Denat., Parfum, Frangipani Extract, Coconut Water, Citrus Blend, Aloe Vera.",
    howToUse:
      "Nyunyiza kwenye mwili kutoka mbali sentimita 20. Tumia baada ya kuoga au wakati wowote unapohitaji kujivinjari.",
    rating: 4.5,
    reviewCount: 63,
    stock: 70,
    badges: ["new"],
    region: "Dar es Salaam",
    city: "Kigamboni",
    image: "/images/products/tropical-bloom-body-mist.svg",
    imageAlt: "Tropical Bloom Body Mist chupa ya rangi ya machungwa",
  },
  {
    id: "p-012",
    slug: "pro-makeup-brush-set",
    name: "Pro Makeup Brush Set",
    category: "accessories",
    priceTsh: 35000,
    shortDescription:
      "Seti ya vipande 8 vya brashi za kitaalamu — zote unazohitaji.",
    description:
      "Pro Makeup Brush Set ni seti ya brashi 8 za kitaalamu zilizofunikwa kwa nywele za sintetiki za hali ya juu. Zina brashi za uso, macho, midomo, na contour — kila kitu unachohitaji kwa look kamili. Zinakuja kwenye kisanduku cha kifahari kinacholinda brashi zako.",
    ingredients:
      "Sintetiki ya hali ya juu, Handles za mbao za bamboo, Metal ferrules za dhahabu.",
    howToUse:
      "Tumia brashi kwa product husika: foundation brush kwa msingi, blending brush kwa macho, lip brush kwa midomo. Fua kila wiki kwa sabuni laini.",
    rating: 4.8,
    reviewCount: 45,
    stock: 20,
    badges: ["bestseller"],
    region: "Arusha",
    city: "Karatu",
    image: "/images/products/pro-makeup-brush-set.svg",
    imageAlt: "Pro Makeup Brush Set ya brashi 8",
  },
];

export type BeautyVideo = {
  id: string;
  title: string;
  description: string;
  duration: string;
  /** YouTube/Vimeo ID baada ya media module; sasa ni placeholder */
  providerId?: string;
  /** Mp4 moja kwa moja (fallback ya embed) */
  mp4Url?: string;
  thumbnail: string;
  relatedProductSlug?: string;
};

export const beautyVideos: BeautyVideo[] = [
  {
    id: "v-001",
    title: "Rutini ya asubuhi ya skincare ndani ya dakika 5",
    description:
      "Jinsi ya kupaka serum, moisturizer na sunscreen kwa utaratibu sahihi.",
    duration: "5:12",
    providerId: "eEanU3wxMV4",
    thumbnail: "/images/videos/skincare-routine.svg",
    relatedProductSlug: "radiance-vitamin-c-serum",
  },
  {
    id: "v-002",
    title: "Mat lipstick ya muda mrefu: hatua kwa hatua",
    description:
      "Technique za kupaka lipstick isiyoondoke kwa siku nzima.",
    duration: "7:45",
    providerId: "TImxlxwY0kA",
    thumbnail: "/images/videos/lipstick-tutorial.svg",
    relatedProductSlug: "velvet-matte-lipstick-set",
  },
  {
    id: "v-003",
    title: "Kuchagua perfume inayokufaa",
    description:
      "Mwongozo wa harufu: jinsi ya kuchagua fragrance kwa hali ya hewa na matukio.",
    duration: "4:30",
    providerId: "5KVsamZits4",
    thumbnail: "/images/videos/perfume-guide.svg",
    relatedProductSlug: "amber-nights-eau-de-parfum",
  },
];

export type Review = {
  id: string;
  customerName: string;
  location: string;
  rating: number;
  comment: string;
  productSlug: string;
};

export const reviews: Review[] = [
  {
    id: "r-001",
    customerName: "Neema M.",
    location: "Dar es Salaam",
    rating: 5,
    comment:
      "Vitamin C serum hii imabadilisha ngozi yangu. Ngozi yangu angavu zaidi baada ya wiki tatu tu!",
    productSlug: "radiance-vitamin-c-serum",
  },
  {
    id: "r-002",
    customerName: "Asha K.",
    location: "Mwanza",
    rating: 5,
    comment:
      "Lipstick inadumu kweli. Naweza kula chakula bila kufuta. Na huduma ya wateja ilikuwa bora.",
    productSlug: "velvet-matte-lipstick-set",
  },
  {
    id: "r-003",
    customerName: "Sarah J.",
    location: "Arusha",
    rating: 4,
    comment:
      "Moisturizer nzuri sana, inaingia haraka na haifinyangi ngozi. Delivery ilifika kwa wakati.",
    productSlug: "hydra-glow-moisturizer",
  },
  {
    id: "r-004",
    customerName: "Zainabu H.",
    location: "Dodoma",
    rating: 5,
    comment:
      "Perfume hii ni ya ajabu! Kila mtu ananiuliza nimepaka nini. Inadumu siku nzima.",
    productSlug: "amber-nights-eau-de-parfum",
  },
  {
    id: "r-005",
    customerName: "Fatma S.",
    location: "Tanga",
    rating: 5,
    comment:
      "Cleanser hii haikaushi ngozi yangu kama zingine nilizotumia. Ngozi yangu imebaki laini.",
    productSlug: "gentle-foam-cleanser",
  },
  {
    id: "r-006",
    customerName: "Grace L.",
    location: "Mbeya",
    rating: 5,
    comment:
      "Sunscreen hii hauna ukungu kwenye ngozi yangu ya giza! Imebadilisha rutini yangu ya asubuhi.",
    productSlug: "sun-shield-spf50",
  },
  {
    id: "r-007",
    customerName: "Anna M.",
    location: "Iringa",
    rating: 4,
    comment:
      "Brashi nzuri sana na laini. Zinafanya makeup yangu ionekane ya kitaalamu.",
    productSlug: "pro-makeup-brush-set",
  },
  {
    id: "r-008",
    customerName: "Rehema J.",
    location: "Morogoro",
    rating: 5,
    comment:
      "Shampoo hii imesafisha nywele zangu vizuri sana. Nywele zangu zinaonekana afya na zina mwanga.",
    productSlug: "argan-repair-shampoo",
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
