import { describe, expect, it } from "vitest";
import {
  DEFAULT_PURCHASE_QUANTITY,
  canBuyCustomTee,
  designFileName,
  purchaseQuantity,
} from "./purchase";

describe("designFileName", () => {
  it("names the file after the type the browser encoded", () => {
    expect(designFileName("image/webp")).toBe("custom-tshirt.webp");
    expect(designFileName("image/jpeg")).toBe("custom-tshirt.jpg");
    expect(designFileName("image/png")).toBe("custom-tshirt.png");
  });
});

describe("purchaseQuantity", () => {
  it("keeps a whole number of at least one", () => {
    expect(purchaseQuantity(3)).toBe(3);
    expect(purchaseQuantity("2")).toBe(2);
  });

  it("falls back to the default for anything unusable", () => {
    for (const value of [0, -2, 1.5, "", "abc", null, undefined]) {
      expect(purchaseQuantity(value)).toBe(DEFAULT_PURCHASE_QUANTITY);
    }
  });
});

describe("canBuyCustomTee", () => {
  it("needs both a graphic and a size", () => {
    expect(canBuyCustomTee({ hasGraphic: true, size: "M" })).toBe(true);
    expect(canBuyCustomTee({ hasGraphic: false, size: "M" })).toBe(false);
    expect(canBuyCustomTee({ hasGraphic: true, size: "" })).toBe(false);
  });
});
