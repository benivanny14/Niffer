import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { BulkCalculator, RfqForm } from "@/components/wholesale/JumlaPortal";
import { listProducts } from "@/lib/server/catalog";
import { bulkTiers as tiers } from "@/lib/wholesale";
import { ShieldIcon, TruckIcon, TagIcon } from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "Uuzaji wa Jumla",
  description:
    "Portali ya jumla ya Niffer Cosmetics — bei za wingi kwa wauzaji, saluni na maduka ya urembo Tanzania. Ombi la bei (RFQ) na kufuatilia ombi lako.",
};

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

export default async function WholesalePage() {
  // Bidhaa za DB kwa kikokotoo na fomu ya RFQ.
  await connection();
  const products = await listProducts();

  return (
    <div className="container-x py-12 lg:py-16">
      <p className="eyebrow">Biashara · Portali ya jumla</p>
      <h1 className="heading-display mt-2">Uuzaji wa jumla</h1>
      <p className="mt-3 max-w-2xl text-ink-500">
        Uza bidhaa za Niffer Cosmetics kwenye saluni, maduka yako au mtandaoni.
        Tunatoa bei za jumla kwa wauzaji wote Tanzania, na msaada wa kuanza
        biashara.
      </p>

      {/* Portali: fuatilia ombi */}
      <div className="card mt-8 flex flex-wrap items-center justify-between gap-4 border-brand-300 p-6">
        <div>
          <h2 className="font-display text-xl text-ink-900">
            Tayari umeweka ombi la bei?
          </h2>
          <p className="mt-1 text-sm text-ink-500">
            Fuatilia hatua ya RFQ yako na bei iliyowekwa na timu — kwa namba ya
            simu uliyotumia.
          </p>
        </div>
        <Link href="/jumla/ombi" className="btn-primary">
          Fuatilia ombi langu
        </Link>
      </div>

      {/* Faida */}
      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {benefits.map(({ icon: Icon, title, description }) => (
          <div key={title} className="card flex items-start gap-3 p-5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-100 text-accent">
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
                    <span className="badge bg-brand-100 text-accent">
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

      {/* Kikokotoo cha bei ya jumla */}
      <section className="mt-12">
        <h2 className="font-display text-2xl text-ink-900">
          Kokotoa bei yako mara moja
        </h2>
        <div className="mt-6">
          <BulkCalculator products={products} />
        </div>
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
              className="font-medium text-accent hover:underline"
            >
              Wasiliana nasi
            </Link>{" "}
            au piga simu.
          </p>
        </div>
        <RfqForm products={products} />
      </section>
    </div>
  );
}
