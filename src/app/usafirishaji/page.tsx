import type { Metadata } from "next";
import { site } from "@/lib/site";
import { ClockIcon, MapPinIcon, TruckIcon } from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "Usafirishaji na Malipo",
  description:
    "Maelezo ya usafirishaji, gharama, muda wa kufika, na njia za malipo za Niffer Cosmetics.",
};

const zones = [
  {
    zone: "Dar es Salaam",
    time: "Siku 1–2",
    fee: "TSh 3,000 · Bure kwa oda > TSh 50,000",
  },
  {
    zone: "Mikoa mingine (bara)",
    time: "Siku 2–5",
    fee: "TSh 5,000 – 10,000 kulingana na umbali",
  },
  {
    zone: "Zanzibar",
    time: "Siku 3–6",
    fee: "TSh 8,000",
  },
];

export default function ShippingPage() {
  return (
    <div className="container-x max-w-3xl py-12 lg:py-16">
      <p className="eyebrow">Huduma</p>
      <h1 className="heading-display mt-2">Usafirishaji na Malipo</h1>
      <p className="mt-3 text-ink-500">
        Tunahakikisha oda yako inafika salama na kwa wakati. Hapa kuna
        maelezo kamili.
      </p>

      <section className="mt-10">
        <h2 className="font-display text-2xl text-ink-900">
          Usafirishaji
        </h2>
        <div className="mt-4 overflow-hidden rounded-2xl border border-cream-300">
          <table className="w-full text-left text-sm">
            <thead className="bg-cream-100 text-xs uppercase tracking-wide text-ink-500">
              <tr>
                <th className="px-4 py-3">Eneo</th>
                <th className="px-4 py-3">Muda</th>
                <th className="px-4 py-3">Gharama</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-200 bg-surface">
              {zones.map((z) => (
                <tr key={z.zone}>
                  <td className="px-4 py-3 font-medium text-ink-900">
                    {z.zone}
                  </td>
                  <td className="px-4 py-3 text-ink-500">{z.time}</td>
                  <td className="px-4 py-3 text-ink-500">{z.fee}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 flex items-start gap-2 text-sm text-ink-500">
          <TruckIcon className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
          Usafirishaji ni bure Dar es Salaam kwa oda zaidi ya TSh 50,000.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-2xl text-ink-900">
          Njia za malipo
        </h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {[
            { name: "M-Pesa", note: "Lipa kwa simu yako" },
            { name: "Mixx by Yas", note: "Lipa kwa simu yako" },
            { name: "Airtel Money", note: "Lipa kwa simu yako" },
            { name: "Lipa ukipokea", note: "Lipa bidhaa ikikufikia" },
          ].map((p) => (
            <li
              key={p.name}
              className="flex items-center justify-between rounded-xl border border-cream-300 bg-surface px-4 py-3"
            >
              <span className="font-medium text-ink-900">{p.name}</span>
              <span className="text-sm text-ink-500">{p.note}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10 grid gap-4 sm:grid-cols-2">
        <div className="card p-5">
          <p className="flex items-center gap-2 font-medium text-ink-900">
            <ClockIcon className="h-5 w-5 text-brand-600" />
            Siku za kazi
          </p>
          <p className="mt-2 text-sm text-ink-500">{site.hours}</p>
        </div>
        <div className="card p-5">
          <p className="flex items-center gap-2 font-medium text-ink-900">
            <MapPinIcon className="h-5 w-5 text-brand-600" />
            Ofisi yetu
          </p>
          <p className="mt-2 text-sm text-ink-500">{site.address}</p>
        </div>
      </section>
    </div>
  );
}
