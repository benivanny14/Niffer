import type { Metadata } from "next";
import Link from "next/link";
import { WholesaleForm } from "@/components/ui/WholesaleForm";
import { ShieldIcon, TruckIcon, TagIcon } from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "Uuzaji wa Jumla",
  description:
    "Uza bidhaa za Niffer Cosmetics kwa jumla — bei za jumla kwa wauzaji, saluni na maduka ya urembo Tanzania.",
};

const tiers = [
  { min: 10, max: 24, discount: 10, label: "Jumla ya Daraja 1" },
  { min: 25, max: 49, discount: 15, label: "Jumla ya Daraja 2" },
  { min: 50, max: null, discount: 22, label: "Jumla ya Daraja 3" },
];

const benefits = [
  {
    icon: TagIcon,
    title: "Bei za jumla",
    description: "Punguzo hadi 22% kulingana na wingi wa oda yako.",
  },
  {
    icon: TruckIcon,
    title: "Usafirishaji maalum",
    description: "Usafirishaji bure Dar es Salaam kwa oda ya jumla.",
  },
  {
    icon: ShieldIcon,
    title: "Bidhaa halisi",
    description: "Kila bidhaa ina cheti cha ubora kutoka kwa wasambazaji.",
  },
];

export default function WholesalePage() {
  return (
    <div className="container-x py-12 lg:py-16">
      <p className="eyebrow">Biashara</p>
      <h1 className="heading-display mt-2">Uuzaji wa jumla</h1>
      <p className="mt-3 max-w-2xl text-ink-500">
        Uza bidhaa za Niffer Cosmetics kwenye saluni, maduka yako au mtandaoni.
        Tunatoa bei za jumla kwa wauzaji wote Tanzania, na msaada wa kuanza
        biashara.
      </p>

      {/* Faida */}
      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {benefits.map(({ icon: Icon, title, description }) => (
          <div key={title} className="card flex items-start gap-3 p-5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700">
              <Icon className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-sm font-semibold text-ink-900">{title}</h2>
              <p className="mt-0.5 text-sm text-ink-500">{description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tier table */}
      <section className="mt-12">
        <h2 className="font-display text-2xl text-ink-900">
          Bei za jumla kwa wingi
        </h2>
        <div className="card mt-6 overflow-x-auto">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead>
              <tr className="border-b border-cream-300 text-xs uppercase tracking-wide text-ink-400">
                <th className="px-5 py-3 font-semibold">Daraja</th>
                <th className="px-5 py-3 font-semibold">Wingi</th>
                <th className="px-5 py-3 font-semibold">Punguzo</th>
                <th className="px-5 py-3 font-semibold">Maelezo</th>
              </tr>
            </thead>
            <tbody>
              {tiers.map((tier) => (
                <tr
                  key={tier.label}
                  className="border-b border-cream-200 last:border-0"
                >
                  <td className="px-5 py-4 font-medium text-ink-900">
                    {tier.label}
                  </td>
                  <td className="px-5 py-4 text-ink-700">
                    {tier.min}+ {tier.max ? `– ${tier.max}` : " bidhaa"}
                  </td>
                  <td className="px-5 py-4">
                    <span className="badge bg-brand-100 text-brand-700">
                      -{tier.discount}%
                    </span>
                  </td>
                  <td className="px-5 py-4 text-ink-500">
                    {tier.max
                      ? "Inafaa kwa wauzaji wanaoanza"
                      : "Kwa maagizo makubwa na maduka makubwa"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-ink-400">
          Bei za jumla hutumika kwa bidhaa zote isipokuwa tayari ziko kwenye
          punguzo. Mshawaho unahesabiwa kwa kila bidhaa kwa wakati mmoja.
        </p>
      </section>

      {/* Fomu */}
      <section className="mt-12 grid gap-10 lg:grid-cols-2">
        <div>
          <h2 className="font-display text-2xl text-ink-900">
            Omba bei ya jumla
          </h2>
          <p className="mt-3 text-ink-500">
            Jaza fomu hii na tutakupigia simu ndani ya saa 24 (Jumatatu–Jumamosi)
            na bei zilizoborezwa kwa oda yako.
          </p>
          <ul className="mt-6 space-y-3 text-sm text-ink-500">
            <li>• Tunakubali malipo kwa M-Pesa, Mixx by Yas, Airtel Money</li>
            <li>• Usafirishaji bure Dar es Salaam kwa oda ya jumla</li>
            <li>• Malipo ya awali 50% kwa maagizo makubwa zaidi ya TSh 1,000,000</li>
          </ul>
          <p className="mt-6 text-sm text-ink-500">
            Je, unahitaji ushauri?{" "}
            <Link
              href="/wasiliana"
              className="font-medium text-brand-700 hover:underline"
            >
              Wasiliana nasi
            </Link>{" "}
            au piga simu.
          </p>
        </div>
        <WholesaleForm />
      </section>
    </div>
  );
}
