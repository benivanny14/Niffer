import type { Metadata } from "next";
import Link from "next/link";
import { CheckIcon, CloseIcon } from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "Marejesho",
  description:
    "Sera ya marejesho na ubadilishaji wa bidhaa za Niffer Cosmetics.",
};

const can = [
  "Bidhaa haijatumika na iko kwenye hali ya asili",
  "Urejesho ndani ya siku 7 tangu ulipokea oda",
  "Unaonyesha risiti au nambari ya oda",
  "Urejeshaji wa pesa au ubadilishaji wa bidhaa",
];

const cannot = [
  "Bidhaa zilizofunguliwa au zilizotumika",
  "Bidhaa za urembo zinazotumia moja kwa moja kwenye ngozi (mascara, lipsticks)",
  "Oda zilizopita zaidi ya siku 7",
];

export default function ReturnsPage() {
  return (
    <div className="container-x max-w-3xl py-12 lg:py-16">
      <p className="eyebrow">Huduma</p>
      <h1 className="heading-display mt-2">Marejesho na Uborekaji</h1>
      <p className="mt-3 text-ink-500">
        Ukipata bidhaa isiyo sawa au haikufurahisha, tuko hapa kukusaidia.
        Tunataka uwe na uhalali kila unaponunua.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        <div className="card p-6">
          <h2 className="flex items-center gap-2 font-display text-lg text-success-600">
            <CheckIcon className="h-5 w-5" />
            Tunaruhusu
          </h2>
          <ul className="mt-4 space-y-2.5 text-sm text-ink-500">
            {can.map((c) => (
              <li key={c} className="flex gap-2">
                <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-success-600" />
                {c}
              </li>
            ))}
          </ul>
        </div>
        <div className="card p-6">
          <h2 className="flex items-center gap-2 font-display text-lg text-danger-600">
            <CloseIcon className="h-5 w-5" />
            Haturuhusu
          </h2>
          <ul className="mt-4 space-y-2.5 text-sm text-ink-500">
            {cannot.map((c) => (
              <li key={c} className="flex gap-2">
                <CloseIcon className="mt-0.5 h-4 w-4 shrink-0 text-danger-600" />
                {c}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <section className="mt-10">
        <h2 className="font-display text-2xl text-ink-900">
          Jinsi ya kurejesha
        </h2>
        <ol className="mt-4 space-y-3 text-sm text-ink-500">
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-accent">
              1
            </span>
            <p>
              Wasiliana nasi ndani ya siku 7 kupitia WhatsApp au simu, uonyeshe
              nambari ya oda yako.
            </p>
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-accent">
              2
            </span>
            <p>
              Tutakupa maelekezo ya kurejesha bidhaa (kupitia duka letu au
              courier).
            </p>
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-accent">
              3
            </span>
            <p>
              Baada ya kupokea na kukagua, tutakupa urejeshaji wa pesa au
              ubadilishaji.
            </p>
          </li>
        </ol>
        <div className="mt-8">
          <Link href="/wasiliana" className="btn-primary">
            Wasiliana Nasi
          </Link>
        </div>
      </section>
    </div>
  );
}
