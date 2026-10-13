import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";
import {
  ChatIcon,
  ShieldIcon,
  SparkleIcon,
  TruckIcon,
} from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "Kuhusu Niffer Cosmetics",
  description:
    "Jinsi Niffer Cosmetics ilivyoanzishwa na jinsi tunavyotoa bidhaa za urembo halisi kwa Tanzania.",
};

const values = [
  {
    icon: ShieldIcon,
    title: "Ubora halisi",
    body: "Tunachagua bidhaa kutoka kwa wasambazaji waliothibitishwa pekee. Kila bidhaa ni asili 100%.",
  },
  {
    icon: TruckIcon,
    title: "Usafirishaji wa haraka",
    body: "Dar es Salaam ndani ya siku 1–2, na mikoa yote ya Tanzania kwa bei nafuu.",
  },
  {
    icon: ChatIcon,
    title: "Huduma ya wateja",
    body: "Tunakusaidia kuchagua bidhaa zinazokufaa, kabla na baada ya ununuzi.",
  },
];

export default function AboutPage() {
  return (
    <div className="container-x py-12 lg:py-16">
      <p className="eyebrow">Kuhusu Niffer</p>
      <h1 className="heading-display mt-2 max-w-2xl">
        Urembo halisi, ubora wa juu — kwa kila mwanamke wa Tanzania
      </h1>
      <p className="mt-5 max-w-2xl leading-relaxed text-ink-500">
        Niffer Cosmetics ilianza kwa damu moja: kuleta bidhaa za urembo za
        ubora wa juu kwa bei wanayostahili Watananzia. Tunauza skincare,
        makeup, huduma za nywele na fragrance zilizochaguliwa kwa makini —
        kila bidhaa tunayouza ni tunayojiamini kuutumia wenyewe.
      </p>

      <section className="mt-12 grid gap-6 sm:grid-cols-3">
        {values.map(({ icon: Icon, title, body }) => (
          <div key={title} className="card p-6">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-100 text-accent">
              <Icon className="h-5 w-5" />
            </span>
            <h2 className="mt-4 font-display text-lg text-ink-900">{title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-500">{body}</p>
          </div>
        ))}
      </section>

      <section className="mt-16 grid items-center gap-10 lg:grid-cols-2">
        <div>
          <p className="eyebrow">Hadithi yetu</p>
          <h2 className="heading-display mt-2 text-3xl">
            Kutoka kwa ndoto hadi duka lako mtandaoni
          </h2>
          <p className="mt-4 leading-relaxed text-ink-500">
            Tulianza kwa kuuza bidhaa chache kwa marafiki na jirani Dar es
            Salaam. Baada ya wateja kurudi mara kwa mara na kusema &ldquo;bidhaa
            zenu ni halisi&rdquo;, tukaona fursa: kuleta duka la urembo linaloaminika
            mtandaoni kwa wote Tanzania.
          </p>
          <p className="mt-4 leading-relaxed text-ink-500">
            Leo, tunahudumia wateja zaidi ya 10,000 katika mikoa yote. Bado
            tuna uhakika mmoja: kila bidhaa lazima ionekane thamani kwa mteja
            wetu.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/bidhaa" className="btn-primary">
              Vinjari Bidhaa
            </Link>
            <Link href="/wasiliana" className="btn-outline">
              Wasiliana Nasi
            </Link>
          </div>
        </div>
        <div className="relative aspect-4/5 overflow-hidden rounded-sm bg-cream-200">
          <SparkleIcon className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 text-brand-300" />
        </div>
      </section>

      <section className="mt-16 rounded-sm bg-cream-100 p-8">
        <h2 className="font-display text-2xl text-ink-900">Wasiliana</h2>
        <div className="mt-4 grid gap-4 text-sm sm:grid-cols-3">
          <div>
            <p className="text-ink-500">Simu / WhatsApp</p>
            <a
              href={`tel:${site.phoneTel}`}
              className="font-medium text-accent hover:underline"
            >
              {site.phoneDisplay}
            </a>
          </div>
          <div>
            <p className="text-ink-500">Barua pepe</p>
            <a
              href={`mailto:${site.email}`}
              className="font-medium text-accent hover:underline"
            >
              {site.email}
            </a>
          </div>
          <div>
            <p className="text-ink-500">Ofisi</p>
            <p className="font-medium text-ink-900">{site.address}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
