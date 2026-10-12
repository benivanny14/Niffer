"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { createLocalStore } from "@/lib/local-store";
import { useAsync } from "@/lib/use-async";
import {
  demoOrders,
  liveStatus,
  statusSteps,
  type Order,
  type OrderStatus,
} from "@/lib/orders";
import { useAdminOrders, patchOrderStatus } from "@/lib/orders-client";
import { setStock, getStock } from "@/lib/stock";
import { apiGet, apiPatch, apiPost, errorMessage } from "@/lib/api";
import { products, categories } from "@/lib/data/catalog";
import { formatTsh, formatPhone } from "@/lib/format";
import { site } from "@/lib/site";
import {
  BagIcon,
  CheckIcon,
  ChatIcon,
  MailIcon,
  ShieldIcon,
  TagIcon,
  TruckIcon,
} from "@/components/ui/icons";

/* ============ Auth (server session) ============ */
const AUTH_KEY = "niffer.admin.auth.v1";
const authStore = createLocalStore<boolean>(AUTH_KEY, false);

type Tab = "muhtasari" | "bidhaa" | "oda" | "ujumbe";

type Stats = {
  orders: { orderCount: number; revenueTsh: number; pendingCount: number };
  catalog: { productCount: number; articleCount: number };
  messages: { total: number; unread: number };
  subscribers: number;
  giftCards: number;
  lowStock: { slug: string; qty: number }[];
};

type MessageRecord = {
  id: string;
  kind: "contact" | "wholesale" | "giftcard";
  name: string;
  phone: string;
  email: string;
  body: Record<string, string>;
  status: "new" | "read" | "done";
  createdAt: string;
};

const field =
  "w-full rounded-xl border border-cream-300 bg-surface px-4 py-3 text-sm text-ink-900 outline-none transition-colors focus:border-brand-500";

export default function AdminPage() {
  const authed = useSyncExternalStore(
    authStore.subscribe,
    authStore.get,
    authStore.getServer,
  );
  const [checking, setChecking] = useState(true);

  // Thibitisha session ya server (cookie) badala ya imani ya kifaa tu.
  useEffect(() => {
    let alive = true;
    apiGet<{ ok: boolean; authed: boolean }>("/api/auth/session")
      .then((data) => {
        if (alive) authStore.set(!!data.authed);
      })
      .catch(() => {
        /* server hai — acha hali ya ndani */
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
      <div className="container-x flex min-h-[50vh] items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-cream-300 border-t-brand-700" />
      </div>
    );
  }

  if (!authed) return <AdminLogin />;

  return <AdminDashboard />;
}

/* ============ Login ============ */
function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (sending) return;
    setSending(true);
    setError("");
    try {
      await apiPost("/api/auth/login", { password });
      authStore.set(true);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="container-x max-w-md py-20">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-accent">
        <ShieldIcon className="h-7 w-7" />
      </span>
      <h1 className="heading-display mt-6 text-center">Ingia kwenye Admin</h1>
      <p className="mt-3 text-center text-ink-500">
        Sehemu hii ni kwa wafanyakazi wa {site.name} pekee.
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
            {error}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={sending}
          className="btn-primary w-full disabled:opacity-60"
        >
          {sending ? "Inaingia…" : "Ingia"}
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
  const { orders: serverOrders, loading, error, refresh } = useAdminOrders();

  // Takwimu + ujumbe (pamoja) — zinasasishwa kila dakika.
  const adminData = useAsync<{ stats: Stats; messages: MessageRecord[] }>(
    "admin-data",
    async () => {
      const [s, m] = await Promise.all([
        apiGet<Stats>("/api/stats"),
        apiGet<{ ok: boolean; messages: MessageRecord[] }>("/api/messages"),
      ]);
      return { stats: s, messages: m.messages };
    },
    { intervalMs: 60_000 },
  );

  const stats = adminData.data?.stats ?? null;
  const messages = adminData.data?.messages ?? [];
  const dataError = adminData.error;

  // Oda zote: za server (DB) + demo.
  const allOrders = useMemo<Order[]>(
    () => [...serverOrders, ...demoOrders()],
    [serverOrders],
  );

  const unread = messages.filter((m) => m.status === "new").length;

  const tabs: { id: Tab; label: string }[] = [
    { id: "muhtasari", label: "Muhtasari" },
    { id: "bidhaa", label: "Bidhaa" },
    { id: "oda", label: `Oda (${allOrders.length})` },
    { id: "ujumbe", label: `Ujumbe${unread ? ` (${unread})` : ""}` },
  ];

  async function logout() {
    try {
      await apiPost("/api/auth/logout");
    } catch {
      /* tp */
    }
    authStore.set(false);
  }

  return (
    <div className="container-x py-10 lg:py-14">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="eyebrow">Admin</p>
          <h1 className="heading-display mt-1">Dashibodi ya Niffer</h1>
          <p className="mt-1 text-sm text-ink-500">
            {site.name} · simu: {site.phoneDisplay}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={refresh} className="btn-outline">
            Sasisha
          </button>
          <button type="button" onClick={logout} className="btn-outline">
            Toka
          </button>
        </div>
      </div>

      {(error || dataError) ? (
        <p className="mt-6 rounded-lg bg-danger-100 px-3 py-2 text-sm text-danger-600">
          {error || dataError}
        </p>
      ) : null}

      {/* Tabs */}
      <nav className="mt-8 flex gap-1 overflow-x-auto border-b border-cream-300">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`shrink-0 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              tab === t.id
                ? "border-brand-700 text-accent"
                : "border-transparent text-ink-500 hover:text-ink-900"
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <div className="mt-8">
        {tab === "muhtasari" ? (
          <Muhtasari stats={stats} orders={allOrders} messages={messages} loading={loading} />
        ) : null}
        {tab === "bidhaa" ? <BidhaaTab /> : null}
        {tab === "oda" ? <OdaTab orders={allOrders} loading={loading} onRefresh={refresh} /> : null}
        {tab === "ujumbe" ? <UjumbeTab messages={messages} /> : null}
      </div>
    </div>
  );
}

/* ============ Muhtasari ============ */
function Muhtasari({
  stats,
  orders,
  messages,
  loading,
}: {
  stats: Stats | null;
  orders: Order[];
  messages: MessageRecord[];
  loading: boolean;
}) {
  const lowStock = (stats?.lowStock ?? []).map((entry) => {
    const product = products.find((p) => p.slug === entry.slug);
    return {
      id: entry.slug,
      name: product?.name ?? entry.slug,
      stock: entry.qty,
    };
  });

  const revenue =
    (stats?.orders.revenueTsh ?? 0) +
    demoOrders().reduce((sum, o) => sum + o.totalTsh, 0);

  const cards = [
    { icon: BagIcon, label: "Oda zote", value: `${orders.length}` },
    { icon: TagIcon, label: "Mapato (jumla)", value: formatTsh(revenue) },
    { icon: ChatIcon, label: "Ujumbe wa fomu", value: `${messages.length}` },
    { icon: TruckIcon, label: "Bidhaa zinazouzwa", value: `${products.length}` },
  ];

  if (loading && !stats) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="card h-24 animate-pulse bg-cream-100" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(({ icon: Icon, label, value }) => (
          <div key={label} className="card p-5">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-100 text-accent">
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

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <div className="card p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">
            Oda bado hazijafika
          </p>
          <p className="font-display text-xl text-ink-900">
            {stats?.orders.pendingCount ?? 0}
          </p>
        </div>
        <div className="card p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">
            Waasisi wa jarida
          </p>
          <p className="font-display text-xl text-ink-900">
            {stats?.subscribers ?? 0}
          </p>
        </div>
        <div className="card p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">
            Kadi za zawadi
          </p>
          <p className="font-display text-xl text-ink-900">
            {stats?.giftCards ?? 0}
          </p>
        </div>
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
                  <span className="badge bg-brand-100 text-accent">
                    {label}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm text-ink-500">
                    {order.customer.name} · {order.customer.region}
                  </span>
                  <span className="text-sm font-semibold text-accent">
                    {formatTsh(order.totalTsh)}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Ujumbe wa hivi karibuni */}
      <section className="mt-10">
        <h2 className="font-display text-xl text-ink-900">
          Ujumbe wa hivi karibuni
        </h2>
        {messages.length === 0 ? (
          <p className="mt-3 text-sm text-ink-500">
            Hakuna ujumbe bado kutoka fomu za tovuti.
          </p>
        ) : (
          <ul className="mt-4 space-y-2">
            {messages.slice(0, 4).map((message) => (
              <li key={message.id} className="card flex flex-wrap items-center gap-3 p-4">
                <MailIcon className="h-4 w-4 shrink-0 text-brand-600" />
                <span className="font-medium text-ink-900">{message.name}</span>
                <span className="badge bg-cream-100 text-ink-500">
                  {message.kind === "wholesale"
                    ? "Jumla"
                    : message.kind === "giftcard"
                      ? "Kadi"
                      : "Wasiliana"}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm text-ink-500">
                  {message.body.message ??
                    message.body.business ??
                    message.email ??
                    ""}
                </span>
                <span className="text-xs text-ink-400">
                  {new Date(message.createdAt).toLocaleString("sw-TZ")}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Stoo ndogo */}
      {lowStock.length > 0 ? (
        <section className="mt-10">
          <h2 className="font-display text-xl text-ink-900">
            Bidhaa zenye stoo ndogo (≤10)
          </h2>
          <ul className="mt-4 space-y-2">
            {lowStock.map((p) => (
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
  const [saved, setSaved] = useState("");
  const [saveError, setSaveError] = useState("");

  async function saveStock(slug: string, qty: number) {
    setStock(slug, qty); // mara moja kwenye duka
    setSaved(slug);
    setSaveError("");
    try {
      await apiPatch("/api/stock", { slug, qty });
    } catch (err) {
      setSaveError(errorMessage(err));
    } finally {
      window.setTimeout(() => setSaved(""), 1500);
    }
  }

  const filtered = products.filter(
    (p) => categoryFilter === "zote" || p.category === categoryFilter,
  );

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm font-medium text-ink-700">Kategoria:</label>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-xl border border-cream-300 bg-surface px-3 py-2 text-sm"
        >
          <option value="zote">Zote</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
        {saved ? (
          <span className="badge bg-success-100 text-success-600">
            <CheckIcon className="h-3 w-3" /> Imehifadhiwa kwenye database
          </span>
        ) : null}
        {saveError ? (
          <span className="text-xs text-danger-600">{saveError}</span>
        ) : null}
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
                        void saveStock(product.slug, v);
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
        Mabadiliko ya stoo huhifadhiwa moja kwa moja kwenye database ya seva na
        kuonekana kwenye duka lote.
      </p>
    </div>
  );
}

/* ============ Oda ============ */
function OdaTab({
  orders,
  loading,
  onRefresh,
}: {
  orders: Order[];
  loading: boolean;
  onRefresh: () => void;
}) {
  const [filter, setFilter] = useState<"zote" | OrderStatus>("zote");
  const [savingCode, setSavingCode] = useState("");
  const [actionError, setActionError] = useState("");

  const filtered = orders.filter((o) => {
    if (filter === "zote") return true;
    return liveStatus(o) === filter;
  });

  async function changeStatus(code: string, status: OrderStatus) {
    setSavingCode(code);
    setActionError("");
    try {
      await patchOrderStatus(code, status);
      onRefresh();
    } catch (err) {
      setActionError(errorMessage(err));
    } finally {
      setSavingCode("");
    }
  }

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

      {actionError ? (
        <p className="mt-4 rounded-lg bg-danger-100 px-3 py-2 text-sm text-danger-600">
          {actionError}
        </p>
      ) : null}

      {loading && orders.length === 0 ? (
        <div className="mt-6 space-y-3">
          {[0, 1].map((i) => (
            <div key={i} className="card h-40 animate-pulse bg-cream-100" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
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
                    <span className="badge bg-brand-100 text-accent">
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
                  <span className="font-display text-lg text-accent">
                    {formatTsh(order.totalTsh)}
                  </span>
                </div>

                <div className="mt-3 grid gap-2 text-sm sm:grid-cols-3">
                  <div>
                    <p className="text-ink-400">Mteja</p>
                    <p className="font-medium text-ink-900">
                      {order.customer.name}
                    </p>
                    <p className="text-ink-500">
                      {formatPhone(order.customer.phone)}
                    </p>
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
                        onClick={() => void changeStatus(order.code, step.id)}
                        disabled={status === step.id || savingCode === order.code}
                        className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                          status === step.id
                            ? "bg-brand-700 text-white"
                            : "bg-cream-100 text-ink-500 hover:bg-cream-200 disabled:opacity-60"
                        }`}
                      >
                        {savingCode === order.code && status !== step.id
                          ? "Inasasisha…"
                          : step.label}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 border-t border-cream-200 pt-3 text-xs text-ink-400">
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

/* ============ Ujumbe ============ */
const kindLabels: Record<MessageRecord["kind"], string> = {
  contact: "Wasiliana",
  wholesale: "Ombi la jumla",
  giftcard: "Kadi ya zawadi",
};

function UjumbeTab({ messages }: { messages: MessageRecord[] }) {
  if (messages.length === 0) {
    return (
      <div className="card p-10 text-center">
        <MailIcon className="mx-auto h-12 w-12 text-ink-300" />
        <p className="font-display mt-4 text-lg text-ink-900">
          Hakuna ujumbe bado
        </p>
        <p className="mt-2 text-sm text-ink-500">
          Ujumbe kutoka fomu za wasiliana, jumla na kadi utaonekana hapa.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {messages.map((message) => (
        <li key={message.id} className="card p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-display text-lg text-ink-900">
                {message.name}
              </span>
              <span className="badge bg-brand-100 text-accent">
                {kindLabels[message.kind]}
              </span>
              {message.status === "new" ? (
                <span className="badge bg-warning-100 text-warning-600">
                  Mpya
                </span>
              ) : null}
            </div>
            <span className="text-xs text-ink-400">
              {new Date(message.createdAt).toLocaleString("sw-TZ")}
            </span>
          </div>

          <div className="mt-3 grid gap-2 text-sm sm:grid-cols-3">
            {message.phone ? (
              <div>
                <p className="text-ink-400">Simu</p>
                <p className="font-medium text-ink-900">
                  {formatPhone(message.phone)}
                </p>
              </div>
            ) : null}
            {message.email ? (
              <div>
                <p className="text-ink-400">Barua pepe</p>
                <p className="font-medium text-ink-900">{message.email}</p>
              </div>
            ) : null}
            <div>
              <p className="text-ink-400">Aina</p>
              <p className="font-medium text-ink-900">
                {kindLabels[message.kind]}
              </p>
            </div>
          </div>

          <dl className="mt-3 space-y-1 border-t border-cream-200 pt-3 text-sm">
            {Object.entries(message.body)
              .filter(([, value]) => String(value ?? "").trim().length > 0)
              .map(([key, value]) => (
                <div key={key} className="flex gap-2">
                  <dt className="w-28 shrink-0 text-ink-400">{key}</dt>
                  <dd className="text-ink-700">{value}</dd>
                </div>
              ))}
          </dl>
        </li>
      ))}
    </ul>
  );
}
