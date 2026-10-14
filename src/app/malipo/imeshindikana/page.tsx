import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { getOrder } from "@/lib/server/orders";
import { site, waLink } from "@/lib/site";
import { formatTsh } from "@/lib/format";
import { RetryPaymentButton } from "@/components/payments/RetryPaymentButton";

export const metadata: Metadata = {
  title: "Payment not completed",
  robots: { index: false },
};

type PageProps = { searchParams: Promise<{ reference?: string }> };

export default async function PaymentFailedPage({ searchParams }: PageProps) {
  const { reference = "" } = await searchParams;
  const code = reference.trim().toUpperCase();
  await connection();
  const order = code ? await getOrder(code) : undefined;

  const waText = order
    ? `Hello ${site.name}, payment for order ${order.code} failed. I need help.`
    : `Hello ${site.name}, my payment failed. I need help.`;

  return (
    <div className="container-x max-w-xl py-16 text-center">
      <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-danger-100 text-danger-600">
        <span className="font-display text-2xl">!</span>
      </span>
      <h1 className="heading-display mt-6">Payment not completed</h1>
      <p className="mt-3 text-ink-500">The payment was cancelled or could not be completed. No funds were charged to your card. Your order is saved. You can try the payment again or pay when your order arrives.</p>

      {order ? (
        <div className="card mt-8 p-6 text-left text-sm">
          <div className="flex items-center justify-between">
            <span className="font-display text-lg text-ink-900">
              {order.code}
            </span>
            <span className="font-semibold text-ink-900">
              {formatTsh(order.totalTsh)}
            </span>
          </div>
          <p className="mt-2 text-ink-500">
            Payment status: not confirmed. You can pay when your order arrives using
            M-Pesa, Mixx by Yas, Airtel Money, or cash on delivery.
          </p>
        </div>
      ) : null}

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <a href={waLink(waText)} target="_blank" rel="noopener noreferrer" className="btn-primary">
          WhatsApp support
        </a>
        {order ? (
          <>
            <RetryPaymentButton reference={order.code} />
            <Link href={`/odha/${order.code}`} className="btn-outline">
              View your order
            </Link>
          </>
        ) : (
          <Link href="/ukoko" className="btn-outline">
            Try payment again
          </Link>
        )}
      </div>
    </div>
  );
}
