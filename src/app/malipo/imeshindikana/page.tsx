import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { getOrder } from "@/lib/server/orders";
import { site, waLink } from "@/lib/site";
import { formatTsh } from "@/lib/format";
import { RetryPaymentButton } from "@/components/payments/RetryPaymentButton";

export const metadata: Metadata = {
  title: "Malipo Hayakamilika",
  robots: { index: false },
};

type PageProps = { searchParams: Promise<{ reference?: string }> };

export default async function PaymentFailedPage({ searchParams }: PageProps) {
  const { reference = "" } = await searchParams;
  const code = reference.trim().toUpperCase();
  await connection();
  const order = code ? await getOrder(code) : undefined;

  const waText = order
    ? `Habari ${site.name}, malipo ya oda ${order.code} yameshindikana. Ninaomba msaada.`
    : `Habari ${site.name}, malipo yangu yameshindikana. Ninaomba msaada.`;

  return (
    <div className="container-x max-w-xl py-16 text-center">
      <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-danger-100 text-danger-600">
        <span className="font-display text-2xl">!</span>
      </span>
      <h1 className="heading-display mt-6">Malipo hayakamilika</h1>
      <p className="mt-3 text-ink-500">
        Muamala wa malipo umeghairiwa au umeshindikana. Hakuna pesa
        imetokana na kadi yako. Oda yako bado imehifadhiwa — unaweza
        kutayarisha malipo tena au kulipa baada ya kupokea bidhaa.
      </p>

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
            Hali: malipo hayajathibitishwa. Ukifika bidhaa unaweza kulipa kwa
            M-Pesa, Mixx by Yas, Airtel Money au kulipa bidhaa ikikufikia.
          </p>
        </div>
      ) : null}

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <a href={waLink(waText)} target="_blank" rel="noopener noreferrer" className="btn-primary">
          Msaada kwa WhatsApp
        </a>
        {order ? (
          <>
            <RetryPaymentButton reference={order.code} />
            <Link href={`/odha/${order.code}`} className="btn-outline">
              Angalia oda yako
            </Link>
          </>
        ) : (
          <Link href="/ukoko" className="btn-outline">
            Jaribu malipo tena
          </Link>
        )}
      </div>
    </div>
  );
}
