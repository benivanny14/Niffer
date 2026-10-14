import type { Metadata } from "next";
import Link from "next/link";
import { RfqTracker } from "@/components/wholesale/RfqTracker";

export const metadata: Metadata = {
    title: "Track your quote request (RFQ)",
  description:
    "Enter your phone number to check the status of your wholesale quote and the price set by the Niffer Cosmetics team.",
};

export default function RfqTrackerPage() {
  return (
    <div className="container-x max-w-3xl py-12 lg:py-16">
      <nav aria-label="Breadcrumb" className="text-sm text-ink-400">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link href="/" className="hover:text-accent">
              Home
            </Link>
          </li>
          <li aria-hidden>›</li>
          <li>
            <Link href="/jumla" className="hover:text-accent">
              Wholesale
            </Link>
          </li>
          <li aria-hidden>›</li>
          <li className="text-ink-700">Track request</li>
        </ol>
      </nav>

      <p className="eyebrow mt-6">Wholesale portal</p>
        <h1 className="heading-display mt-2">Track your quote request</h1>
      <p className="mt-3 max-w-2xl text-ink-500">
        Enter the phone number used for your quote request to check its status
        and the bulk price set by our team.
      </p>

      <div className="mt-8">
        <RfqTracker />
      </div>

      <p className="mt-6 text-sm text-ink-500">
        Haven&apos;t sent a request yet?{" "}
        <Link href="/jumla" className="font-semibold text-accent hover:underline">
          Request wholesale pricing →
        </Link>
      </p>
    </div>
  );
}
