import { describe, it, expect } from "vitest";
import {
  formatTsh,
  discountPercent,
  makeOrderCode,
  formatPhone,
  readStorage,
  writeStorage,
} from "@/lib/format";

describe("formatTsh", () => {
  it("huweka prefix ya TSh na koma", () => {
    expect(formatTsh(32000)).toBe("TSh 32,000");
    expect(formatTsh(0)).toBe("TSh 0");
    expect(formatTsh(1500000)).toBe("TSh 1,500,000");
  });
});

describe("discountPercent", () => {
  it("hurejesha asilimia ya punguzo", () => {
    expect(discountPercent(8000, 10000)).toBe(20);
    expect(discountPercent(32000, 40000)).toBe(20);
  });
  it("hurejesha null pale hakuna compare-at au bei ni kubwa", () => {
    expect(discountPercent(10000)).toBeNull();
    expect(discountPercent(10000, 10000)).toBeNull();
    expect(discountPercent(12000, 10000)).toBeNull();
  });
});

describe("makeOrderCode", () => {
  it("huunda nambari ya muundo NCF-XXXX", () => {
    const code = makeOrderCode();
    expect(code).toMatch(/^NCF-[A-Z0-9]{4}$/);
  });
  it("huunda nambari tofauti kwa kila wito (statistically)", () => {
    const codes = new Set(Array.from({ length: 50 }, () => makeOrderCode()));
    expect(codes.size).toBeGreaterThan(1);
  });
});

describe("formatPhone", () => {
  it("hufomati nambari ya simu ya Tanzania", () => {
    expect(formatPhone("0754000000")).toBe("0754 000 000");
    expect(formatPhone("255754000000")).toBe("0754 000 000");
  });
  it("hurudisha asili kama si nambari ya urafiki", () => {
    expect(formatPhone("123")).toBe("123");
  });
});

describe("readStorage / writeStorage", () => {
  it("hurudisha fallback kwenye server (hakuna window)", () => {
    // Katika environment ya node hakuna window.
    expect(readStorage("key", "fallback")).toBe("fallback");
    // writeStorage haipaswi kuth throw kwenye server.
    expect(() => writeStorage("key", { a: 1 })).not.toThrow();
  });
});
