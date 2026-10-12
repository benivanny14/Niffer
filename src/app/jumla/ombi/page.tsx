import type { Metadata } from "next";
import Link from "next/link";
import { RfqTracker } from "@/components/wholesale/RfqTracker";

export const metadata: Metadata = {
  title: "Fuatilia Ombi la Bei (RFQ)",
  description:
    "Ingia namba yako ya simu kuona hatua ya ombi lako la bei ya jumla, bei iliyowekwa na timu ya Niffer Cosmetics.",
};

export default function RfqTrackerPage() {
  return (
    <div className="container-x max-w-3xl py-12 lg:py-16">
      <nav aria-label="Njia" className="text-sm text-ink-400">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link href="/" className="hover:text-accent">
              Nyumbani
            </Link>
          </li>
          <li aria-hidden>›</li>
          <li>
            <Link href="/jumla" className="hover:text-accent">
              Uuzaji wa Jumla
            </Link>
          </li>
          <li aria-hidden>›</li>
          <li className="text-ink-700">Fuatilia ombi</li>
        </ol>
      </nav>

      <p className="eyebrow mt-6">Portali ya jumla</p>
      <h1 className="heading-display mt-2">Fuatilia ombi lako la bei</h1>
      <p className="mt-3 max-w-2xl text-ink-500">
        Weka namba ya simu uliyotumia kwenye ombi la RFQ ili kuona hatua yake
        na bei ya wingi iliyowekwa na timu yetu.
      </p>

      <div className="mt-8">
        <RfqTracker />
      </div>

      <p className="mt-6 text-sm text-ink-500">
        Bado hujaweka ombi?{" "}
        <Link href="/jumla" className="font-semibold text-accent hover:underline">
          Oomba bei ya jumla →
        </Link>
      </p>
    </div>
  );
}
