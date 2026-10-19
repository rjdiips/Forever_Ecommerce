import { describe, expect, it } from "vitest";
import {
  addLine,
  count,
  linesFromCartData,
  priceOfFromProducts,
  pricedLines,
  setQuantity,
  subtotal,
  total,
} from "./cartMath";

describe("addLine", () => {
  it("appends a new line for a product and size", () => {
    expect(addLine([], { productId: "p1", size: "M" })).toEqual([
      { productId: "p1", size: "M", quantity: 1 },
    ]);
  });

  it("increments the line with the same product and size", () => {
    const lines = [
      { productId: "p1", size: "M", quantity: 1 },
      { productId: "p1", size: "L", quantity: 1 },
    ];
    expect(addLine(lines, { productId: "p1", size: "M" })).toEqual([
      { productId: "p1", size: "M", quantity: 2 },
      { productId: "p1", size: "L", quantity: 1 },
    ]);
  });

  it("leaves the original lines untouched", () => {
    const lines = [{ productId: "p1", size: "M", quantity: 1 }];
    addLine(lines, { productId: "p1", size: "M" });
    expect(lines).toEqual([{ productId: "p1", size: "M", quantity: 1 }]);
  });
});

describe("setQuantity", () => {
  const lines = [
    { productId: "p1", size: "M", quantity: 1 },
    { productId: "p2", size: "M", quantity: 3 },
  ];

  it("sets the quantity of the matching line", () => {
    expect(setQuantity(lines, "p1::M", 4)).toEqual([
      { productId: "p1", size: "M", quantity: 4 },
      { productId: "p2", size: "M", quantity: 3 },
    ]);
  });

  it("drops the line when the quantity falls to zero", () => {
    expect(setQuantity(lines, "p1::M", 0)).toEqual([
      { productId: "p2", size: "M", quantity: 3 },
    ]);
  });
});

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

describe("linesFromCartData", () => {
  it("turns the saved product/size/quantity shape into lines", () => {
    const saved = { p1: { M: 2, L: 1 }, p2: { S: 4 } };
    expect(linesFromCartData(saved)).toEqual([
      { productId: "p1", size: "M", quantity: 2 },
      { productId: "p1", size: "L", quantity: 1 },
      { productId: "p2", size: "S", quantity: 4 },
    ]);
  });

  it("drops lines that were emptied", () => {
    expect(linesFromCartData({ p1: { M: 0, L: 2 } })).toEqual([
      { productId: "p1", size: "L", quantity: 2 },
    ]);
  });

  it("is empty for no saved cart", () => {
    expect(linesFromCartData(undefined)).toEqual([]);
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
