import type { Metadata } from "next";
import { PaymentPoller } from "@/components/payments/PaymentPoller";

export const metadata: Metadata = {
  title: "Inasubiri Malipo",
  description: "Tunasubiri uthibitisho wa malipo yako kwa oda ya Niffer Cosmetics.",
  robots: { index: false },
};

type PageProps = { searchParams: Promise<{ reference?: string }> };

export default async function PaymentPendingPage({ searchParams }: PageProps) {
  const { reference = "" } = await searchParams;
  const code = reference.trim().toUpperCase();

  return (
    <div className="container-x max-w-xl py-16">
      <p className="eyebrow">Malipo</p>
      <h1 className="heading-display mt-2">Malipo yako yanakamilika</h1>
      <div className="mt-6">
        {code ? (
          <PaymentPoller reference={code} />
        ) : (
          <p className="card p-6 text-sm text-ink-500">
            Nambari ya oda haipatikani. Angalia barua pepe au simu yako kwa
            kiungo sahihi.
          </p>
        )}
      </div>
    </div>
  );
}
