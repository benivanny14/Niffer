import { describe, it, expect } from "vitest";
import {
  liveStatus,
  statusEvents,
  statusSteps,
  demoOrders,
  DEMO_STEP_MS,
  type Order,
} from "@/lib/orders";

const baseOrder: Order = {
  code: "NCF-TEST",
  createdAt: new Date("2026-01-01T10:00:00Z").toISOString(),
  status: "imapokelewa",
  customer: {
    name: "Mtumiaji",
    phone: "0754000000",
    region: "Dar es Salaam",
    address: "Mtaa",
  },
  payment: "mpesa",
  lines: [{ slug: "purest-glow-pack-65k", qty: 1 }],
  subtotalTsh: 65000,
  shippingTsh: 0,
  totalTsh: 65000,
};

describe("statusSteps", () => {
  it("ina hatua nne kwa mpangilio sahihi", () => {
    expect(statusSteps.map((s) => s.id)).toEqual([
      "imapokelewa",
      "inaendelea",
      "imetumwa",
      "imefika",
    ]);
  });
});

describe("liveStatus", () => {
  it("odha halisi (si demo) hurudisha status iliyowekwa", () => {
    expect(liveStatus({ ...baseOrder, status: "imetumwa" })).toBe("imetumwa");
    expect(liveStatus(baseOrder)).toBe("imapokelewa");
  });

  it("oda ya demo inasonga kwa muda", () => {
    const demo: Order = { ...baseOrder, demo: true };
    const t0 = Date.parse(demo.createdAt);
    expect(liveStatus(demo, t0)).toBe("imapokelewa");
    expect(liveStatus(demo, t0 + DEMO_STEP_MS)).toBe("inaendelea");
    expect(liveStatus(demo, t0 + 2 * DEMO_STEP_MS)).toBe("imetumwa");
    expect(liveStatus(demo, t0 + 3 * DEMO_STEP_MS)).toBe("imefika");
  });
});

describe("statusEvents", () => {
  it("oda halisi hutumia history (au null)", () => {
    const events = statusEvents({
      ...baseOrder,
      history: [
        { status: "imapokelewa", at: "2026-01-01T10:00:00Z" },
        { status: "inaendelea", at: "2026-01-01T11:00:00Z" },
      ],
    });
    expect(events).toHaveLength(statusSteps.length);
    expect(events[0].at).not.toBeNull();
    expect(events[2].at).toBeNull();
  });

  it("oda ya demo ina muda yote (hata ya baadaye)", () => {
    const events = statusEvents({ ...baseOrder, demo: true });
    expect(events).toHaveLength(statusSteps.length);
    expect(events.every((e) => e.at !== null)).toBe(true);
  });
});

describe("demoOrders", () => {
  it("huunda oda za demo zenye nambari za kipekee", () => {
    const orders = demoOrders();
    expect(orders.length).toBeGreaterThan(0);
    const codes = orders.map((o) => o.code);
    expect(new Set(codes).size).toBe(codes.length);
    expect(orders.every((o) => o.demo === true)).toBe(true);
  });
});
