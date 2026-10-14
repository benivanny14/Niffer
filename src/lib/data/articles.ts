/** Makala ya Kiswahili kuhusu kuchagua na kutumia bidhaa za urembo. */

export type Article = {
  slug: string;
  title: string;
  excerpt: string;
  category: "skincare" | "makeup" | "nywele" | "harufu" | "habari";
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
  { slug: "nywele", name: "Nywele" },
  { slug: "harufu", name: "Harufu" },
  { slug: "habari", name: "Habari" },
];

export const articles: Article[] = [
  {
    slug: "rutini-ya-skincare-ya-asubuhi",
    title: "Hatua rahisi za kutunza ngozi asubuhi",
    excerpt: "Usafi, unyevunyevu na kinga ya jua vinaweza kuwa mwanzo mzuri wa siku.",
    category: "skincare",
    author: "Timu ya Niffer",
    date: "2026-09-12",
    readMinutes: 4,
    image: "/images/packs/pack-135k-qe.jpg",
    body: [
      { paragraph: "Ratiba ya asubuhi haihitaji bidhaa nyingi. Chagua hatua chache zinazokufaa, na fuata maelekezo yaliyo kwenye kila bidhaa." },
      { heading: "1. Osha uso kwa upole", paragraph: "Tumia kisafishaji kinachofaa ngozi yako na maji ya uvuguvugu. Suuza vizuri, kisha kausha uso kwa taulo safi bila kusugua." },
      { heading: "2. Paka moisturizer", paragraph: "Ikiwa ngozi yako huhisi kukauka, paka moisturizer baada ya kuosha. Anza na kiasi kidogo na ongeza tu ikihitajika." },
      { heading: "3. Tumia sunscreen", paragraph: "Ukiwa nje wakati wa mchana, paka sunscreen yenye SPF 30 au zaidi kulingana na maelekezo ya bidhaa. Rudia kupaka kama lebo inavyoelekeza, hasa baada ya kuogelea au kutokwa jasho." },
      { paragraph: "Bidhaa mpya inaweza isiifae kila ngozi. Isijaribu kwanza kwenye eneo dogo na acha kuitumia ukiona muwasho unaoendelea." },
    ],
    relatedProductSlugs: ["purest-glow-pack-65k", "purest-glow-pack-100k", "purest-glow-pack-135k"],
  },
  {
    slug: "lipstick-ya-muda-mrefu-hatua-kwa-hatua",
    title: "Jinsi ya kupaka lipstick kwa mwonekano nadhifu",
    excerpt: "Andaa midomo, weka rangi kwa tabaka nyepesi na rekebisha kingo kwa utulivu.",
    category: "makeup",
    author: "Timu ya Niffer",
    date: "2026-09-28",
    readMinutes: 3,
    image: "/images/packs/pack-200k-glass-skin.jpg",
    body: [
      { paragraph: "Lipstick hukaa vizuri zaidi midomoni ikiwa safi na imetayarishwa. Matokeo hutegemea bidhaa na shughuli zako, kwa hiyo unaweza kuhitaji kuipaka tena." },
      { heading: "1. Andaa midomo", paragraph: "Paka lip balm kidogo ikiwa midomo imekauka. Iache kwa muda mfupi, kisha futa kiasi kilichobaki kabla ya kuweka rangi." },
      { heading: "2. Chora kingo", paragraph: "Tumia lip liner inayokaribiana na rangi ya lipstick, au ruka hatua hii kama unapendelea mwonekano wa kawaida." },
      { heading: "3. Weka lipstick", paragraph: "Paka tabaka jembamba kuanzia katikati ya mdomo. Unaweza kuongeza tabaka jingine ikiwa unataka rangi ionekane zaidi." },
      { heading: "4. Ondoa rangi ya ziada", paragraph: "Bonyeza tissue taratibu katikati ya midomo. Angalia kingo kwenye mwanga mzuri na usahihishe sehemu zinazohitaji." },
    ],
    relatedProductSlugs: ["body-pack-200k-glass", "body-pack-245k-rose"],
  },
  {
    slug: "kuchagua-perfume-inayokufaa",
    title: "Namna ya kuchagua harufu unayoipenda",
    excerpt: "Jaribu harufu moja baada ya nyingine na upe muda kabla ya kuamua.",
    category: "harufu",
    author: "Timu ya Niffer",
    date: "2026-10-02",
    readMinutes: 4,
    image: "/images/packs/pack-265k-eos.jpg",
    body: [
      { paragraph: "Harufu ni chaguo la mtu binafsi. Ile unayoipenda inaweza kuwa tofauti na anayopenda rafiki yako, kwa hiyo ni vizuri kuijaribu mwenyewe." },
      { heading: "Anza na aina unazopendelea", paragraph: "Harufu za citrus huwa na noti za matunda jamii ya machungwa; floral hukumbusha maua; na baadhi ya harufu zenye vanilla au mbao huwa na hisia nzito zaidi. Majina haya ni mwongozo tu—jaribu bidhaa yenyewe." },
      { heading: "Ijaribu kabla ya kununua", paragraph: "Ikiwezekana, jaribu kiasi kidogo kwenye ngozi au karatasi ya kupimia. Ipe dakika kadhaa kabla ya kuamua kama unaipenda, na epuka kupuliza karibu na macho au ngozi iliyowashwa." },
      { heading: "Tumia kulingana na lebo", paragraph: "Fuata maelekezo ya chupa. Kama unapuliza kwenye nguo, hakikisha lebo inaruhusu na jaribu kwanza sehemu isiyoonekana ili kuepuka doa." },
    ],
    relatedProductSlugs: ["body-pack-265k", "body-pack-140k"],
  },
  {
    slug: "nywele-zinazoumiza-5-tiba-za-argan",
    title: "Utunzaji wa nywele zilizokauka au kukatika",
    excerpt: "Hatua za kawaida za kuosha na kutunza nywele bila kuzisumbua kupita kiasi.",
    category: "nywele",
    author: "Timu ya Niffer",
    date: "2026-10-05",
    readMinutes: 4,
    image: "/images/packs/pack-mwanachuo-95k-argan.jpg",
    body: [
      { paragraph: "Nywele kukauka au kukatika kunaweza kuwa na sababu tofauti. Anza na utunzaji mpole na chagua bidhaa kulingana na mahitaji ya nywele zako." },
      { heading: "Osha kwa upole", paragraph: "Paka shampoo zaidi kichwani na usugue kwa ncha za vidole. Tumia mara kulingana na aina ya nywele na maelekezo ya bidhaa." },
      { heading: "Tumia conditioner", paragraph: "Baada ya shampoo, paka conditioner kwenye urefu wa nywele na ncha. Iache kwa muda ulioelekezwa kisha suuza." },
      { heading: "Punguza joto kali", paragraph: "Kama unatumia kifaa cha joto, tumia kiwango cha chini kinachokufaa na bidhaa ya kinga ya joto iliyoandikwa kwa matumizi hayo." },
      { paragraph: "Mafuta au bidhaa zenye argan zinaweza kuwa sehemu ya ratiba yako ikiwa zinakufaa. Fuata lebo; bidhaa moja haiwezi kutatua kila aina ya tatizo la nywele." },
    ],
    relatedProductSlugs: ["mwanachuo-pack-95k-argan", "body-pack-195k-coffee"],
  },
  {
    slug: "habari-kubwa-niffer-duka-jipya-dar",
    title: "Jinsi ya kuagiza bidhaa kwenye Niffer Cosmetics",
    excerpt: "Tafuta bidhaa, kagua maelezo na chagua njia inayokufaa ya kukamilisha oda.",
    category: "habari",
    author: "Timu ya Niffer",
    date: "2026-10-08",
    readMinutes: 2,
    image: "/images/packs/pack-245k-ogx-rose.jpg",
    body: [
      { paragraph: "Unaweza kuanza kwa kutafuta bidhaa kwa jina au kuchagua kategoria kwenye duka. Fungua ukurasa wa bidhaa ili kuona maelezo, bei na upatikanaji wake." },
      { heading: "Kagua bidhaa na oda", paragraph: "Chagua bidhaa unazotaka na uziongeze kwenye kikapu. Kabla ya kuendelea, hakiki majina, idadi na jumla ya gharama." },
      { heading: "Weka maelezo ya kupokea", paragraph: "Jaza jina, namba ya simu na anwani ya kufikishiwa. Kagua gharama na makadirio ya muda wa usafirishaji yanayoonyeshwa wakati wa kulipa." },
      { heading: "Unahitaji msaada?", paragraph: "Wasiliana nasi kupitia namba ya simu au WhatsApp iliyo kwenye ukurasa wa mawasiliano ikiwa una swali kuhusu bidhaa au oda." },
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
