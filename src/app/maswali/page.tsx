import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Maswali Yanayoulizwa Mara Kwingi",
  description:
    "Maswali ya kawaida kuhusu ununuzi, malipo, usafirishaji na marejesho kwa Niffer Cosmetics.",
};

const faqs = [
  {
    q: "Ninawezaje kujua maelezo ya bidhaa?",
    a: "Fungua ukurasa wa bidhaa ili kuona picha, bei na maelezo yaliyowekwa. Ukiwa na swali zaidi, wasiliana nasi kabla ya kuagiza.",
  },
  {
    q: "Nalipaje?",
    a: "Tunapokea M-Pesa, Mixx by Yas, Airtel Money, au unaweza kulipa bidhaa ikikufikia. Chagua njia unayopenda wakati wa kukamilisha oda.",
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
    q: "Ninawezaje kuwasiliana nanyi?",
    a: "Tumia namba ya simu, WhatsApp au barua pepe iliyo kwenye ukurasa wa mawasiliano. Kwa anwani na saa za huduma, angalia taarifa zilizo chini ya tovuti.",
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
