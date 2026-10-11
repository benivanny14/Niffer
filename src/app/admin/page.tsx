"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { createLocalStore } from "@/lib/local-store";
import {
  demoOrders,
  liveStatus,
  statusSteps,
  type Order,
  type OrderStatus,
} from "@/lib/orders";
import { useOrders, setOrderStatus } from "@/lib/orders-client";
import { setStock, getStock } from "@/lib/stock";
import { products, categories } from "@/lib/data/catalog";
import { formatTsh } from "@/lib/format";
import { site } from "@/lib/site";
import {
  BagIcon,
  CheckIcon,
  ShieldIcon,
  TagIcon,
  TruckIcon,
} from "@/components/ui/icons";

/* ============ Auth (demo) ============ */
const AUTH_KEY = "niffer.admin.auth.v1";
const authStore = createLocalStore<boolean>(AUTH_KEY, false);

type Tab = "muhtasari" | "bidhaa" | "oda";

const field =
  "w-full rounded-xl border border-cream-300 bg-white px-4 py-3 text-sm text-ink-900 outline-none transition-colors focus:border-brand-500";

export default function AdminPage() {
  const authed = useSyncExternalStore(
    authStore.subscribe,
    authStore.get,
    authStore.getServer,
  );

  if (!authed) return <AdminLogin />;

  return <AdminDashboard />;
}

/* ============ Login ============ */
function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    // Demo nywila — kwenye tovuti halisi hii itakuwa authentication halisi.
    if (password === "niffer2026") {
      authStore.set(true);
    } else {
      setError(true);
    }
  }

  return (
    <div className="container-x max-w-md py-20">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-brand-700">
        <ShieldIcon className="h-7 w-7" />
      </span>
      <h1 className="heading-display mt-6 text-center">Ingia kwenye Admin</h1>
      <p className="mt-3 text-center text-ink-500">
        Sehemu hii ni kwa wafanyakazi wa Niffer Cosmetics pekee.
      </p>
      <form onSubmit={submit} className="card mt-8 space-y-4 p-6">
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-ink-700">Nywila</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={field}
            placeholder="Weka nywila"
            autoFocus
          />
        </label>
        {error ? (
          <p className="rounded-lg bg-danger-100 px-3 py-2 text-sm text-danger-600">
            Nywila si sahihi. Jaribu tena.
          </p>
        ) : null}
        <button type="submit" className="btn-primary w-full">
          Ingia
        </button>
        <p className="text-center text-xs text-ink-400">
          Demo nywila: <span className="font-mono">niffer2026</span>
        </p>
      </form>
    </div>
  );
}

/* ============ Dashboard ============ */
function AdminDashboard() {
  const [tab, setTab] = useState<Tab>("muhtasari");
  const orders = useOrders();

  // Oda zote: halisi (kutoka localStorage) + demo.
  const allOrders = useMemo<Order[]>(
    () => [...orders, ...demoOrders()],
    [orders],
  );

  const stats = useMemo(() => {
    const revenue = allOrders.reduce((sum, o) => sum + o.totalTsh, 0);
    const lowStock = products.filter((p) => getStock(p.slug) <= 10);
    return { revenue, lowStock, orderCount: allOrders.length };
  }, [allOrders]);

  const tabs: { id: Tab; label: string }[] = [
    { id: "muhtasari", label: "Muhtasari" },
    { id: "bidhaa", label: "Bidhaa" },
    { id: "oda", label: `Oda (${allOrders.length})` },
  ];

  return (
    <div className="container-x py-10 lg:py-14">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="eyebrow">Admin</p>
          <h1 className="heading-display mt-1">Dashibodi ya Niffer</h1>
          <p className="mt-1 text-sm text-ink-500">{site.name} · simu: {site.phoneDisplay}</p>
        </div>
        <button
          type="button"
          onClick={() => authStore.set(false)}
          className="btn-outline"
        >
          Toka
        </button>
      </div>

      {/* Tabs */}
      <nav className="mt-8 flex gap-1 overflow-x-auto border-b border-cream-300">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`shrink-0 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              tab === t.id
                ? "border-brand-700 text-brand-700"
                : "border-transparent text-ink-500 hover:text-ink-900"
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <div className="mt-8">
        {tab === "muhtasari" ? (
          <Muhtasari stats={stats} orders={allOrders} />
        ) : null}
        {tab === "bidhaa" ? <BidhaaTab /> : null}
        {tab === "oda" ? <OdaTab orders={allOrders} /> : null}
      </div>
    </div>
  );
}

/* ============ Muhtasari ============ */
function Muhtasari({
  stats,
  orders,
}: {
  stats: { revenue: number; lowStock: typeof products; orderCount: number };
  orders: Order[];
}) {
  const cards = [
    {
      icon: BagIcon,
      label: "Oda zote",
      value: `${stats.orderCount}`,
    },
    {
      icon: TagIcon,
      label: "Mapato (jumla)",
      value: formatTsh(stats.revenue),
    },
    {
      icon: TruckIcon,
      label: "Bidhaa zinazouzwa",
      value: `${products.length}`,
    },
    {
      icon: ShieldIcon,
      label: "Zinahitaji kujazwa",
      value: `${stats.lowStock.length}`,
    },
  ];

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(({ icon: Icon, label, value }) => (
          <div key={label} className="card p-5">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700">
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">
                  {label}
                </p>
                <p className="font-display text-xl text-ink-900">{value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Oda za hivi karibuni */}
      <section className="mt-10">
        <h2 className="font-display text-xl text-ink-900">
          Oda za hivi karibuni
        </h2>
        {orders.length === 0 ? (
          <p className="mt-3 text-sm text-ink-500">
            Hakuna oda bado. Zitaonekana hapa unapopokea oda mpya.
          </p>
        ) : (
          <ul className="mt-4 space-y-2">
            {orders.slice(0, 5).map((order) => {
              const status = liveStatus(order);
              const label = statusSteps.find((s) => s.id === status)?.label;
              return (
                <li
                  key={order.code}
                  className="card flex flex-wrap items-center gap-3 p-4"
                >
                  <span className="font-display text-base text-ink-900">
                    {order.code}
                  </span>
                  <span className="badge bg-brand-100 text-brand-700">
                    {label}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm text-ink-500">
                    {order.customer.name} · {order.customer.region}
                  </span>
                  <span className="text-sm font-semibold text-brand-700">
                    {formatTsh(order.totalTsh)}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Stoo ndogo */}
      {stats.lowStock.length > 0 ? (
        <section className="mt-10">
          <h2 className="font-display text-xl text-ink-900">
            Bidhaa zenye stoo ndogo (≤10)
          </h2>
          <ul className="mt-4 space-y-2">
            {stats.lowStock.map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between rounded-xl bg-warning-100 px-4 py-3 text-sm"
              >
                <span className="font-medium text-ink-900">{p.name}</span>
                <span className="font-semibold text-warning-600">
                  Zimebaki: {p.stock}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

/* ============ Bidhaa ============ */
function BidhaaTab() {
  const [categoryFilter, setCategoryFilter] = useState<string>("zote");

  const filtered = products.filter(
    (p) => categoryFilter === "zote" || p.category === categoryFilter,
  );

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm font-medium text-ink-700">
          Kategoria:
        </label>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-xl border border-cream-300 bg-white px-3 py-2 text-sm"
        >
          <option value="zote">Zote</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="card mt-6 overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-cream-300 text-xs uppercase tracking-wide text-ink-400">
              <th className="px-5 py-3 font-semibold">Bidhaa</th>
              <th className="px-5 py-3 font-semibold">Kategoria</th>
              <th className="px-5 py-3 font-semibold">Bei</th>
              <th className="px-5 py-3 font-semibold">Stoo</th>
              <th className="px-5 py-3 font-semibold">Hali</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((product) => {
              const stock = getStock(product.slug);
              const low = stock <= 10;
              return (
                <tr
                  key={product.id}
                  className="border-b border-cream-200 last:border-0"
                >
                  <td className="px-5 py-3">
                    <span className="block font-medium text-ink-900">
                      {product.name}
                    </span>
                    <span className="block text-xs text-ink-400">
                      {product.slug}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-ink-700">{product.category}</td>
                  <td className="px-5 py-3 text-ink-700">
                    {formatTsh(product.priceTsh)}
                  </td>
                  <td className="px-5 py-3">
                    <input
                      type="number"
                      min={0}
                      value={stock}
                      onChange={(e) => {
                        const v = Math.max(0, Number(e.target.value) || 0);
                        setStock(product.slug, v);
                      }}
                      className="w-20 rounded-lg border border-cream-300 px-2 py-1 text-sm"
                      aria-label={`Stoo ya ${product.name}`}
                    />
                  </td>
                  <td className="px-5 py-3">
                    {low ? (
                      <span className="badge bg-warning-100 text-warning-600">
                        Stoo ndogo
                      </span>
                    ) : (
                      <span className="badge bg-success-100 text-success-600">
                        Inapatikana
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-ink-400">
        Mabadiliko ya stoo ni ya demo (huhifadhiwa kwenye kifaa hiki). Kwenye
        tovuti halisi, yatasajiliwa kwenye database ya bidhaa.
      </p>
    </div>
  );
}

/* ============ Oda ============ */
function OdaTab({ orders }: { orders: Order[] }) {
  const [filter, setFilter] = useState<"zote" | OrderStatus>("zote");

  const filtered = orders.filter((o) => {
    if (filter === "zote") return true;
    return liveStatus(o) === filter;
  });

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-ink-700">Chuja:</span>
        {(["zote", ...statusSteps.map((s) => s.id)] as const).map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => setFilter(id as typeof filter)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              filter === id
                ? "bg-brand-700 text-white"
                : "bg-cream-100 text-ink-500 hover:bg-cream-200"
            }`}
          >
            {id === "zote"
              ? "Zote"
              : statusSteps.find((s) => s.id === id)?.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card mt-6 p-10 text-center">
          <BagIcon className="mx-auto h-12 w-12 text-ink-300" />
          <p className="font-display mt-4 text-lg text-ink-900">
            Hakuna oda kwenye kichujio hiki
          </p>
          <p className="mt-2 text-sm text-ink-500">
            Badilisha kichujio au subiri oda mpya.
          </p>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {filtered.map((order) => {
            const status = liveStatus(order);
            const label = statusSteps.find((s) => s.id === status)?.label;
            return (
              <li key={order.code} className="card p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-display text-lg text-ink-900">
                      {order.code}
                    </span>
                    <span className="badge bg-brand-100 text-brand-700">
                      {label}
                    </span>
                    {order.demo ? (
                      <span className="badge bg-cream-100 text-ink-400">
                        demo
                      </span>
                    ) : (
                      <span className="badge bg-success-100 text-success-600">
                        <CheckIcon className="h-3 w-3" />
                        halisi
                      </span>
                    )}
                  </div>
                  <span className="font-display text-lg text-brand-700">
                    {formatTsh(order.totalTsh)}
                  </span>
                </div>

                <div className="mt-3 grid gap-2 text-sm sm:grid-cols-3">
                  <div>
                    <p className="text-ink-400">Mteja</p>
                    <p className="font-medium text-ink-900">
                      {order.customer.name}
                    </p>
                    <p className="text-ink-500">{order.customer.phone}</p>
                  </div>
                  <div>
                    <p className="text-ink-400">Anwani</p>
                    <p className="font-medium text-ink-900">
                      {order.customer.region}
                    </p>
                    <p className="truncate text-ink-500">
                      {order.customer.address}
                    </p>
                  </div>
                  <div>
                    <p className="text-ink-400">Malipo</p>
                    <p className="font-medium text-ink-900">{order.payment}</p>
                    <p className="text-ink-500">
                      {new Date(order.createdAt).toLocaleString("sw-TZ")}
                    </p>
                  </div>
                </div>

                <ul className="mt-3 space-y-1 border-t border-cream-200 pt-3 text-sm">
                  {order.lines.map((line) => (
                    <li key={line.slug} className="flex justify-between">
                      <span className="text-ink-700">
                        {line.slug} ×{line.qty}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* Sasisha hatua (oda halisi pekee) */}
                {!order.demo ? (
                  <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-cream-200 pt-3">
                    <span className="text-xs font-medium text-ink-500">
                      Sasisha hatua:
                    </span>
                    {statusSteps.map((step) => (
                      <button
                        key={step.id}
                        type="button"
                        onClick={() => setOrderStatus(order.code, step.id)}
                        disabled={status === step.id}
                        className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                          status === step.id
                            ? "bg-brand-700 text-white"
                            : "bg-cream-100 text-ink-500 hover:bg-cream-200"
                        }`}
                      >
                        {step.label}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 text-xs text-ink-400 border-t border-cream-200 pt-3">
                    Oda ya demo — hatua inasonga yenyewe.
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
