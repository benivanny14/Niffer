"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { createLocalStore } from "@/lib/local-store";
import { useAsync } from "@/lib/use-async";
import {
  liveStatus,
  statusLabel,
  statusSteps,
  type Order,
  type OrderStatus,
} from "@/lib/orders";
import { useAdminOrders, patchOrderStatus } from "@/lib/orders-client";
import { apiGet, apiPatch, apiPost, errorMessage } from "@/lib/api";
import { ProductManager } from "@/components/admin/ProductManager";
import { AdminProfileManager } from "@/components/admin/AdminProfileManager";
import { formatTsh, formatPhone } from "@/lib/format";
import { site } from "@/lib/site";
import {
  BagIcon,
  CheckIcon,
  ChatIcon,
  MailIcon,
  ShieldIcon,
  StarIcon,
  TagIcon,
  TruckIcon,
} from "@/components/ui/icons";

/* ============ Auth (server session) ============ */
const AUTH_KEY = "niffer.admin.auth.v1";
const authStore = createLocalStore<boolean>(AUTH_KEY, false);

type Tab =
  | "overview"
  | "products"
  | "orders"
  | "customers"
  | "wholesale"
  | "reviews"
  | "promo"
  | "storage"
  | "messages";

type Stats = {
  orders: { orderCount: number; revenueTsh: number; pendingCount: number };
  catalog: { productCount: number; articleCount: number };
  messages: { total: number; unread: number };
  subscribers: number;
  giftCards: number;
  lowStock: { slug: string; qty: number }[];
  soldBySlug?: Record<string, number>;
  reviews?: { pending: number };
  notifications?: { unread: number };
};

type MessageRecord = {
  id: string;
  kind: "contact" | "wholesale" | "giftcard" | "rfq";
  name: string;
  phone: string;
  email: string;
  body: Record<string, string>;
  status: "new" | "read" | "done";
  createdAt: string;
};

type ReviewRecord = {
  id: string;
  customerName: string;
  location: string;
  rating: number;
  comment: string;
  productSlug: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string | null;
};

type PromoRecord = {
  code: string;
  label: string;
  percentOff?: number;
  freeShipping: boolean;
  minSubtotalTsh?: number;
  active: boolean;
};

type NotificationRecord = {
  id: string;
  kind: string;
  title: string;
  body: string;
  ref: string;
  status: "new" | "read";
  createdAt: string;
};

type SubscriberRecord = { email: string; createdAt: string };

type AdminProductRow = { slug: string; name: string; stock: number };
type GiftCardRecord = {
  code: string;
  amountTsh: number;
  recipient: string;
  message: string;
  status: string;
  createdAt: string;
  expiresAt?: string;
};

type CustomerRecord = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  createdAt: string;
};

type RfqRecord = {
  code: string;
  business: string;
  name: string;
  phone: string;
  email: string;
  region: string;
  productSlug: string;
  productName: string;
  qty: number;
  note: string;
  status: "new" | "reviewed" | "quoted" | "accepted" | "declined";
  quoteTsh: number | null;
  unitQuoteTsh: number | null;
  createdAt: string;
  updatedAt: string;
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
      <h1 className="heading-display mt-6 text-center">Admin sign in</h1>
      <p className="mt-3 text-center text-ink-500">
        This area is for {site.name} staff only.
      </p>
      <form onSubmit={submit} className="card mt-8 space-y-4 p-6">
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-ink-700">Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={field}
            placeholder="Enter password"
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
          {sending ? "Signing in…" : "Sign in"}
        </button>
        {process.env.NODE_ENV !== "production" ? (
          <p className="text-center text-xs text-ink-400">
            Demo password: <span className="font-mono">niffer2026</span>
          </p>
        ) : null}
      </form>
    </div>
  );
}

/* ============ Dashboard ============ */
function AdminDashboard() {
  const [tab, setTab] = useState<Tab>("overview");
  const { orders: serverOrders, loading, error, refresh } = useAdminOrders();

  // Takwimu + messages + ombi za wholesale + reviews + promos + notifications
  // + storage (jarida/kadi) — zinasasishwa kila dakika.
  const adminData = useAsync<{
    stats: Stats;
    messages: MessageRecord[];
    rfqs: RfqRecord[];
    reviews: ReviewRecord[];
    promos: PromoRecord[];
    notifications: NotificationRecord[];
    subscribers: SubscriberRecord[];
    giftCards: GiftCardRecord[];
    customers: CustomerRecord[];
    adminProducts: AdminProductRow[];
  }>(
    "admin-data",
    async () => {
      const [s, m, r, rv, pr, nt, nl, gc, cu, pd] = await Promise.all([
        apiGet<Stats>("/api/stats"),
        apiGet<{ ok: boolean; messages: MessageRecord[] }>("/api/messages"),
        apiGet<{ ok: boolean; rfqs: RfqRecord[] }>("/api/rfq"),
        apiGet<{ ok: boolean; reviews: ReviewRecord[] }>("/api/reviews?all=1"),
        apiGet<{ ok: boolean; promos: PromoRecord[] }>("/api/promos"),
        apiGet<{
          ok: boolean;
          notifications: NotificationRecord[];
        }>("/api/notifications"),
        apiGet<{
          ok: boolean;
          subscribers: SubscriberRecord[];
        }>("/api/newsletter"),
        apiGet<{ ok: boolean; giftCards: GiftCardRecord[] }>(
          "/api/giftcards",
        ),
        apiGet<{ ok: boolean; customers: CustomerRecord[] }>(
          "/api/customers/list",
        ),
        apiGet<{ ok: boolean; products: { slug: string; name: string; stock: number }[] }>(
          "/api/products",
        ),
      ]);
      return {
        stats: s,
        messages: m.messages,
        rfqs: r.rfqs,
        reviews: rv.reviews,
        promos: pr.promos,
        notifications: nt.notifications,
        subscribers: nl.subscribers,
        giftCards: gc.giftCards,
        customers: cu.customers,
        adminProducts: (pd.products ?? []).map((p) => ({
          slug: p.slug,
          name: p.name,
          stock: p.stock,
        })),
      };
    },
    { intervalMs: 60_000 },
  );

  const stats = adminData.data?.stats ?? null;
  const messages = adminData.data?.messages ?? [];
  const rfqs = adminData.data?.rfqs ?? [];
  const reviews = adminData.data?.reviews ?? [];
  const promos = adminData.data?.promos ?? [];
  const notifications = adminData.data?.notifications ?? [];
  const subscribers = adminData.data?.subscribers ?? [];
  const giftCards = adminData.data?.giftCards ?? [];
  const customers = adminData.data?.customers ?? [];
  const adminProducts = adminData.data?.adminProducts ?? [];
  const dataError = adminData.error;

  // All orders za server (DB) — demo zimeondolewa.
  const allOrders = useMemo<Order[]>(() => serverOrders, [serverOrders]);

  const unread = messages.filter((m) => m.status === "new").length;

  const newRfqs = rfqs.filter((r) => r.status === "new").length;

  const pendingReviews = reviews.filter((r) => r.status === "pending").length;

  const unreadNotifications = notifications.filter(
    (n) => n.status === "new",
  ).length;

  const tabs: { id: Tab; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "products", label: "Products" },
    { id: "orders", label: `Orders (${allOrders.length})` },
    { id: "customers", label: `Customers (${customers.length})` },
    { id: "wholesale", label: `Wholesale${newRfqs ? ` (${newRfqs})` : ""}` },
    {
      id: "reviews",
      label: `Reviews${pendingReviews ? ` (${pendingReviews})` : ""}`,
    },
    { id: "promo", label: "Promo" },
    {
      id: "storage",
      label: `Updates${unreadNotifications ? ` (${unreadNotifications})` : ""}`,
    },
    { id: "messages", label: `Messages${unread ? ` (${unread})` : ""}` },
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
    <div className="admin-shell container-x py-10 lg:py-14">
      <AdminProfileManager />
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="eyebrow">Admin</p>
          <h1 className="heading-display mt-1">Niffer dashboard</h1>
          <p className="mt-1 text-sm text-ink-500">
            {site.name} · Phone: {site.phoneDisplay}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={refresh} className="btn-outline">
            Refresh
          </button>
          <button type="button" onClick={logout} className="btn-outline">
            Sign out
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
        {tab === "overview" ? (
          <Overview
            stats={stats}
            orders={allOrders}
            messages={messages}
            loading={loading}
            products={adminProducts}
          />
        ) : null}
        {tab === "products" ? <ProductManager /> : null}
        {tab === "orders" ? <OrdersTab orders={allOrders} loading={loading} onRefresh={refresh} /> : null}
        {tab === "customers" ? <CustomersTab customers={customers} /> : null}
        {tab === "wholesale" ? (
          <WholesaleTab rfqs={rfqs} onChanged={() => adminData.refresh()} />
        ) : null}
        {tab === "reviews" ? (
          <ReviewsTab reviews={reviews} onChanged={() => adminData.refresh()} />
        ) : null}
        {tab === "promo" ? (
          <PromoTab promos={promos} onChanged={() => adminData.refresh()} />
        ) : null}
        {tab === "storage" ? (
          <UpdatesTab
            notifications={notifications}
            subscribers={subscribers}
            giftCards={giftCards}
            onChanged={() => adminData.refresh()}
          />
        ) : null}
        {tab === "messages" ? (
          <MessagesTab messages={messages} onChanged={() => adminData.refresh()} />
        ) : null}
      </div>
    </div>
  );
}

/* ============ Overview ============ */
function Overview({
  stats,
  orders,
  messages,
  loading,
  products,
}: {
  stats: Stats | null;
  orders: Order[];
  messages: MessageRecord[];
  loading: boolean;
  products: AdminProductRow[];
}) {
  const lowStock = (stats?.lowStock ?? []).map((entry) => {
    const product = products.find((p) => p.slug === entry.slug);
    return {
      id: entry.slug,
      name: product?.name ?? entry.slug,
      stock: entry.qty,
    };
  });

  const revenue = stats?.orders.revenueTsh ?? 0;

  // Products zilizouzwa vs zilizobaki (kutoka DB — products za admin zimejumuishwa).
  const soldBySlug = stats?.soldBySlug ?? {};
  const productSales = products
    .map((p) => ({
      slug: p.slug,
      name: p.name,
      sold: soldBySlug[p.slug] ?? 0,
      stock: p.stock,
    }))
    .sort((a, b) => b.sold - a.sold);

  const totalSold = productSales.reduce((sum, p) => sum + p.sold, 0);
  const totalStock = productSales.reduce((sum, p) => sum + p.stock, 0);

  const cards = [
    { icon: BagIcon, label: "All orders", value: `${orders.length}` },
    { icon: TagIcon, label: "Total revenue", value: formatTsh(revenue) },
    { icon: ChatIcon, label: "Form messages", value: `${messages.length}` },
    {
      icon: TruckIcon,
      label: "Products for sale",
      value: `${stats?.catalog.productCount ?? products.length}`,
    },
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
            Pending orders
          </p>
          <p className="font-display text-xl text-ink-900">
            {stats?.orders.pendingCount ?? 0}
          </p>
        </div>
        <div className="card p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">
            Newsletter subscribers
          </p>
          <p className="font-display text-xl text-ink-900">
            {stats?.subscribers ?? 0}
          </p>
        </div>
        <div className="card p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">
            Gift cards
          </p>
          <p className="font-display text-xl text-ink-900">
            {stats?.giftCards ?? 0}
          </p>
        </div>
      </div>

      {/* Products zilizouzwa vs zilizobaki */}
      <section className="mt-10">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-display text-xl text-ink-900">
            Product sales
          </h2>
          <p className="text-sm text-ink-500">
            Sold: <span className="font-semibold text-ink-900">{totalSold}</span>
            {" · "}
            In stock: <span className="font-semibold text-ink-900">{totalStock}</span>
          </p>
        </div>
        {productSales.length === 0 ? (
          <p className="mt-3 text-sm text-ink-500">No products yet.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-cream-300 text-left text-xs uppercase tracking-wide text-ink-400">
                  <th className="pb-2 pr-4">Products</th>
                  <th className="pb-2 pr-4 text-right">Sold</th>
                  <th className="pb-2 pr-4 text-right">In stock</th>
                  <th className="pb-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {productSales.map((p) => (
                  <tr key={p.slug} className="border-b border-cream-200">
                    <td className="py-2 pr-4 font-medium text-ink-900">
                      {p.name}
                    </td>
                    <td className="py-2 pr-4 text-right font-semibold text-accent">
                      {p.sold}
                    </td>
                    <td className="py-2 pr-4 text-right">
                      <span
                        className={
                          p.stock === 0
                            ? "font-semibold text-danger-600"
                            : p.stock <= 10
                              ? "font-semibold text-warning-600"
                              : "text-ink-700"
                        }
                      >
                        {p.stock}
                      </span>
                    </td>
                    <td className="py-2 text-right">
                      {p.stock === 0 ? (
                        <span className="badge bg-danger-100 text-danger-600">
                          Out of stock
                        </span>
                      ) : p.stock <= 10 ? (
                        <span className="badge bg-warning-100 text-warning-600">
                          Low stock
                        </span>
                      ) : (
                        <span className="badge bg-success-100 text-success-600">
                          In stock
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Recent orders */}
      <section className="mt-10">
        <h2 className="font-display text-xl text-ink-900">
          Recent orders
        </h2>
        {orders.length === 0 ? (
          <p className="mt-3 text-sm text-ink-500">
            No orders yet. New orders will appear here.
          </p>
        ) : (
          <ul className="mt-4 space-y-2">
            {orders.slice(0, 5).map((order) => {
              const status = liveStatus(order);
              const label = statusLabel(status);
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

      {/* Recent messages */}
      <section className="mt-10">
        <h2 className="font-display text-xl text-ink-900">
          Recent messages
        </h2>
        {messages.length === 0 ? (
          <p className="mt-3 text-sm text-ink-500">
            No website messages yet.
          </p>
        ) : (
          <ul className="mt-4 space-y-2">
            {messages.slice(0, 4).map((message) => (
              <li key={message.id} className="card flex flex-wrap items-center gap-3 p-4">
                <MailIcon className="h-4 w-4 shrink-0 text-brand-600" />
                <span className="font-medium text-ink-900">{message.name}</span>
                <span className="badge bg-cream-100 text-ink-500">
                  {message.kind === "wholesale"
                    ? "Wholesale"
                    : message.kind === "rfq"
                      ? "RFQ"
                      : message.kind === "giftcard"
                        ? "Gift card"
                        : "Contact"}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm text-ink-500">
                  {message.body.message ??
                    message.body.business ??
                    message.email ??
                    ""}
                </span>
                <span className="text-xs text-ink-400">
                  {new Date(message.createdAt).toLocaleString("en-TZ")}
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
            Low-stock products (≤10)
          </h2>
          <ul className="mt-4 space-y-2">
            {lowStock.map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between rounded-xl bg-warning-100 px-4 py-3 text-sm"
              >
                <span className="font-medium text-ink-900">{p.name}</span>
                <span className="font-semibold text-warning-600">
                  Remaining: {p.stock}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

/* ============ Customers ============ */
function CustomersTab({ customers }: { customers: CustomerRecord[] }) {
  if (customers.length === 0) {
    return (
      <div className="card p-6 text-sm text-ink-500">
        No customer accounts yet.
      </div>
    );
  }

  return (
    <div className="card overflow-x-auto">
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead>
          <tr className="border-b border-cream-300 text-xs uppercase tracking-wide text-ink-400">
            <th className="px-5 py-3 font-semibold">Name</th>
            <th className="px-5 py-3 font-semibold">Phone</th>
            <th className="px-5 py-3 font-semibold">Email</th>
            <th className="px-5 py-3 font-semibold">Joined</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((c) => (
            <tr key={c.id} className="border-b border-cream-200 last:border-0">
              <td className="px-5 py-3 font-medium text-ink-900">{c.name}</td>
              <td className="px-5 py-3 text-ink-700">
                {formatPhone(c.phone)}
              </td>
              <td className="px-5 py-3 text-ink-500">
                {c.email || "—"}
              </td>
              <td className="px-5 py-3 text-ink-400">
                {new Date(c.createdAt).toLocaleDateString("en-TZ")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ============ Orders ============ */
function OrdersTab({
  orders,
  loading,
  onRefresh,
}: {
  orders: Order[];
  loading: boolean;
  onRefresh: () => void;
}) {
  const [filter, setFilter] = useState<"all" | OrderStatus>("all");
  const [search, setSearch] = useState("");
  const [savingCode, setSavingCode] = useState("");
  const [actionError, setActionError] = useState("");
  const [notifyCode, setNotifyCode] = useState("");
  const [notifyTitle, setNotifyTitle] = useState("");
  const [notifyBody, setNotifyBody] = useState("");
  const [notifySending, setNotifySending] = useState(false);
  const [notifyError, setNotifyError] = useState("");
  const [notifyOk, setNotifyOk] = useState("");

  const digits = (value: string) => value.replace(/[^0-9]/g, "");
  const query = search.trim().toLowerCase();
  const queryDigits = digits(query);

  const filtered = orders.filter((o) => {
    if (filter !== "all" && liveStatus(o) !== filter) return false;
    if (!query) return true;
    if (o.code.toLowerCase().includes(query)) return true;
    if (o.customer.name.toLowerCase().includes(query)) return true;
    if (
      queryDigits.length >= 3 &&
      digits(o.customer.phone).includes(queryDigits)
    ) {
      return true;
    }
    return false;
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

  async function sendNotification(code: string) {
    if (notifySending) return;
    setNotifySending(true);
    setNotifyError("");
    setNotifyOk("");
    try {
      await apiPost(`/api/orders/${encodeURIComponent(code)}/notify`, {
        title: notifyTitle,
        body: notifyBody,
      });
      setNotifyOk(`Message sent to customer for ${code}.`);
      setNotifyCode("");
      setNotifyTitle("");
      setNotifyBody("");
    } catch (err) {
      setNotifyError(errorMessage(err));
    } finally {
      setNotifySending(false);
    }
  }

  /** Pakua orders zilizochujwa kama CSV (Excel / Google Sheets). */
  function exportCsv() {
    const header = [
      "Order number",
      "Date",
      "Status",
      "Name",
      "Phone",
      "Region",
      "City",
      "Street",
      "Products",
      "Subtotal",
      "Delivery",
      "Discount",
      "Total",
      "Payment",
    ];
    const rows = filtered.map((o) => [
      o.code,
      o.createdAt,
      liveStatus(o),
      o.customer.name,
      o.customer.phone,
      o.customer.region,
      o.customer.city ?? "",
      o.customer.street ?? "",
      o.lines.map((l) => `${l.slug} x${l.qty}`).join(" + "),
      o.subtotalTsh,
      o.shippingTsh,
      o.discountTsh ?? 0,
      o.totalTsh,
      o.payment,
    ]);
    const csv = [header, ...rows]
      .map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
      )
      .join("\r\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-ink-700">Filter:</span>
        {(
          ["all", ...statusSteps.map((s) => s.id), "ghairiwa"] as const
        ).map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => setFilter(id as typeof filter)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              filter === id
                ? "bg-brand-700 text-white"
                : "bg-cream-100 text-ink-500 hover:bg-cream-200 disabled:opacity-60"
            }`}
          >
            {id === "all"
              ? "All"
              : id === "ghairiwa"
                ? "Cancelled"
                : statusSteps.find((s) => s.id === id)?.label}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search order number, name or phone…"
            aria-label="Search orders"
            className="w-56 rounded-full border border-cream-300 bg-surface px-4 py-1.5 text-sm text-ink-900 outline-none transition-colors focus:border-brand-500"
          />
          <button
            type="button"
            onClick={exportCsv}
            disabled={filtered.length === 0}
            className="btn-outline px-4 py-2 text-xs disabled:opacity-50"
          >
            Download CSV ({filtered.length})
          </button>
        </div>
      </div>

      {actionError ? (
        <p className="mt-4 rounded-lg bg-danger-100 px-3 py-2 text-sm text-danger-600">
          {actionError}
        </p>
      ) : null}
      {notifyOk ? (
        <p className="mt-4 rounded-lg bg-success-100 px-3 py-2 text-sm text-success-600">
          {notifyOk}
        </p>
      ) : null}

      {/* Send a message to customer */}
      {notifyCode ? (
        <div className="card mt-4 border-brand-200 bg-brand-50 p-5">
          <h3 className="font-display text-lg text-ink-900">
            Send a message to {notifyCode}
          </h3>
          <div className="mt-3 space-y-3">
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-ink-700">
                Subject *
              </span>
              <input
                required
                value={notifyTitle}
                onChange={(e) => setNotifyTitle(e.target.value)}
                className={field}
                placeholder="e.g. Your order has shipped"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-ink-700">
                Messages
              </span>
              <textarea
                value={notifyBody}
                onChange={(e) => setNotifyBody(e.target.value)}
                rows={3}
                className={field}
                placeholder="Add a note for the customer…"
              />
            </label>
            {notifyError ? (
              <p className="rounded-lg bg-danger-100 px-3 py-2 text-sm text-danger-600">
                {notifyError}
              </p>
            ) : null}
            <div className="flex gap-2">
              <button
                type="button"
                disabled={notifySending || !notifyTitle.trim()}
                onClick={() => void sendNotification(notifyCode)}
                className="btn-primary px-4 py-2 text-sm disabled:opacity-60"
              >
                {notifySending ? "Sending…" : "Send message"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setNotifyCode("");
                  setNotifyTitle("");
                  setNotifyBody("");
                }}
                className="btn-outline px-4 py-2 text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
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
            No orders match this filter
          </p>
          <p className="mt-2 text-sm text-ink-500">
            Change the filter or wait for new orders.
          </p>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {filtered.map((order) => {
            const status = liveStatus(order);
            const label = statusLabel(status);
            const isCancelled = status === "ghairiwa";
            return (
              <li key={order.code} className="card p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-display text-lg text-ink-900">
                      {order.code}
                    </span>
                    <span
                      className={`badge ${
                        isCancelled
                          ? "bg-danger-100 text-danger-600"
                          : "bg-brand-100 text-accent"
                      }`}
                    >
                      {label}
                    </span>
                    {order.demo ? (
                      <span className="badge bg-cream-100 text-ink-400">
                        demo
                      </span>
                    ) : (
                      <span className="badge bg-success-100 text-success-600">
                        <CheckIcon className="h-3 w-3" />
                        Live
                      </span>
                    )}
                  </div>
                  <span className="font-display text-lg text-accent">
                    {formatTsh(order.totalTsh)}
                  </span>
                </div>

                <div className="mt-3 grid gap-2 text-sm sm:grid-cols-3">
                  <div>
                    <p className="text-ink-400">Customer</p>
                    <p className="font-medium text-ink-900">
                      {order.customer.name}
                    </p>
                    <p className="text-ink-500">
                      {formatPhone(order.customer.phone)}
                    </p>
                  </div>
                  <div>
                    <p className="text-ink-400">Delivery address</p>
                    <p className="font-medium text-ink-900">
                      {[order.customer.city, order.customer.region]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                    <p className="text-ink-500">
                      {order.customer.street || "—"}
                    </p>
                    <p className="truncate text-xs text-ink-400">
                      {order.customer.address}
                    </p>
                  </div>
                  <div>
                    <p className="text-ink-400">Payment</p>
                    <p className="font-medium text-ink-900">{order.payment}</p>
                    <p className="text-ink-500">
                      {new Date(order.createdAt).toLocaleString("en-TZ")}
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

                {/* Update status (orders Live pekee) */}
                {!order.demo ? (
                  <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-cream-200 pt-3">
                    {/* Quick confirm (mpokelewa → inaendelea) */}
                    {status === "imapokelewa" ? (
                      <button
                        type="button"
                        onClick={() => void changeStatus(order.code, "inaendelea")}
                        disabled={savingCode === order.code}
                        className="rounded-full bg-success-100 px-3 py-1 text-xs font-semibold text-success-600 transition-colors hover:bg-success-200 disabled:opacity-60"
                      >
                        {savingCode === order.code
                          ? "Confirming…"
                          : "✓ Confirm order"}
                      </button>
                    ) : null}

                    <span className="text-xs font-medium text-ink-500">
                      Status:
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
                          ? "Updating…"
                          : step.label}
                      </button>
                    ))}

                    {!order.demo &&
                    status !== "imefika" &&
                    status !== "ghairiwa" ? (
                      <button
                        type="button"
                        onClick={() => {
                          if (
                            window.confirm(
                            `Cancel order ${order.code}? Stock will be restored.`,
                            )
                          ) {
                            void changeStatus(order.code, "ghairiwa");
                          }
                        }}
                        disabled={savingCode === order.code}
                        className="rounded-full bg-danger-100 px-3 py-1 text-xs font-semibold text-danger-600 transition-colors hover:bg-danger-200 disabled:opacity-60"
                      >
                        {savingCode === order.code ? "Cancelling…" : "✕ Cancel"}
                      </button>
                    ) : null}

                    {/* Send a message to mteja */}
                    <button
                      type="button"
                      onClick={() => {
                        setNotifyCode(order.code);
                        setNotifyTitle("");
                        setNotifyBody("");
                        setNotifyError("");
                        setNotifyOk("");
                      }}
                      className="ml-auto rounded-full bg-brand-100 px-3 py-1 text-xs font-medium text-accent transition-colors hover:bg-brand-200"
                    >
                      <ChatIcon className="mr-1 inline h-3 w-3" />
                      Send message
                    </button>
                  </div>
                ) : (
                  <p className="mt-3 border-t border-cream-200 pt-3 text-xs text-ink-400">
                    Orders ya demo — hatua inasonga yenyewe.
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

/* ============ Wholesale (RFQ) ============ */
const rfqStatusLabels: Record<RfqRecord["status"], string> = {
  new: "Received",
  reviewed: "Under review",
  quoted: "Quoted",
  accepted: "Accepted",
  declined: "Declined",
};

function WholesaleTab({
  rfqs,
  onChanged,
}: {
  rfqs: RfqRecord[];
  onChanged: () => void;
}) {
  const [saving, setSaving] = useState("");
  const [error, setError] = useState("");
  const [quotes, setQuotes] = useState<Record<string, string>>({});

  async function patch(
    code: string,
    body: { status?: string; unitQuoteTsh?: number | null },
  ) {
    setSaving(code);
    setError("");
    try {
      await apiPatch(`/api/rfq/${code}`, body);
      onChanged();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving("");
    }
  }

  if (rfqs.length === 0) {
    return (
      <div className="card p-10 text-center">
        <TagIcon className="mx-auto h-12 w-12 text-ink-300" />
        <p className="font-display mt-4 text-lg text-ink-900">
          No wholesale requests yet
        </p>
        <p className="mt-2 text-sm text-ink-500">
          Quote requests from /jumla will appear here.
        </p>
      </div>
    );
  }

  return (
    <div>
      {error ? (
        <p className="mb-4 rounded-lg bg-danger-100 px-3 py-2 text-sm text-danger-600">
          {error}
        </p>
      ) : null}
      <ul className="space-y-3">
        {rfqs.map((rfq) => (
          <li key={rfq.code} className="card p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-lg font-semibold text-accent">
                  {rfq.code}
                </span>
                <span className="badge bg-brand-100 text-accent">
                  {rfqStatusLabels[rfq.status]}
                </span>
                {rfq.quoteTsh != null ? (
                  <span className="badge bg-success-100 text-success-600">
                    Quote: {formatTsh(rfq.quoteTsh)}
                  </span>
                ) : null}
              </div>
              <span className="text-xs text-ink-400">
                {new Date(rfq.createdAt).toLocaleString("en-TZ")}
              </span>
            </div>

            <div className="mt-3 grid gap-2 text-sm sm:grid-cols-3">
              <div>
                <p className="text-ink-400">Business</p>
                <p className="font-medium text-ink-900">{rfq.business}</p>
                <p className="text-ink-500">{rfq.name}</p>
              </div>
              <div>
                <p className="text-ink-400">Contact</p>
                <p className="font-medium text-ink-900">
                  {formatPhone(rfq.phone)}
                </p>
                <p className="truncate text-ink-500">
                  {rfq.email || rfq.region || "—"}
                </p>
              </div>
              <div>
                <p className="text-ink-400">Request</p>
                <p className="font-medium text-ink-900">
                  {rfq.productName || "—"} × {rfq.qty} pcs
                </p>
                <p className="truncate text-ink-500">{rfq.note || "—"}</p>
              </div>
            </div>

            {/* Vitendo: bei + hali */}
            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-cream-200 pt-3">
              <label className="flex items-center gap-2 text-xs font-medium text-ink-500">
                Unit price (TSh):
                <input
                  type="number"
                  min={0}
                  value={quotes[rfq.code] ?? (rfq.unitQuoteTsh != null ? String(rfq.unitQuoteTsh) : "")}
                  onChange={(e) =>
                    setQuotes({ ...quotes, [rfq.code]: e.target.value })
                  }
                  placeholder="e.g. 15000"
                  className="w-28 rounded-lg border border-cream-300 px-2 py-1 text-sm"
                  aria-label={`Unit price for ${rfq.code}`}
                />
                <button
                  type="button"
                  disabled={saving === rfq.code || !quotes[rfq.code]}
                  onClick={() =>
                    void patch(rfq.code, {
                      unitQuoteTsh: Math.max(
                        0,
                        Math.round(Number(quotes[rfq.code]) || 0),
                      ),
                      status: rfq.status === "new" ? "quoted" : undefined,
                    })
                  }
                  className="rounded-lg border border-cream-300 px-3 py-1 text-xs font-medium text-ink-700 transition-colors hover:border-brand-300 hover:text-accent disabled:opacity-50"
                >
                  {saving === rfq.code ? "Saving…" : "Save quote"}
                </button>
              </label>

              <span className="mx-1 hidden h-5 w-px bg-cream-300 sm:block" />

              {(
                [
                  "reviewed",
                  "quoted",
                  "accepted",
                  "declined",
                ] as RfqRecord["status"][]
              ).map((status) => (
                <button
                  key={status}
                  type="button"
                  disabled={saving === rfq.code || rfq.status === status}
                  onClick={() => void patch(rfq.code, { status })}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    rfq.status === status
                      ? "bg-brand-700 text-white"
                      : "bg-cream-100 text-ink-500 hover:bg-cream-200 disabled:opacity-60"
                  }`}
                >
                  {saving === rfq.code && rfq.status !== status
                    ? "Updating…"
                    : rfqStatusLabels[status]}
                </button>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ============ Messages ============ */
const kindLabels: Record<MessageRecord["kind"], string> = {
  contact: "Contact",
  wholesale: "Wholesale request",
  giftcard: "Gift card",
    rfq: "Quote request (RFQ)",
};

function MessagesTab({
  messages,
  onChanged,
}: {
  messages: MessageRecord[];
  onChanged: () => void;
}) {
  const [saving, setSaving] = useState("");
  const [error, setError] = useState("");

  async function markRead(id: string) {
    setSaving(id);
    setError("");
    try {
      await apiPatch("/api/messages", { id });
      onChanged();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setSaving("");
    }
  }

  async function markAll() {
    setSaving("all");
    setError("");
    try {
      await apiPatch("/api/messages", { all: true });
      onChanged();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setSaving("");
    }
  }

  if (messages.length === 0) {
    return (
      <div className="card p-10 text-center">
        <MailIcon className="mx-auto h-12 w-12 text-ink-300" />
        <p className="font-display mt-4 text-lg text-ink-900">
          No messages yet
        </p>
        <p className="mt-2 text-sm text-ink-500">
          Messages from contact, wholesale and gift card forms will appear here.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        {error ? (
          <p className="rounded-lg bg-danger-100 px-3 py-2 text-sm text-danger-600">
            {error}
          </p>
        ) : (
          <span />
        )}
        {messages.some((m) => m.status === "new") ? (
          <button
            type="button"
            disabled={saving === "all"}
            onClick={() => markAll()}
            className="btn-outline px-4 py-2 text-xs"
          >
            {saving === "all" ? "Updating…" : "Mark all as read"}
          </button>
        ) : null}
      </div>
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
                    New
                  </span>
                ) : (
                  <span className="badge bg-ink-100 text-ink-600">
                    Read
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-ink-400">
                  {new Date(message.createdAt).toLocaleString("en-TZ")}
                </span>
                {message.status === "new" ? (
                  <button
                    type="button"
                    disabled={saving === message.id}
                    onClick={() => markRead(message.id)}
                    className="btn-outline px-3 py-1.5 text-xs"
                  >
                    {saving === message.id ? "Updating…" : "Mark as read"}
                  </button>
                ) : null}
              </div>
            </div>

            <div className="mt-3 grid gap-2 text-sm sm:grid-cols-3">
              {message.phone ? (
                <div>
                  <p className="text-ink-400">Phone</p>
                  <p className="font-medium text-ink-900">
                    {formatPhone(message.phone)}
                  </p>
                </div>
              ) : null}
              {message.email ? (
                <div>
                  <p className="text-ink-400">Email</p>
                  <p className="font-medium text-ink-900">{message.email}</p>
                </div>
              ) : null}
              <div>
                <p className="text-ink-400">Type</p>
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
    </>
  );
}

/* ============ Reviews (moderation) ============ */
const reviewStatusLabels: Record<ReviewRecord["status"], string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Declined",
};

function ReviewsTab({
  reviews,
  onChanged,
}: {
  reviews: ReviewRecord[];
  onChanged: () => void;
}) {
  const [saving, setSaving] = useState("");
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | ReviewRecord["status"]>("all");

  const filtered = reviews.filter((r) =>
    filter === "all" ? true : r.status === filter,
  );

  async function setStatus(id: string, status: "approved" | "rejected") {
    setSaving(id);
    setError("");
    try {
      await apiPatch(`/api/reviews/${id}`, { status });
      onChanged();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving("");
    }
  }

  if (reviews.length === 0) {
    return (
      <div className="card p-10 text-center">
        <StarIcon className="mx-auto h-12 w-12 text-ink-300" />
        <p className="font-display mt-4 text-lg text-ink-900">
          No reviews yet
        </p>
        <p className="mt-2 text-sm text-ink-500">
          New customer reviews will appear here for approval.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-ink-700">Filter:</span>
        {(["all", "pending", "approved", "rejected"] as const).map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => setFilter(id)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              filter === id
                ? "bg-brand-700 text-white"
                : "bg-cream-100 text-ink-500 hover:bg-cream-200"
            }`}
          >
            {id === "all"
              ? "All"
              : reviewStatusLabels[id as ReviewRecord["status"]]}
          </button>
        ))}
      </div>

      {error ? (
        <p className="mt-4 rounded-lg bg-danger-100 px-3 py-2 text-sm text-danger-600">
          {error}
        </p>
      ) : null}

      <ul className="mt-6 space-y-3">
        {filtered.map((review) => (
          <li key={review.id} className="card p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-display text-lg text-ink-900">
                  {review.customerName}
                </span>
                <span className="badge bg-brand-100 text-accent">
                  {"★".repeat(review.rating)}
                  {"☆".repeat(5 - review.rating)}
                </span>
                <span
                  className={`badge ${
                    review.status === "approved"
                      ? "bg-success-100 text-success-600"
                      : review.status === "pending"
                        ? "bg-warning-100 text-warning-600"
                        : "bg-cream-100 text-ink-500"
                  }`}
                >
                  {reviewStatusLabels[review.status]}
                </span>
              </div>
              <span className="text-xs text-ink-400">
                {review.createdAt
                  ? new Date(review.createdAt).toLocaleString("en-TZ")
                  : "—"}
              </span>
            </div>

            <p className="mt-3 text-sm text-ink-700">{review.comment}</p>

            <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-cream-200 pt-3 text-xs text-ink-500">
              <span>Product: {review.productSlug || "—"}</span>
              <span>City: {review.location || "—"}</span>
            </div>

            {review.status === "pending" ? (
              <div className="mt-3 flex flex-wrap gap-2 border-t border-cream-200 pt-3">
                <button
                  type="button"
                  disabled={saving === review.id}
                  onClick={() => void setStatus(review.id, "approved")}
                  className="rounded-full bg-success-100 px-3 py-1 text-xs font-medium text-success-600 transition-colors hover:bg-success-200 disabled:opacity-60"
                >
                  {saving === review.id ? "Saving…" : "Approve"}
                </button>
                <button
                  type="button"
                  disabled={saving === review.id}
                  onClick={() => void setStatus(review.id, "rejected")}
                  className="rounded-full bg-danger-100 px-3 py-1 text-xs font-medium text-danger-600 transition-colors hover:bg-danger-200 disabled:opacity-60"
                >
                  Reject
                </button>
              </div>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ============ Promo ============ */
function PromoTab({
  promos,
  onChanged,
}: {
  promos: PromoRecord[];
  onChanged: () => void;
}) {
  const [code, setCode] = useState("");
  const [label, setLabel] = useState("");
  const [percentOff, setPercentOff] = useState("");
  const [freeShipping, setFreeShipping] = useState(false);
  const [minSubtotal, setMinSubtotal] = useState("");
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState("");
  const [error, setError] = useState("");

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    setError("");
    try {
      await apiPost("/api/promos", {
        code,
        label,
        percentOff: percentOff ? Number(percentOff) : undefined,
        freeShipping,
        minSubtotalTsh: minSubtotal ? Number(minSubtotal) : undefined,
      });
      setCode("");
      setLabel("");
      setPercentOff("");
      setFreeShipping(false);
      setMinSubtotal("");
      onChanged();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function toggle(c: string, active: boolean) {
    setToggling(c);
    setError("");
    try {
      await apiPatch(`/api/promos/${encodeURIComponent(c)}`, { active });
      onChanged();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setToggling("");
    }
  }

  return (
    <div>
      <form onSubmit={create} className="card space-y-4 p-6">
        <h2 className="font-display text-xl text-ink-900">
          Add discount code
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-ink-700">
              Code *
            </span>
            <input
              required
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className={field}
              placeholder="MFANO10"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-ink-700">
              Description *
            </span>
            <input
              required
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className={field}
              placeholder="10% discount"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-ink-700">
              Discount percentage
            </span>
            <input
              type="number"
              min={1}
              max={100}
              value={percentOff}
              onChange={(e) => setPercentOff(e.target.value)}
              className={field}
              placeholder="10"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-ink-700">
              Minimum subtotal (TSh)
            </span>
            <input
              type="number"
              min={0}
              value={minSubtotal}
              onChange={(e) => setMinSubtotal(e.target.value)}
              className={field}
              placeholder="40000"
            />
          </label>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={freeShipping}
            onChange={(e) => setFreeShipping(e.target.checked)}
            className="accent-brand-700"
          />
          Free delivery
        </label>
        {error ? (
          <p className="rounded-lg bg-danger-100 px-3 py-2 text-sm text-danger-600">
            {error}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={saving}
          className="btn-primary disabled:opacity-60"
        >
          {saving ? "Saving…" : "Add code"}
        </button>
      </form>

      <section className="mt-8">
        <h2 className="font-display text-xl text-ink-900">All codes</h2>
        {promos.length === 0 ? (
          <p className="mt-3 text-sm text-ink-500">
            No codes yet. Add the first one above.
          </p>
        ) : (
          <ul className="mt-4 space-y-2">
            {promos.map((promo) => (
              <li
                key={promo.code}
                className="card flex flex-wrap items-center gap-3 p-4"
              >
                <span className="font-mono text-base font-semibold text-accent">
                  {promo.code}
                </span>
                <span className="text-sm text-ink-700">{promo.label}</span>
                {promo.percentOff ? (
                  <span className="badge bg-brand-100 text-accent">
                    {promo.percentOff}%
                  </span>
                ) : null}
                {promo.freeShipping ? (
                  <span className="badge bg-success-100 text-success-600">
                    Free delivery
                  </span>
                ) : null}
                {promo.minSubtotalTsh ? (
                  <span className="badge bg-cream-100 text-ink-500">
                    min {formatTsh(promo.minSubtotalTsh)}
                  </span>
                ) : null}
                <span
                  className={`badge ${
                    promo.active
                      ? "bg-success-100 text-success-600"
                      : "bg-cream-100 text-ink-400"
                  }`}
                >
                  {promo.active ? "Active" : "Inactive"}
                </span>
                <button
                  type="button"
                  disabled={toggling === promo.code}
                  onClick={() => void toggle(promo.code, !promo.active)}
                  className="btn-outline ml-auto px-3 py-1 text-xs disabled:opacity-60"
                >
                  {toggling === promo.code
                    ? "Updating…"
                    : promo.active
                      ? "Disable"
                      : "Enable"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

/* ============ Updates (notifications + jarida + kadi) ============ */
function UpdatesTab({
  notifications,
  subscribers,
  giftCards,
  onChanged,
}: {
  notifications: NotificationRecord[];
  subscribers: SubscriberRecord[];
  giftCards: GiftCardRecord[];
  onChanged: () => void;
}) {
  const [saving, setSaving] = useState("");

  async function markRead(id: string) {
    setSaving(id);
    try {
      await apiPatch("/api/notifications", { id });
      onChanged();
    } catch {
      /* tp */
    } finally {
      setSaving("");
    }
  }

  return (
    <div className="space-y-10">
      {/* Arifa */}
      <section>
        <h2 className="font-display text-xl text-ink-900">
          Recent notifications
        </h2>
        {notifications.length === 0 ? (
          <p className="mt-3 text-sm text-ink-500">
            No notifications yet. New orders, reviews, and requests will appear here.
          </p>
        ) : (
          <ul className="mt-4 space-y-2">
            {notifications.slice(0, 30).map((n) => (
              <li
                key={n.id}
                className={`card flex flex-wrap items-center gap-3 p-4 ${
                  n.status === "new" ? "border-brand-200 bg-brand-50" : ""
                }`}
              >
                <span
                  className={`badge ${
                    n.status === "new"
                      ? "bg-brand-100 text-accent"
                      : "bg-cream-100 text-ink-400"
                  }`}
                >
                  {({ oda: "Order", hakiki: "Review", rfq: "Quote request", malipo: "Payment", status: "Order update", info: "Update" } as Record<string, string>)[n.kind] ?? n.kind}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-medium text-ink-900">
                    {n.title}
                  </span>
                  {n.body ? (
                    <span className="block truncate text-sm text-ink-500">
                      {n.body}
                    </span>
                  ) : null}
                </span>
                <span className="text-xs text-ink-400">
                  {new Date(n.createdAt).toLocaleString("en-TZ")}
                </span>
                {n.status === "new" ? (
                  <button
                    type="button"
                    disabled={saving === n.id}
                    onClick={() => void markRead(n.id)}
                    className="btn-outline px-3 py-1 text-xs disabled:opacity-60"
                  >
                    {saving === n.id ? "…" : "Mark as read"}
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Jarida */}
      <section>
        <h2 className="font-display text-xl text-ink-900">
          Newsletter subscribers ({subscribers.length})
        </h2>
        {subscribers.length === 0 ? (
          <p className="mt-3 text-sm text-ink-500">
            No newsletter subscribers yet.
          </p>
        ) : (
          <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {subscribers.map((s) => (
              <li
                key={s.email}
                className="card flex items-center justify-between p-3 text-sm"
              >
                <span className="truncate text-ink-700">{s.email}</span>
                <span className="ml-2 shrink-0 text-xs text-ink-400">
                  {new Date(s.createdAt).toLocaleDateString("en-TZ")}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Gift cards */}
      <section>
        <h2 className="font-display text-xl text-ink-900">
          Gift cards ({giftCards.length})
        </h2>
        {giftCards.length === 0 ? (
          <p className="mt-3 text-sm text-ink-500">
            No gift cards yet. Cards issued from /zawadi will appear here.
          </p>
        ) : (
          <ul className="mt-4 space-y-2">
            {giftCards.map((gc) => (
              <li
                key={gc.code}
                className="card flex flex-wrap items-center gap-3 p-4 text-sm"
              >
                <span className="font-mono font-semibold text-accent">
                  {gc.code}
                </span>
                <span className="font-medium text-ink-900">
                  {formatTsh(gc.amountTsh)}
                </span>
                {gc.recipient ? (
                  <span className="text-ink-500">→ {gc.recipient}</span>
                ) : null}
                <span
                  className={`badge ${
                    gc.status === "issued"
                      ? "bg-success-100 text-success-600"
                      : gc.status === "redeemed"
                        ? "bg-cream-100 text-ink-500"
                        : "bg-warning-100 text-warning-600"
                  }`}
                >
                  {gc.status === "issued"
                    ? "Issued"
                    : gc.status === "redeemed"
                      ? "Redeemed"
                      : "Out of stock"}
                </span>
                <span className="ml-auto text-xs text-ink-400">
                  {gc.expiresAt
                    ? `Expires: ${new Date(gc.expiresAt).toLocaleDateString("en-TZ")}`
                    : `Issued: ${new Date(gc.createdAt).toLocaleDateString("en-TZ")}`}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
