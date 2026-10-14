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
    "Taarifa za duka la mtandaoni la Niffer Cosmetics na namna ya kuwasiliana nasi.",
};

const values = [
  {
    icon: ShieldIcon,
    title: "Maelezo wazi",
        body: "Tunaweka maelezo ya kila bidhaa wazi ili uweze kuyakagua kabla ya kuagiza.",
  },
  {
    icon: TruckIcon,
    title: "Usafirishaji wa haraka",
        body: "Tunakueleza gharama na makadirio ya muda wa kufika wakati wa kuagiza.",
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
        Bidhaa za urembo, kwa urahisi wa kuagiza
      </h1>
      <p className="mt-5 max-w-2xl leading-relaxed text-ink-500">
        Niffer Cosmetics ni duka la mtandaoni la bidhaa za urembo. Vinjari
        bidhaa, soma maelezo na wasiliana nasi ukiwa na swali kabla ya
        kukamilisha oda yako.
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
          <p className="eyebrow">Duka letu</p>
          <h2 className="heading-display mt-2 text-3xl">
            Tafuta bidhaa kwa urahisi
          </h2>
          <p className="mt-4 leading-relaxed text-ink-500">
            Tunakusanya bidhaa za skincare, makeup, nywele na harufu kwenye
            sehemu moja ili iwe rahisi kuzitafuta na kulinganisha kabla ya
            kuagiza.
          </p>
          <p className="mt-4 leading-relaxed text-ink-500">
            Una swali kuhusu bidhaa, malipo au usafirishaji? Timu yetu inaweza
            kukusaidia kupitia simu au barua pepe zilizo hapa chini.
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
        <div className="relative aspect-4/5 overflow-hidden rounded-2xl bg-cream-200">
          <SparkleIcon className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 text-brand-300" />
        </div>
      </section>

      <section className="mt-16 rounded-2xl bg-cream-100 p-8">
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
