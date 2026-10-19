import test from "node:test";
import assert from "node:assert/strict";
import { CATEGORIES, PRODUCT_KIND, SUB_CATEGORIES } from "@forever/shared";
import ProductModel from "./productModel.js";

const product = (overrides = {}) => ({
  name: "Tee",
  description: "A tee",
  price: 10,
  image: ["blank.png"],
  category: CATEGORIES[0],
  subCategory: SUB_CATEGORIES[0],
  sizes: ["S"],
  date: 1,
  ...overrides,
});

test("a Tee base must name a colour on save", async () => {
  await assert.rejects(
    () =>
      new ProductModel(product({ kind: PRODUCT_KIND.CUSTOM_TEE })).validate(),
    (error) => error.errors.color !== undefined
  );

  await assert.doesNotReject(() =>
    new ProductModel(
      product({ kind: PRODUCT_KIND.CUSTOM_TEE, color: "black" })
    ).validate()
  );
});

test("an ordinary product still needs no colour", async () => {
  await assert.doesNotReject(() => new ProductModel(product()).validate());
});

test("a base saved before colours existed reads back with no colour", () => {
  // Documents written before the colour existed skip validation when read, so
  // the field must not be defaulted for them.
  const legacy = new ProductModel(product({ kind: PRODUCT_KIND.CUSTOM_TEE }));

  assert.equal(legacy.color, undefined);
});
