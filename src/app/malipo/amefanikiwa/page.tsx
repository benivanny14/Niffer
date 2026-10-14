import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { getOrder } from "@/lib/server/orders";
import { formatTsh } from "@/lib/format";
import { CheckIcon } from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "Payment successful",
  robots: { index: false },
};

type PageProps = { searchParams: Promise<{ reference?: string }> };

export default async function PaymentSuccessPage({ searchParams }: PageProps) {
  const { reference = "" } = await searchParams;
  const code = reference.trim().toUpperCase();
  await connection();
  const order = code ? await getOrder(code) : undefined;

  return (
    <div className="container-x max-w-xl py-16 text-center">
      <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success-100 text-success-600">
        <CheckIcon className="h-8 w-8" />
      </span>
      <h1 className="heading-display mt-6">Payment successful!</h1>
      <p className="mt-3 text-ink-500">
        Thank you for shopping with Niffer Cosmetics. We are preparing your order and
        will call you shortly.
      </p>

      {order ? (
        <div className="card mt-8 p-6 text-left">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-ink-500">Order number</p>
              <p className="font-display text-xl text-ink-900">{order.code}</p>
            </div>
            <span className="badge bg-success-100 text-success-600">
              Payment: {formatTsh(order.totalTsh)}
            </span>
          </div>
          <ul className="mt-4 space-y-1.5 border-t border-cream-200 pt-4 text-sm text-ink-500">
            <li className="flex justify-between">
              <span>Total</span>
              <span className="font-medium text-ink-900">
                {formatTsh(order.totalTsh)}
              </span>
            </li>
            <li className="flex justify-between">
              <span>Payment method</span>
              <span className="font-medium text-ink-900 uppercase">
                {order.payment}
              </span>
            </li>
            <li className="flex justify-between">
              <span>Address</span>
              <span className="font-medium text-ink-900">
                {order.customer.region}
              </span>
            </li>
          </ul>
        </div>
      ) : null}

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href={order ? `/odha/${order.code}` : "/fuatilia"}
          className="btn-primary"
        >
          Track your order
        </Link>
        <Link href="/bidhaa" className="btn-outline">
          Continue shopping
        </Link>
      </div>
    </div>
  );
}
