/**
 * Makala za urembo (blog) — mock data.
 * Baada ya CMS, badilisha hapa au tuta-fetch kutoka API.
 */

export type Article = {
  slug: string;
  title: string;
  excerpt: string;
  category: "skincare" | "makeup" | "nywele" | "harufu" | "habari";
  author: string;
  date: string; // ISO
  readMinutes: number;
  image: string;
  /** Aya za maudhui — kila kipengele ni aya au kichwa kidogo. */
  body: { heading?: string; paragraph: string }[];
  relatedProductSlugs: string[];
};

export const articleCategories: { slug: Article["category"]; name: string }[] = [
  { slug: "skincare", name: "Skincare" },
  { slug: "makeup", name: "Makeup" },
  { slug: "nywele", name: "Nywele" },
  { slug: "harufu", name: "Harufu" },
  { slug: "habari", name: "Habari" },
];

export const articles: Article[] = [
  {
    slug: "rutini-ya-skincare-ya-asubuhi",
    title: "Rutini ya asubuhi ya skincare ndani ya dakika 5",
    excerpt:
      "Hatua sahihi tatu za kuanza siku: safisha, hifadhi unyevu, na kinga ya jua — hata ukiwa na muda mfupi.",
    category: "skincare",
    author: "Neema M.",
    date: "2026-09-12",
    readMinutes: 5,
    image: "/images/videos/skincare-routine.svg",
    body: [
      {
        paragraph:
          "Ngozi yenye afya huanza asubuhi. Rutini sahihi haichukui zaidi ya dakika tano, lakini ina athara ya muda mrefu: inauzuia uzeze, kuoza, na mabadiliko ya rangi yanayosababishwa na jua.",
      },
      {
        heading: "Hatua ya 1: Safisha kwa upole",
        paragraph:
          "Tumia cleanser laini yenye pH karibu na 5.5. Paka kwenye uso wa mnyevu na piga mviringo kwa dakika 60 kabla ya kusuka. Usitumie sabuni kali — huvunja kinga ya ngozi na kuisababisha kutoa mafuta ya ziada.",
      },
      {
        heading: "Hatua ya 2: Hifadhi unyevu",
        paragraph:
          "Baada ya kusafisha, paka serum kama Vitamin C kwa mwanga, kisha moisturizer kwa unyevu. Serum huingia kwanza kwa sababu molekuli zake ni ndogo kuliko za moisturizer.",
      },
      {
        heading: "Hatua ya 3: Kinga ya jua — si hiari",
        paragraph:
          "Sunscreen ya SPF 30+ ni hatua ya mwisho na muhimu zaidi. Ikiwa unatumia tu hatua moja kutoka kwenye list hii, ichague sunscreen. Jua husababisha 80% ya dalili za uzeze kwenye ngozi.",
      },
      {
        paragraph:
          "Ukidumisha rutini hii kwa wiki nne, utaona tofauti: ngozi angavu, laini, na yenye unyevu wa asili. Kwa bidhaa zinazofaa, angalia kategoria ya Skincare kwenye duka letu.",
      },
    ],
    relatedProductSlugs: [
      "gentle-foam-cleanser",
      "radiance-vitamin-c-serum",
      "sun-shield-spf50",
    ],
  },
  {
    slug: "lipstick-ya-muda-mrefu-hatua-kwa-hatua",
    title: "Mat lipstick ya muda mrefu: hatua kwa hatua",
    excerpt:
      "Technique nne rahisi za kupaka lipstick isiyofutika hata baada ya kula chakula.",
    category: "makeup",
    author: "Asha K.",
    date: "2026-09-28",
    readMinutes: 4,
    image: "/images/videos/lipstick-tutorial.svg",
    body: [
      {
        paragraph:
          "Lipstick ya matte inadumu kwa saa nyingi — lakini tu kama imepakwa kwa taratibu sahihi. Hii hapa ndiyo routine tunayotumia wenyewe.",
      },
      {
        heading: "1. Tayarisha midomo",
        paragraph:
          "Paka lip balm dakika 10 kabla ya makeup. Kisha futa ziada kwa kitambaa — midomo yenye unyevu kidogo hushika rangi vizuri zaidi kuliko midomo yenye mafuta mengi.",
      },
      {
        heading: "2. Paka liner kwanza",
        paragraph:
          "Chora midomo yako kwa lip liner ya rangi ya karibu. Hii hutoa msingi wa rangi na kuzuia lipstick kufurika nje ya mistari ya midomo.",
      },
      {
        heading: "3. Tabaka la kwanza na la pili",
        paragraph:
          "Paka tabaka la kwanza kwa brashi ya midomo, kisha mnyafuse kwa kitambaa. Rudia na tabaka la pili. Tabaka mbili nyepesi zaidi kuliko tabaka moja zito.",
      },
      {
        heading: "4. Futa ziada",
        paragraph:
          "Weka kitambaa kati ya midomo yako na bonyeza upole — huondoa mafuta ya ziada na kubakiza rangi pekee. Sasa lipstick yako imekamilika kwa siku nzima.",
      },
    ],
    relatedProductSlugs: ["velvet-matte-lipstick-set", "pro-makeup-brush-set"],
  },
  {
    slug: "kuchagua-perfume-inayokufaa",
    title: "Kuchagua perfume inayokufaa: mwongozo wa harufu",
    excerpt:
      "Familia tatu za harufu, jinsi ya kuzijaribu, na ni yupi anafaa na hali ya hewa ya Tanzania.",
    category: "harufu",
    author: "Zainabu H.",
    date: "2026-10-02",
    readMinutes: 6,
    image: "/images/videos/perfume-guide.svg",
    body: [
      {
        paragraph:
          "Perfume ni uamuzi wa kibinafsi sana — harufu inayokufaa wewe si lazima imfahie rafiki yako. Lakini kuna kanuni chache zinazokuongoza kuchagua chaguo sahihi.",
      },
      {
        heading: "Familia tatu kuu",
        paragraph:
          "Citrus (bergamot, limao) ni nyepesi na yenye nishati — inafaa mchana. Floral (rose, jasmine) ni ya kifahari na ya kike. Oriental/Amber (vanilla, cedar, musk) ni nzito na ya jioni.",
      },
      {
        heading: "Jinsi ya kujaribu",
        paragraph:
          "Usipake perfume kwenye karatasi — paka kwenye ngozi yako. Harufu hubadilika na joto la mwili wako. Ngoisha dakika 30 kabla ya kuamua, kwa sababu midundo ya juu huondoka na kubaki msingi.",
      },
      {
        heading: "Kwa hali ya hewa ya Tanzania",
        paragraph:
          "Joto la joto linahitaji harufu nyepesi: citrus, aquatic, au body mist. Kwa jioni na matukio maalum, amber na vanilla hubaki kwa muda mrefu na kuonekana za kifahari zaidi.",
      },
      {
        paragraph:
          "Kidokezo: paka perfume kwenye maendo ya nabii — shingo, nyuma ya masikio, na pulse points. Usifute; harufu huachwa iendelee kutoka mwilini.",
      },
    ],
    relatedProductSlugs: [
      "amber-nights-eau-de-parfum",
      "tropical-bloom-body-mist",
    ],
  },
  {
    slug: "nywele-zinazoumiza-5-tiba-za-argan",
    title: "Nywele zinazoumiza? Tiba tano za argan za kila wiki",
    excerpt:
      "Kutoka kwa kukausha hadi kupasuka — jinsi ya kurejesha nywele zako kwa ratiba rahisi ya wiki moja.",
    category: "nywele",
    author: "Rehema J.",
    date: "2026-10-05",
    readMinutes: 5,
    image: "/images/products/argan-repair-shampoo.svg",
    body: [
      {
        paragraph:
          "Nywele zinazoumiza ni ishara ya unyevu uliopungua na protein iliyopungua. Tiba sahihi si ya gharama kubwa — ni ya kudumu kwa wiki nne.",
      },
      {
        heading: "Wiki ya 1: Msingi wa usafi",
        paragraph:
          "Tumia shampoo ya repair ya argan mara mbili kwa wiki. Paka kwenye scalpa pekee na acha maji yasafishe miisho — shampoo nyingi huua unyevu wa miisho.",
      },
      {
        heading: "Wiki ya 2–3: Conditioner na masaji",
        paragraph:
          "Baada ya shampoo, paka conditioner kutoka katikati hadi ukingo. Acha dakika 3 kisha suka kwa maji baridi — baridi hufunga cuticle na kutoa mwanga.",
      },
      {
        heading: "Wiki ya 4: Mask ya muda mrefu",
        paragraph:
          "Mara moja kwa wiki, paka argan oil safi kwenye nywele kabla ya kuoga na acha kwa saa 1. Hii ni tiba ya kina kabla ya kurejea kwenye ratiba ya kawaida.",
      },
      {
        paragraph:
          "Epuka joto la moja kwa moja bila spray ya kinga, na punguza kupiga nywele kwa mavuzi. Uthabiti ndio siri kubwa kuliko bidhaa yoyote.",
      },
    ],
    relatedProductSlugs: ["argan-repair-shampoo", "silk-touch-conditioner"],
  },
  {
    slug: "habari-kubwa-niffer-duka-jipya-dar",
    title: "Habari: duka letu jipya linafunguliwa Dar es Salaam",
    excerpt:
      "Tunazindua duka la kimwili Mtaa wa Samora — karibu na wateja wetu zaidi.",
    category: "habari",
    author: "Timu ya Niffer",
    date: "2026-10-08",
    readMinutes: 3,
    image: "/images/hero.svg",
    body: [
      {
        paragraph:
          "Baada ya miaka miwili ya kuuza mtandaoni, tumefungua duka letu la kwanza la kimwili Mtaa wa Samora, Dar es Salaam.",
      },
      {
        heading: "Kwa nini duka la kimwili?",
        paragraph:
          "Wateja wetu wengi walitaka kuona na kupaka bidhaa kabla ya kununua. Duka letu lina maonyesho ya kila aina ya bidhaa, na timu yetu ya wataalamu iko hapo kushauri.",
      },
      {
        heading: "Ofa ya kuzindua",
        paragraph:
          "Kwa mwezi wa kwanza, punguzo la 10% kwa kila oda ya kimwili, na usafirishaji bure Dar es Salaam kwa oda zilizoagizwa mtandaoni.",
      },
      {
        paragraph:
          "Karibu sana — Jumatatu hadi Jumamosi, 9:00 hadi 20:00. Pia unaweza kuagiza kwa WhatsApp kama huwezi kufika.",
      },
    ],
    relatedProductSlugs: [],
  },
];

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("sw-TZ", {
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
