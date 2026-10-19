import { describe, expect, it } from "vitest";
import {
  count,
  priceOfFromProducts,
  pricedLines,
  subtotal,
  total,
} from "./cartMath";

describe("count", () => {
  it("sums the quantities across the lines", () => {
    expect(
      count([
        { productId: "p1", size: "M", quantity: 2 },
        { productId: "p2", size: "L", quantity: 3 },
      ])
    ).toBe(5);
  });

  it("is zero for an empty cart", () => {
    expect(count([])).toBe(0);
  });
});

describe("priceOfFromProducts", () => {
  const priceOf = priceOfFromProducts([
    { _id: "p1", price: 19.99 },
    { _id: "p2", price: 5 },
  ]);

  it("reads a product's price in integer cents", () => {
    expect(priceOf("p1")).toBe(1999);
    expect(priceOf("p2")).toBe(500);
  });

  it("prices an unknown product at zero", () => {
    expect(priceOf("missing")).toBe(0);
  });
});

describe("pricedLines", () => {
  const priceOf = priceOfFromProducts([{ _id: "p1", price: 19.99 }]);

  it("carries the unit price and the line total in cents", () => {
    expect(
      pricedLines([{ productId: "p1", size: "M", quantity: 2 }], priceOf)
    ).toEqual([
      { productId: "p1", size: "M", quantity: 2, unitPrice: 1999, total: 3998 },
    ]);
  });

  it("keeps the design on a Custom Tee line", () => {
    const design = "https://res.cloudinary.com/forever/design.webp";
    expect(
      pricedLines([{ productId: "p1", size: "M", quantity: 1, design }], priceOf)
    ).toEqual([
      {
        productId: "p1",
        size: "M",
        quantity: 1,
        design,
        unitPrice: 1999,
        total: 1999,
      },
    ]);
  });

  it("prices a line whose product is unknown at zero", () => {
    expect(
      pricedLines([{ productId: "gone", size: "M", quantity: 1 }], priceOf)
    ).toEqual([
      { productId: "gone", size: "M", quantity: 1, unitPrice: 0, total: 0 },
    ]);
  });
});

describe("subtotal", () => {
  it("sums the line totals in cents", () => {
    expect(subtotal([{ total: 3998 }, { total: 500 }])).toBe(4498);
  });

  it("is zero for an empty cart", () => {
    expect(subtotal([])).toBe(0);
  });
});

describe("total", () => {
  it("adds the delivery fee to the subtotal", () => {
    expect(total(3998, 1000)).toBe(4998);
  });

  it("does not charge delivery on an empty cart", () => {
    expect(total(0, 1000)).toBe(0);
  });
});
