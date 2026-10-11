import { describe, it, expect } from "vitest";
import { applyPromo, promoCodes } from "@/lib/promo";

describe("applyPromo", () => {
  it("hukataa msimbo mtupu", () => {
    const r = applyPromo("", 50000);
    expect(r.ok).toBe(false);
  });

  it("hukataa msimbo si sahihi", () => {
    const r = applyPromo("SIPO", 50000);
    expect(r.ok).toBe(false);
  });
});

describe("applyPromo — NIFFER10", () => {
  it("hutoa punguzo la 10% ya jumla ndogo", () => {
    const r = applyPromo("niffer10", 50000);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.freeShipping).toBe(false);
      expect(r.discountTsh(50000, 3000)).toBe(5000);
    }
  });

  it("hukubali msimbo kwa herufi kubwa", () => {
    const r = applyPromo("  NIFFER10  ", 20000);
    expect(r.ok).toBe(true);
  });
});

describe("applyPromo — BURE2026", () => {
  it("hufanya usafirishaji kuwa bure", () => {
    const r = applyPromo("BURE2026", 30000);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.freeShipping).toBe(true);
      // Punguzo ni usafirishaji tu.
      expect(r.discountTsh(30000, 3000)).toBe(3000);
    }
  });
});

describe("applyPromo — KARIBU15", () => {
  it("hukataa chini ya kiwango cha chini", () => {
    const r = applyPromo("KARIBU15", 20000);
    expect(r.ok).toBe(false);
  });

  it("hufanya kazi juu ya kiwango cha chini", () => {
    const r = applyPromo("KARIBU15", 50000);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.discountTsh(50000, 3000)).toBe(7500);
    }
  });
});

describe("promoCodes", () => {
  it("kila msimbo ni wa kipekee na hai", () => {
    const codes = promoCodes.map((p) => p.code);
    expect(new Set(codes).size).toBe(codes.length);
    expect(promoCodes.every((p) => p.active)).toBe(true);
  });
});
