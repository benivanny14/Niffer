import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sera ya Faragha",
  description: "Jinsi Niffer Cosmetics inavyotumia na kulinda taarifa zako.",
};

const sections = [
  {
    h: "Taarifa tunazokusanya",
    p: "Tunakusanya jina, namba ya simu, anwani na barua pepe unapoweka oda au kujiunga na jarida. Pia tunahifadhi historia ya oda zako kwenye kifaa chako.",
  },
  {
    h: "Jinsi tunavyotumia taarifa",
    p: "Tunatumia taarifa zako kusafirisha oda, kuwasiliana kuhusu hali ya oda, na kukutumia ofa unazokubali. Hatuziuzi taarifa zako kwa watu wa tatu.",
  },
  {
    h: "Malipo",
    p: "Malipo hufanywa kupitia M-Pesa, Mixx by Yas, Airtel Money au kulipa bidhaa inapofikishwa. Hatuhifadhi taarifa zozote za kadi za benki kwenye seva zetu.",
  },
  {
    h: "Haki zako",
    p: "Unaweza kuomba kuona, kurekebisha, au kufuta taarifa zako wakati wowote. Wasiliana nasi kwa WhatsApp au barua pepe.",
  },
  {
    h: "Vidakuzi",
    p: "Tovuti yetu inatumia localStorage kuhifadhi kikapu chako na bidhaa unazopenda kwenye kifaa chako. Hatumii vidakuzi vya ufuatiliaji.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="container-x max-w-3xl py-12 lg:py-16">
      <p className="eyebrow">Kisheria</p>
      <h1 className="heading-display mt-2">Sera ya Faragha</h1>
      <p className="mt-3 text-ink-500">
        Tunaheshimu faragha yako. Hapa kuelezea jinsi tunavyokusanya na
        kulinda taarifa zako.
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
