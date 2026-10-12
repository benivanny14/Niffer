import { describe, expect, it } from "vitest";
import {
  bulkSavings,
  bulkTotal,
  bulkUnitPrice,
  bulkTiers,
  tierFor,
} from "./wholesale";

describe("tierFor", () => {
  it("hurudi null chini ya daraja la kwanza", () => {
    expect(tierFor(0)).toBeNull();
    expect(tierFor(9)).toBeNull();
  });

  it("huchagua daraja sahihi", () => {
    expect(tierFor(10)?.discount).toBe(10);
    expect(tierFor(24)?.discount).toBe(10);
    expect(tierFor(25)?.discount).toBe(15);
    expect(tierFor(49)?.discount).toBe(15);
    expect(tierFor(50)?.discount).toBe(22);
    expect(tierFor(500)?.discount).toBe(22);
  });
});

describe("bulkUnitPrice", () => {
  const price = 32_000;

  it("hachezi bei ya rejareja bila wingi", () => {
    expect(bulkUnitPrice(price, 1)).toBe(price);
    expect(bulkUnitPrice(price, 9)).toBe(price);
  });

  it("hupunguza kwa asilimia ya daraja na kuzungushwa kwa 100", () => {
    expect(bulkUnitPrice(price, 10)).toBe(28_800); // -10%
    expect(bulkUnitPrice(price, 30)).toBe(27_200); // -15%, 27_200 → 27_200
    expect(bulkUnitPrice(price, 60)).toBe(25_000); // -22% = 24_960 → 25_000
  });
});

describe("bulkTotal na bulkSavings", () => {
  it("hesabu jumla na akiba kwa usahihi", () => {
    expect(bulkTotal(32_000, 5)).toBe(160_000);
    expect(bulkTotal(32_000, 10)).toBe(288_000);
    expect(bulkSavings(32_000, 10)).toBe(32_000);
    expect(bulkSavings(32_000, 3)).toBe(0);
  });
});

describe("bulkTiers", () => {
  it("mipaka inaenda kwa mpango na hakuna mwitikio", () => {
    expect(bulkTiers.length).toBeGreaterThan(0);
    for (const tier of bulkTiers) {
      expect(tier.discount).toBeGreaterThan(0);
      expect(tier.discount).toBeLessThan(100);
      if (tier.max !== null) expect(tier.max).toBeGreaterThanOrEqual(tier.min);
    }
  });
});
