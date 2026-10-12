"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useOrders } from "@/lib/orders-client";
import { liveStatus, statusSteps, type Order } from "@/lib/orders";
import { getProductBySlug } from "@/lib/data/catalog";
import { formatTsh, formatPhone } from "@/lib/format";
import { site } from "@/lib/site";
import { useStore } from "@/lib/store";
import { apiGet, apiPost, errorMessage } from "@/lib/api";
import { useAsync } from "@/lib/use-async";
import {
  BagIcon,
  HeartIcon,
  MapPinIcon,
  ShieldIcon,
  TruckIcon,
  UserIcon,
} from "@/components/ui/icons";

type Customer = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
};

const field =
  "w-full rounded-xl border border-cream-300 bg-surface px-4 py-3 text-sm text-ink-900 outline-none transition-colors focus:border-brand-500";

export default function AccountPage() {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [checking, setChecking] = useState(true);

  // Thibitisha session ya server mara ukurasa unapofunguliwa.
  useEffect(() => {
    let alive = true;
    apiGet<{ ok: boolean; customer: Customer | null }>("/api/customers/me")
      .then((data) => {
        if (alive) setCustomer(data.customer);
      })
      .catch(() => {
        if (alive) setCustomer(null);
      })
      .finally(() => {
        if (alive) setChecking(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  if (checking) {
    return (
      <div className="container-x max-w-md py-16 text-center">
        <p className="text-sm text-ink-500">Inathibitisha akaunti yako…</p>
      </div>
    );
  }

  if (!customer) return <AuthSection onLogin={setCustomer} />;

  return <Dashboard customer={customer} onLogout={() => setCustomer(null)} />;
}

/* ============ Ingia / Jiandikishe ============ */

function AuthSection({ onLogin }: { onLogin: (c: Customer) => void }) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    if (!/^[0-9+\s]{9,15}$/.test(phone.trim())) {
      setError("Weka namba sahihi ya simu (mfano 0754 000 000).");
      return;
    }
    setError("");
    setBusy(true);
    try {
      const data =
        mode === "login"
          ? await apiPost<{ ok: boolean; customer: Customer }>(
              "/api/customers/login",
              { phone, password },
            )
          : await apiPost<{ ok: boolean; customer: Customer }>(
              "/api/customers/register",
              { name, phone, email, password },
            );
      onLogin(data.customer);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="container-x max-w-md py-16">
      <p className="eyebrow">Akaunti yako</p>
      <h1 className="heading-display mt-2">
        {mode === "login" ? "Ingia" : "Jiandikishe"}
      </h1>
      <p className="mt-3 text-ink-500">
        {mode === "login"
          ? "Ingia kwa simu na nywila yako ili kuona oda zako na kuharakisha malipo."
          : "Fungua akaunti ya bure — oda zako, upendwa na historia yote sehemu moja."}
      </p>

      <form onSubmit={submit} className="card mt-8 space-y-4 p-6">
        {mode === "register" ? (
          <>
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
                autoComplete="name"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium text-ink-700">
                Barua pepe (hiari)
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={field}
                placeholder="wewe@mfano.com"
                autoComplete="email"
              />
            </label>
          </>
        ) : null}

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
            autoComplete="tel"
          />
        </label>

        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-ink-700">
            Nywila *{mode === "register" ? " (herufi 6+)" : ""}
          </span>
          <input
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={field}
            placeholder="••••••"
            minLength={6}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
          />
        </label>

        {error ? (
          <p className="rounded-lg bg-danger-100 px-3 py-2 text-sm text-danger-600">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={busy}
          className="btn-primary w-full disabled:opacity-60"
        >
          {busy
            ? "Inasubiri…"
            : mode === "login"
              ? "Ingia"
              : "Fungua akaunti"}
        </button>

        <button
          type="button"
          onClick={() => {
            setMode(mode === "login" ? "register" : "login");
            setError("");
          }}
          className="w-full text-center text-sm text-ink-500 transition-colors hover:text-accent"
        >
          {mode === "login" ? (
            <>
              Huna akaunti? <span className="font-semibold text-accent">Jiandikishe</span>
            </>
          ) : (
            <>
              Una akaunti? <span className="font-semibold text-accent">Ingia</span>
            </>
          )}
        </button>

        <p className="text-center text-xs text-ink-400">
          Kwa kuingia, unakubali{" "}
          <Link href="/masharti" className="text-accent hover:underline">
            Masharti
          </Link>{" "}
          na{" "}
          <Link href="/faragha" className="text-accent hover:underline">
            Sera ya Faragha
          </Link>
          .
        </p>
      </form>
    </div>
  );
}

/* ============ Dashibodi ============ */

function Dashboard({
  customer,
  onLogout,
}: {
  customer: Customer;
  onLogout: () => void;
}) {
  const localOrders = useOrders();
  const { wishlist, ready } = useStore();
  const [loggingOut, setLoggingOut] = useState(false);

  const { data, loading, error } = useAsync<Order[]>(
    `my-orders:${customer.id}`,
    async () => {
      const res = await apiGet<{ ok: boolean; orders: Order[] }>(
        "/api/customers/orders",
      );
      // Ongeza oda za kifaa hiki zisizobao DB (zilizowekwa kabla ya kuingia).
      const seen = new Set(res.orders.map((o) => o.code));
      const extra = localOrders.filter((o) => !seen.has(o.code));
      return [...res.orders, ...extra];
    },
  );

  const myOrders = data ?? [];
  const spentTsh = myOrders.reduce((sum, o) => sum + o.totalTsh, 0);

  async function logout() {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await apiPost("/api/customers/logout");
    } catch {
      /* session hataki kukaa — tunaondoa hapa hivyo */
    } finally {
      onLogout();
    }
  }

  return (
    <div className="container-x py-12 lg:py-16">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-accent">
            <UserIcon className="h-7 w-7" />
          </span>
          <div>
            <p className="eyebrow">Akaunti yako</p>
            <h1 className="heading-display mt-1 text-3xl">
              Habari, {customer.name}
            </h1>
            <p className="mt-1 text-sm text-ink-500">
              {formatPhone(customer.phone)}
              {customer.email ? ` · ${customer.email}` : ""}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={logout}
          disabled={loggingOut}
          className="btn-outline disabled:opacity-60"
        >
          {loggingOut ? "Inatoka…" : "Toka"}
        </button>
      </div>

      {/* Muhtasari */}
      <dl className="mt-10 grid gap-4 sm:grid-cols-3">
        {[
          ["Oda zako", loading ? "…" : `${myOrders.length}`],
          ["Manunuzi yote", loading ? "…" : formatTsh(spentTsh)],
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

        {error ? (
          <p className="card mt-6 p-6 text-sm text-danger-600">{error}</p>
        ) : loading ? (
          <div className="mt-6 space-y-4">
            {[0, 1].map((i) => (
              <div key={i} className="h-24 animate-pulse rounded-2xl bg-cream-200" />
            ))}
          </div>
        ) : myOrders.length === 0 ? (
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
                        <span className="badge bg-brand-100 text-accent">
                          {statusSteps[stepIndex]?.label}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-ink-500">
                        {new Date(order.createdAt).toLocaleDateString("sw-TZ")} ·{" "}
                        {order.lines.length} bidhaa · {order.customer.region}
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
                    <span className="font-display text-lg text-accent">
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
            Nywila yako imehifadhiwa ikiwa imefichwa (hash) kwenye database —
            hata watu wa Niffer hawawezi kuiona.
          </p>
        </div>
        <Link
          href="/faragha"
          className="text-sm font-semibold text-accent hover:underline"
        >
          Sera ya Faragha →
        </Link>
      </section>

      <p className="mt-8 flex items-center gap-2 text-sm text-ink-400">
        <MapPinIcon className="h-4 w-4 text-brand-600" />
        Unapendelea kuagiza kwa simu? Piga{" "}
        <a
          href={`tel:${site.phoneTel}`}
          className="font-medium text-accent hover:underline"
        >
          +255 754 000 000
        </a>
      </p>
    </div>
  );
}
