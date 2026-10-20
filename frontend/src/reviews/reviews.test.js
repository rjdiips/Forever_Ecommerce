import { describe, expect, it } from "vitest";
import { REVIEW_POOL, reviewsFor } from "./reviews";

const sample = [
  "product-1",
  "product-2",
  "product-3",
  "product-4",
  "product-5",
  "product-6",
  "product-7",
  "product-8",
  "product-9",
];

const idsOf = (productId) => reviewsFor(productId).map((review) => review.id);

describe("reviewsFor", () => {
  it("returns three reviews for a product", () => {
    expect(reviewsFor("product-1")).toHaveLength(3);
  });

  it("never repeats a review within one product's three", () => {
    const ids = idsOf("product-1");

    expect(new Set(ids).size).toBe(ids.length);
  });

  it("always returns the same three for the same product", () => {
    expect(reviewsFor("product-1")).toEqual(reviewsFor("product-1"));
    expect(idsOf("product-1")).toEqual(idsOf("product-1"));
  });

  it("returns different sets for different products across a sample", () => {
    const sets = sample.map((id) => idsOf(id).join(","));

    expect(new Set(sets).size).toBe(sample.length);
  });

  it("spreads products across more than ten possible sets", () => {
    // A fixed rotation of the pool would cap the catalogue at ten distinct
    // triples, so the 38-product sample would collide heavily.
    const sets = Array.from({ length: 38 }, (_, index) =>
      idsOf(`product-${index + 1}`).join(",")
    );

    expect(new Set(sets).size).toBeGreaterThan(10);
  });

  it("returns nothing without a product id", () => {
    expect(reviewsFor(undefined)).toEqual([]);
    expect(reviewsFor(null)).toEqual([]);
    expect(reviewsFor("")).toEqual([]);
  });

  it("draws every review from the pool", () => {
    for (const id of sample) {
      for (const review of reviewsFor(id)) {
        expect(REVIEW_POOL).toContain(review);
      }
    }
  });
});
