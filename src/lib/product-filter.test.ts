import { describe, expect, it } from "vitest";
import type { Product } from "@/lib/data/catalog";
import {
  filterCounts,
  filterProducts,
  parsePriceRange,
  sortProducts,
} from "@/lib/product-filter";

function make(overrides: Partial<Product>): Product {
  return {
    id: "p-x",
    slug: "x",
    name: "Products",
    category: "skincare",
    priceTsh: 10000,
    shortDescription: "",
    description: "",
    ingredients: "",
    howToUse: "",
    rating: 4,
    reviewCount: 10,
    stock: 20,
    badges: [],
    image: "/images/products/x.svg",
    imageAlt: "x",
    ...overrides,
  };
}

const items: Product[] = [
  make({
    slug: "serum",
    name: "Radiance Vitamin C Serum",
    priceTsh: 32000,
    rating: 4.8,
    reviewCount: 126,
    badges: ["bestseller", "sale"],
    region: "Dar es Salaam",
    city: "Kinondoni",
  }),
  make({
    slug: "body",
    name: "Body Pack Executive",
    category: "body-care",
    priceTsh: 24500,
    rating: 4.7,
    reviewCount: 89,
    badges: ["new"],
    region: "Dar es Salaam",
    city: "Ilala",
  }),
  make({
    slug: "mist",
    name: "Purest Glow Mini",
    category: "purest-glow",
    priceTsh: 14000,
    rating: 4.5,
    reviewCount: 63,
    badges: ["new"],
    region: "Mwanza",
    city: "Nyamagana",
  }),
  make({
    slug: "lotion",
    name: "Nourishing Body Lotion",
    category: "body-care",
    priceTsh: 15000,
    rating: 4.5,
    reviewCount: 41,
    badges: ["low-stock"],
    stock: 3,
    region: "Arusha",
    city: "Arusha Jiji",
  }),
];

describe("filterProducts", () => {
  it("huchuja kwa kategoria", () => {
    expect(
      filterProducts(items, { category: "body-care" }).map((p) => p.slug),
    ).toEqual(["body", "lotion"]);
  });

  it("huchuja kwa mkoa na mji", () => {
    expect(
      filterProducts(items, { region: "Dar es Salaam" }).map((p) => p.slug),
    ).toEqual(["serum", "body"]);
    expect(
      filterProducts(items, { region: "Dar es Salaam", city: "Ilala" }).map(
        (p) => p.slug,
      ),
    ).toEqual(["body"]);
  });

  it("mji usio ndani ya mkoa haufanyi kazi pekee bila mkoa", () => {
    // Mji mmoja tu ndio unaonekana — hakuna upande wa pili.
    expect(filterProducts(items, { city: "Nyamagana" }).map((p) => p.slug)).toEqual([
      "mist",
    ]);
  });

  it("huchuja kwa kiwango cha bei", () => {
    expect(
      filterProducts(items, { minPrice: 20000, maxPrice: 30000 }).map(
        (p) => p.slug,
      ),
    ).toEqual(["body"]);
  });

  it("huchuja kwa result (mpya / punguzo / inayoisha)", () => {
    expect(filterProducts(items, { feature: "mpya" }).map((p) => p.slug)).toEqual([
      "body",
      "mist",
    ]);
    expect(filterProducts(items, { feature: "punguzo" }).map((p) => p.slug)).toEqual([
      "serum",
    ]);
    expect(
      filterProducts(items, { feature: "inayoisha" }).map((p) => p.slug),
    ).toEqual(["lotion"]);
  });

  it("huchuja kwa utafutaji wa maandishi", () => {
    expect(filterProducts(items, { query: "vitamin" }).map((p) => p.slug)).toEqual([
      "serum",
    ]);
  });

  it("huunganisha vichujio vyote", () => {
    const out = filterProducts(items, {
      region: "Dar es Salaam",
      category: "skincare",
      minPrice: 30000,
    });
    expect(out.map((p) => p.slug)).toEqual(["serum"]);
  });
});

describe("sortProducts", () => {
  it("hupanga kwa bei ndogo na kubwa", () => {
    expect(sortProducts(items, "bei-chini").map((p) => p.slug)).toEqual([
      "mist",
      "lotion",
      "body",
      "serum",
    ]);
    expect(sortProducts(items, "bei-juu")[0].slug).toBe("serum");
  });

  it("hupanga kwa ukadiriaji", () => {
    expect(sortProducts(items, "ukadiriaji")[0].slug).toBe("serum");
  });

  it("maarufu huweka bestseller juu", () => {
    expect(sortProducts(items, "maarufu")[0].slug).toBe("serum");
  });

  it("mpya huweka bidhaa mpya juu", () => {
    const out = sortProducts(items, "mpya");
    expect(out.slice(0, 2).map((p) => p.slug)).toEqual(["body", "mist"]);
  });
});

describe("filterCounts", () => {
  it("hesabu kategoria na mkoa bila kujali kichujio", () => {
    const counts = filterCounts(items, {});
    expect(counts.category["body-care"]).toBe(2);
    expect(counts.region["Dar es Salaam"]).toBe(2);
  });

  it("kiasi cha mkoa huondoa mji usio ndani yake", () => {
    const counts = filterCounts(items, { region: "Arusha" });
    expect(counts.city["Arusha Jiji"]).toBe(1);
    expect(counts.city["Nyamagana"]).toBeUndefined();
  });
});

describe("parsePriceRange", () => {
  it("hutafsiri thamani ya kipande cha bei", () => {
    expect(parsePriceRange("20-40")).toEqual({ min: 20000, max: 40000 });
    expect(parsePriceRange("chini-20")).toEqual({ min: 0, max: 19999 });
    expect(parsePriceRange("juu-40")).toEqual({ min: 40001, max: null });
    expect(parsePriceRange("bogus")).toEqual({ min: null, max: null });
    expect(parsePriceRange(null)).toEqual({ min: null, max: null });
  });
});
