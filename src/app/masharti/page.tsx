import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Masharti ya Matumizi",
  description: "Masharti ya kutumia tovuti na kununua kwa Niffer Cosmetics.",
};

const sections = [
  {
    h: "Kukubali masharti",
    p: "Kwa kutumia tovuti hii unakubali masharti yote. Kama hukubali, tafadhali usitumie huduma zetu.",
  },
  {
    h: "Bei na bidhaa",
    p: "Tunajitahidi kuhakikisha bei na maelezo ya bidhaa ni sahihi. Kama kuna makosa, tunaweza kukujulisha kabla ya kuthibitisha oda yako.",
  },
  {
    h: "Oda na malipo",
    p: "Oda huhesabika pale unapopokea uthibitisho kutoka kwetu. Tunaweza kukataa oda kama bidhaa imeisha stoo.",
  },
  {
    h: "Usafirishaji",
    p: "Muda wa usafirishaji ni makadirio. Hatuhesabiki kwa kuchelewa kwa sababu za nje (hali ya hewa, misafara ya ndege).",
  },
  {
    h: "Marejesho",
    p: "Marejesho hufuata sera yetu ya marejesho. Tafadhali angalia ukurasa wa Marejesho kwa masharti kamili.",
  },
  {
    h: "Mawasiliano",
    p: "Kwa maswali yoyote kuhusu masharti haya, wasiliana nasi kupitia WhatsApp au barua pepe.",
  },
];

export default function TermsPage() {
  return (
    <div className="container-x max-w-3xl py-12 lg:py-16">
      <p className="eyebrow">Kisheria</p>
      <h1 className="heading-display mt-2">Masharti ya Matumizi</h1>
      <p className="mt-3 text-ink-500">
        Haya ndio masharti ya kutumia tovuti na huduma za Niffer Cosmetics.
      </p>
      <div className="mt-10 space-y-8">
        {sections.map((s) => (
          <section key={s.h}>
            <h2 className="font-display text-xl text-ink-900">{s.h}</h2>
            <p className="mt-2 leading-relaxed text-ink-500">{s.p}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
