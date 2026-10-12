import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Maswali Yanayoulizwa Mara Kwingi",
  description:
    "Maswali ya kawaida kuhusu ununuzi, malipo, usafirishaji na marejesho kwa Niffer Cosmetics.",
};

const faqs = [
  {
    q: "Je, bidhaa zenu ni halisi?",
    a: "Ndiyo. Kila bidhaa tunayouza ni asili 100% na inatoka kwa wasambazaji waliothibitishwa. Tunachukua hatua ya ziada kuhakikisha ubora kabla ya kuwasilisha kwako.",
  },
  {
    q: "Nalipaje?",
    a: "Tunapokea M-Pesa, Mixx by Yas, Airtel Money, na malipo poa (lipa baada ya kupokea bidhaa). Chagua njia unayopenda kwenye hatua ya malipo.",
  },
  {
    q: "Mnaleta wapi na kwa gharama gani?",
    a: "Dar es Salaam tunafikisha ndani ya siku 1–2. Usafirishaji ni bure kwa oda zaidi ya TSh 50,000 Dar es Salaam, vinginevyo TSh 3,000. Mikoa mingine huchukua siku 2–5.",
  },
  {
    q: "Naweza kurudisha bidhaa?",
    a: "Ndiyo, ndani ya siku 7 ikiwa bidhaa haijatumika na ipo kwenye hali ya asili. Angalia ukurasa wa Marejesho kwa undani.",
  },
  {
    q: "Nafuatiliaje oda yangu?",
    a: "Baada ya kuweka oda, utapata nambari ya oda (mfano NCF-8F3K). Tumia ukurasa wa Fuatilia Oda kuona hatua iliyofikia.",
  },
  {
    q: "Mna duka la kimwili?",
    a: "Ndiyo, tupo Mtaa wa Samora, Dar es Salaam, Jumatatu hadi Jumamosi, 9:00 hadi 20:00. Unaweza pia kuagiza kwa WhatsApp.",
  },
];

export default function FaqPage() {
  return (
    <div className="container-x max-w-3xl py-12 lg:py-16">
      <p className="eyebrow">Msaada</p>
      <h1 className="heading-display mt-2">
        Maswali yanayoulizwa mara kwingi
      </h1>
      <p className="mt-3 text-ink-500">
        Hapa pata majibu ya maswali ya kawaida. Ukitapata swali, tupo hapa
        kukusaidia.
      </p>

      <div className="mt-10 space-y-3">
        {faqs.map((item) => (
          <details key={item.q} className="card group p-5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-ink-900">
              {item.q}
              <span className="text-accent transition-transform group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-ink-500">
              {item.a}
            </p>
          </details>
        ))}
      </div>

      <div className="card mt-10 p-6 text-center">
        <p className="font-display text-lg text-ink-900">
          Uko na swali lingine?
        </p>
        <p className="mt-1 text-sm text-ink-500">
          Tupo wazi kukusaidia — piga simu, tuma WhatsApp, au tembelea duka
          letu.
        </p>
        <Link href="/wasiliana" className="btn-primary mt-5">
          Wasiliana Nasi
        </Link>
      </div>
    </div>
  );
}
