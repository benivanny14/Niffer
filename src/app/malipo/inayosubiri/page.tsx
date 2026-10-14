import type { Metadata } from "next";
import { PaymentPoller } from "@/components/payments/PaymentPoller";

export const metadata: Metadata = {
  title: "Payment pending",
  description: "We are waiting for payment confirmation for your Niffer Cosmetics order.",
  robots: { index: false },
};

type PageProps = { searchParams: Promise<{ reference?: string }> };

export default async function PaymentPendingPage({ searchParams }: PageProps) {
  const { reference = "" } = await searchParams;
  const code = reference.trim().toUpperCase();

  return (
    <div className="container-x max-w-xl py-16">
      <p className="eyebrow">Payment</p>
      <h1 className="heading-display mt-2">Your payment is processing</h1>
      <div className="mt-6">
        {code ? (
          <PaymentPoller reference={code} />
        ) : (
          <p className="card p-6 text-sm text-ink-500">
            Order number not found. Check your email or phone for
            the correct link.
          </p>
        )}
      </div>
    </div>
  );
}
