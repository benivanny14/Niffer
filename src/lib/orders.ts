import type { PaymentId } from "@/lib/site";

export type CartLine = {
  slug: string;
  qty: number;
};

export type OrderStatus =
  | "imapokelewa"
  | "inaendelea"
  | "imetumwa"
  | "imefika"
  | "ghairiwa";

export const statusSteps: { id: OrderStatus; label: string }[] = [
  { id: "imapokelewa", label: "Received" },
  { id: "inaendelea", label: "Processing" },
  { id: "imetumwa", label: "Shipped" },
  { id: "imefika", label: "Delivered" },
];

/** Hatua ya kughairiwa — terminal, si sehemu ya mwendo wa kawaida. */
export const cancelledStep = { id: "ghairiwa" as OrderStatus, label: "Cancelled" };

/** Lebo ya hali yoyote ya oda (pamoja na kughairiwa). */
export function statusLabel(status: OrderStatus): string {
  return (
    statusSteps.find((s) => s.id === status)?.label ??
    (status === "ghairiwa" ? cancelledStep.label : status)
  );
}

/** Hatua moja kwa demo — kila hatua baada ya sekunde 45. */
export const DEMO_STEP_MS = 45_000;
const DEMO_CYCLE_MS = DEMO_STEP_MS * statusSteps.length;

export type StatusEvent = { status: OrderStatus; at: string };

export type Order = {
  code: string;
  createdAt: string; // ISO
  status: OrderStatus;
  customer: {
    name: string;
    phone: string;
    region: string;
    /** Mji / wilaya (kutoka tanzaniaCities). */
    city?: string;
    /** Mtaa / kata / eneo la karibu. */
    street?: string;
    address: string;
    note?: string;
    email?: string;
  };
  payment: PaymentId;
  lines: CartLine[];
  subtotalTsh: number;
  shippingTsh: number;
  totalTsh: number;
  /** Msimbo wa punguzo uliotumika (ikiwa kupo). */
  promoCode?: string;
  /** Kiasi cha punguzo (kama lilikuwa na thamani). */
  discountTsh?: number;
  /** Historia ya hatua (kwa oda halisi zilizowekwa). */
  history?: StatusEvent[];
  /** Hali ya malipo kwenye gateway: pending / paid / failed. */
  paymentStatus?: "pending" | "paid" | "failed";
  /** Rejea ya malipo kwenye gateway (AzamPay n.k.). */
  paymentRef?: string;
  /** Mteja aliyeingia alipoweka oda (akaunti). */
  customerId?: string;
  /** Msimbo wa kadi ya zawadi iliyotumika. */
  giftCardCode?: string;
  /** Kiasi kilichopunguzwa na kadi ya zawadi. */
  giftDiscountTsh?: number;
  /** Oda ya majaribio — inasonga "live" kila sekunde 45. */
  demo?: boolean;
};

/**
 * Oda za majaribio — zinarudwa kila dakika 3 (cycle) ili kurasa ya
 * /fuatilia daima ionyeshe hatua zote nne, hata muda wowote.
 */
export function demoOrders(now = Date.now()): Order[] {
  // Anchors: sekunde 8/52/97/141 kabla ya sasa → hatua 0/1/2/3 sasa hivi.
  const seeds: {
    code: string;
    ageSec: number;
    name: string;
    phone: string;
    region: string;
    address: string;
    payment: PaymentId;
    lines: CartLine[];
    subtotal: number;
  }[] = [
    {
      code: "NCF-6T1N",
      ageSec: 8,
      name: "Fatma S.",
      phone: "0754 123 456",
      region: "Tanga",
      address: "Mtaa wa Mwakalinga, Jengo la Tatu",
      payment: "cod",
      lines: [{ slug: "mwanachuo-pack-65k-vaseline", qty: 2 }],
      subtotal: 130000,
    },
    {
      code: "NCF-2X9D",
      ageSec: 52,
      name: "Zainabu H.",
      phone: "0713 987 654",
      region: "Dodoma",
      address: "Kilimani, karibu na Soko la Dodoma",
      payment: "airtel",
      lines: [{ slug: "mwanachuo-pack-45k", qty: 1 }],
      subtotal: 45000,
    },
    {
      code: "NCF-4M7P",
      ageSec: 97,
      name: "Asha K.",
      phone: "0754 000 000",
      region: "Dar es Salaam",
      address: "Mikocheni B, Nyumba ya Namba 14",
      payment: "mixx",
      lines: [{ slug: "purest-glow-pack-65k", qty: 1 }],
      subtotal: 65000,
    },
    {
      code: "NCF-8F3K",
      ageSec: 141,
      name: "Neema M.",
      phone: "0765 555 123",
      region: "Dar es Salaam",
      address: "Masaki, Ukala Street",
      payment: "mpesa",
      lines: [
        { slug: "purest-glow-pack-135k", qty: 1 },
        { slug: "mwanachuo-pack-45k", qty: 1 },
      ],
      subtotal: 180000,
    },
  ];

  return seeds.map((s) => {
    const shipping = s.region === "Dar es Salaam" && s.subtotal < 50000 ? 3000 : 0;
    return {
      code: s.code,
      createdAt: new Date(now - s.ageSec * 1000).toISOString(),
      status: "imapokelewa" as OrderStatus, // ya kweli inatokana na liveStatus()
      customer: {
        name: s.name,
        phone: s.phone,
        region: s.region,
        address: s.address,
      },
      payment: s.payment,
      lines: s.lines,
      subtotalTsh: s.subtotal,
      shippingTsh: shipping,
      totalTsh: s.subtotal + shipping,
      demo: true,
    };
  });
}

/** Hatua ya sasa ya oda — demo inasonga yenyewe; oda halii imewekwa. */
export function liveStatus(order: Order, now = Date.now()): OrderStatus {
  if (!order.demo) return order.status;
  const age = Math.max(now - Date.parse(order.createdAt), 0);
  const idx = Math.min(
    statusSteps.length - 1,
    Math.floor((age % DEMO_CYCLE_MS) / DEMO_STEP_MS),
  );
  return statusSteps[idx].id;
}

/** Muda wa kila hatua — demo: sekunde 45 kwa hatua; halii: kutoka history. */
export function statusEvents(
  order: Order,
): { status: OrderStatus; at: Date | null }[] {
  const created = Date.parse(order.createdAt);
  if (order.demo) {
    return statusSteps.map((s, i) => ({
      status: s.id,
      at: new Date(created + i * DEMO_STEP_MS),
    }));
  }
  const history = order.history ?? [];
  const events = statusSteps.map((s) => {
    const event = history.find((e) => e.status === s.id);
    return { status: s.id, at: event ? new Date(event.at) : null };
  });
  // Kughairiwa — terminal — huongezwa mwisho ikiwa oda imeghairiwa.
  if (
    order.status === "ghairiwa" ||
    history.some((e) => e.status === "ghairiwa")
  ) {
    const event = history.find((e) => e.status === "ghairiwa");
    events.push({
      status: "ghairiwa" as OrderStatus,
      at: event ? new Date(event.at) : null,
    });
  }
  return events;
}
