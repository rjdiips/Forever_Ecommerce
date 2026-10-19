import test from "node:test";
import assert from "node:assert/strict";
import { DELIVERY_FEE } from "@forever/shared";
import { priceOrder } from "./orderPricing.js";
import { HttpError } from "./http.js";

// Plain Product objects: no MongoDB, no Stripe. These are the catalogue entries
// the intake would load, with prices in major units exactly as stored.
const tee = {
  _id: "tee-1",
  name: "Custom Tee",
  price: 19.99,
  image: ["tee.png"],
  sizes: ["S", "M", "L"],
  kind: "custom-tee",
};

const hoodie = {
  _id: "hoodie-1",
  name: "Hoodie",
  price: 49.5,
  image: ["hoodie.png"],
  sizes: ["M", "L"],
};

const products = [tee, hoodie];

const isClientError = (err) => err instanceof HttpError && err.status === 400;

test("prices every line from the catalogue and adds the shared delivery fee", () => {
  const priced = priceOrder(
    [
      { productId: "tee-1", size: "M", quantity: 2 },
      { productId: "hoodie-1", size: "L", quantity: 1 },
    ],
    products
  );

  assert.deepEqual(priced.items, [
    {
      productId: "tee-1",
      name: "Custom Tee",
      image: ["tee.png"],
      price: 1999,
      size: "M",
      quantity: 2,
    },
    {
      productId: "hoodie-1",
      name: "Hoodie",
      image: ["hoodie.png"],
      price: 4950,
      size: "L",
      quantity: 1,
    },
  ]);
  assert.equal(priced.subtotal, 8948);
  assert.equal(priced.deliveryFee, DELIVERY_FEE);
  assert.equal(priced.amount, 9948);
});

test("ignores a client-sent amount or price", () => {
  const priced = priceOrder(
    [
      {
        productId: "tee-1",
        size: "M",
        quantity: 1,
        price: 1,
        amount: 1,
        total: 1,
      },
    ],
    products
  );

  assert.equal(priced.items[0].price, 1999);
  assert.equal(priced.amount, 2999);
});

test("uses the delivery fee it is given", () => {
  const priced = priceOrder(
    [{ productId: "tee-1", size: "M", quantity: 1 }],
    products,
    500
  );

  assert.equal(priced.deliveryFee, 500);
  assert.equal(priced.amount, 2499);
});

test("rejects an empty cart", () => {
  for (const items of [[], undefined, null]) {
    assert.throws(() => priceOrder(items, products), isClientError);
  }
});

test("rejects an unknown product", () => {
  assert.throws(
    () => priceOrder([{ productId: "gone", size: "M", quantity: 1 }], products),
    isClientError
  );
});

test("rejects a size the product does not offer", () => {
  assert.throws(
    () => priceOrder([{ productId: "tee-1", size: "XL", quantity: 1 }], products),
    (err) => isClientError(err) && /size/i.test(err.message)
  );
});

test("rejects a quantity that is not a whole number of at least one", () => {
  for (const quantity of [0, -1, 1.5, "2", Number.NaN]) {
    assert.throws(
      () => priceOrder([{ productId: "tee-1", size: "M", quantity }], products),
      isClientError
    );
  }
});

test("carries a design on the custom-tee base", () => {
  const design = "https://res.cloudinary.com/forever/design.webp";
  const priced = priceOrder(
    [{ productId: "tee-1", size: "M", quantity: 1, design }],
    products
  );

  assert.equal(priced.items[0].design, design);
});

test("rejects a design on an ordinary product", () => {
  assert.throws(
    () =>
      priceOrder(
        [
          {
            productId: "hoodie-1",
            size: "M",
            quantity: 1,
            design: "https://res.cloudinary.com/forever/design.webp",
          },
        ],
        products
      ),
    isClientError
  );
});

test("rejects a design that is not an uploaded image URL", () => {
  for (const design of [
    "",
    "   ",
    42,
    null,
    "not-a-url",
    "javascript:alert(1)",
    "data:image/webp;base64,AAAA",
  ]) {
    assert.throws(
      () =>
        priceOrder(
          [{ productId: "tee-1", size: "M", quantity: 1, design }],
          products
        ),
      isClientError
    );
  }
});

test("accepts a Cloudinary https design URL", () => {
  const design = "https://res.cloudinary.com/forever/image/upload/design.webp";
  const priced = priceOrder(
    [{ productId: "tee-1", size: "M", quantity: 1, design }],
    products
  );

  assert.equal(priced.items[0].design, design);
});
