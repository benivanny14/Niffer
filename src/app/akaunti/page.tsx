"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { createLocalStore } from "@/lib/local-store";
import { useOrders } from "@/lib/orders-client";
import { liveStatus, statusSteps } from "@/lib/orders";
import { getProductBySlug } from "@/lib/data/catalog";
import { formatTsh, formatPhone } from "@/lib/format";
import { site } from "@/lib/site";
import { useStore } from "@/lib/store";
import {
  BagIcon,
  HeartIcon,
  MapPinIcon,
  ShieldIcon,
  TruckIcon,
  UserIcon,
} from "@/components/ui/icons";

type Account = { name: string; phone: string };

const ACCOUNT_KEY = "niffer.account.v1";
const accountStore = createLocalStore<Account | null>(ACCOUNT_KEY, null);

const field =
  "w-full rounded-xl border border-cream-300 bg-white px-4 py-3 text-sm text-ink-900 outline-none transition-colors focus:border-brand-500";

export default function AccountPage() {
  const account = useSyncExternalStore(
    accountStore.subscribe,
    accountStore.get,
    accountStore.getServer,
  );
  const orders = useOrders();
  const { wishlist, ready, clear } = useStore();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  function login(e: React.FormEvent) {
    e.preventDefault();
    if (!/^[0-9+\s]{9,15}$/.test(phone.trim())) {
      setError("Weka namba sahihi ya simu (mfano 0754 000 000).");
      return;
    }
    setError("");
    accountStore.set({ name: name.trim(), phone: phone.trim() });
  }

  /* ============ Bila akaunti: ingia / jiandikishe ============ */
  if (!account) {
    return (
      <div className="container-x max-w-md py-16">
        <p className="eyebrow\">Akaunti yako</p>
        <h1 className="heading-display mt-2">Ingia au jiandikishe</h1>
        <p className="mt-3 text-ink-500">
          Tumia namba yako ya simu ili kuona oda zako. Hakuna nywila —
          tunakutumia msimbo wa kuthibitisha kwa SMS (demo: huingia moja kwa
          moja).
        </p>

        <form onSubmit={login} className="card mt-8 space-y-4 p-6">
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-ink-700">
              Jina lako *
            </span>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={field}
              placeholder="Jina lako"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-ink-700">
              Namba ya simu *
            </span>
            <input
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={field}
              placeholder="0754 000 000"
              inputMode="tel"
            />
          </label>
          {error ? (
            <p className="rounded-lg bg-danger-100 px-3 py-2 text-sm text-danger-600">
              {error}
            </p>
          ) : null}
          <button type="submit" className="btn-primary w-full">
            Ingia
          </button>
          <p className="text-center text-xs text-ink-400">
            Kwa kuingia, unakubali{" "}
            <Link href="/masharti" className="text-brand-700 hover:underline">
              Masharti
            </Link>{" "}
            na{" "}
            <Link href="/faragha" className="text-brand-700 hover:underline">
              Sera ya Faragha
            </Link>
            .
          </p>
        </form>
      </div>
    );
  }

  /* ============ Na akaunti: dashibodi ============ */
  const myOrders = orders;
  const spentTsh = myOrders.reduce((sum, o) => sum + o.totalTsh, 0);

  return (
    <div className="container-x py-12 lg:py-16">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-brand-700">
            <UserIcon className="h-7 w-7" />
          </span>
          <div>
            <p className="eyebrow\">Akaunti yako</p>
            <h1 className="heading-display mt-1 text-3xl">
              Habari, {account.name}
            </h1>
            <p className="mt-1 text-sm text-ink-500">
              {formatPhone(account.phone)}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            accountStore.set(null);
            clear();
          }}
          className="btn-outline"
        >
          Toka
        </button>
      </div>

      {/* Muhtasari */}
      <dl className="mt-10 grid gap-4 sm:grid-cols-3">
        {[
          ["Oda zako", `${myOrders.length}`],
          ["Manunuzi yote", formatTsh(spentTsh)],
          [ready ? "Bidhaa unazopenda" : "Inasubiri…", `${wishlist.length}`],
        ].map(([label, value]) => (
          <div key={label} className="card p-5">
            <dt className="text-xs font-semibold uppercase tracking-wide text-ink-400">
              {label}
            </dt>
            <dd className="mt-1 font-display text-2xl text-ink-900">{value}</dd>
          </div>
        ))}
      </dl>

      {/* Haraka */}
      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/upendwa" className="btn-outline">
          <HeartIcon className="h-4 w-4" />
          Bidhaa unazopenda
        </Link>
        <Link href="/fuatilia" className="btn-outline">
          <TruckIcon className="h-4 w-4" />
          Fuatilia oda
        </Link>
        <Link href="/bidhaa" className="btn-primary">
          <BagIcon className="h-4 w-4" />
          Nunua tena
        </Link>
      </div>

      {/* Oda zangu */}
      <section className="mt-12">
        <h2 className="font-display text-2xl text-ink-900">Oda zangu</h2>

        {myOrders.length === 0 ? (
          <div className="card mt-6 p-10 text-center">
            <BagIcon className="mx-auto h-12 w-12 text-ink-300" />
            <p className="font-display mt-4 text-lg text-ink-900">
              Bado hujaweka oda yoyote
            </p>
            <p className="mt-2 text-sm text-ink-500">
              Ukiweka oda, itaonekana hapa pamoja na hali yake.
            </p>
            <Link href="/bidhaa" className="btn-primary mt-5">
              Anza Kununua
            </Link>
          </div>
        ) : (
          <ul className="mt-6 space-y-4">
            {myOrders.map((order) => {
              const stepIndex = statusSteps.findIndex(
                (s) => s.id === liveStatus(order),
              );
              return (
                <li key={order.code}>
                  <Link
                    href={`/odha/${order.code}`}
                    className="card flex flex-wrap items-center gap-4 p-5 transition-colors hover:border-brand-300"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-display text-lg text-ink-900">
                          {order.code}
                        </span>
                        <span className="badge bg-brand-100 text-brand-700">
                          {statusSteps[stepIndex]?.label}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-ink-500">
                        {new Date(order.createdAt).toLocaleDateString("sw-TZ")}{" "}
                        · {order.lines.length} bidhaa · {order.customer.region}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-ink-400">
                        {order.lines
                          .map((l) => {
                            const p = getProductBySlug(l.slug);
                            return `${p?.name ?? l.slug} ×${l.qty}`;
                          })
                          .join(", ")}
                      </p>
                    </div>
                    <span className="font-display text-lg text-brand-700">
                      {formatTsh(order.totalTsh)}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Faragha */}
      <section className="card mt-12 flex flex-wrap items-center gap-4 p-6">
        <ShieldIcon className="h-8 w-8 shrink-0 text-brand-600" />
        <div className="min-w-0 flex-1">
          <p className="font-medium text-ink-900">
            Taarifa zako zinabaki salama
          </p>
          <p className="mt-0.5 text-sm text-ink-500">
            Taarifa zako zinahifadhiwa kwenye kifaa hiki tu (demo). Kwenye
            tovuti halisi, tunazificha kwenye database salama.
          </p>
        </div>
        <Link
          href="/faragha"
          className="text-sm font-semibold text-brand-700 hover:underline"
        >
          Sera ya Faragha →
        </Link>
      </section>

      <p className="mt-8 flex items-center gap-2 text-sm text-ink-400">
        <MapPinIcon className="h-4 w-4 text-brand-600" />
        Unapendelea kuagiza kwa simu? Piga{" "}
        <a
          href={`tel:${site.phoneTel}`}
          className="font-medium text-brand-700 hover:underline"
        >
          +255 754 000 000
        </a>
      </p>
    </div>
  );
}
