import test from "node:test";
import assert from "node:assert/strict";
import {
  addCartLine,
  cartLineId,
  cartLines,
  setCartLineQuantity,
} from "./cart.js";

const design = "https://res.cloudinary.com/forever/design.webp";

test("a Cart line is identified by its product, size and design", () => {
  assert.equal(cartLineId({ productId: "tee", size: "M" }), "tee::M");
  assert.equal(
    cartLineId({ productId: "tee", size: "M", design }),
    `tee::M::${design}`
  );
  assert.notEqual(
    cartLineId({ productId: "tee", size: "M", design }),
    cartLineId({ productId: "tee", size: "M", design: `${design}?v=2` })
  );
});

test("adds a Custom Tee line that carries the base product and the design", () => {
  assert.deepEqual(
    addCartLine([], { productId: "tee", size: "M", design }),
    [{ productId: "tee", size: "M", quantity: 1, design }]
  );
});

test("merges the same product and size only when the design matches", () => {
  const lines = addCartLine([], { productId: "tee", size: "M", design });
  const merged = addCartLine(lines, { productId: "tee", size: "M", design });
  assert.equal(merged.length, 1);
  assert.equal(merged[0].quantity, 2);

  const second = addCartLine(lines, {
    productId: "tee",
    size: "M",
    design: `${design}?v=2`,
  });
  assert.equal(second.length, 2);
  assert.equal(second[1].design, `${design}?v=2`);
});

test("a plain product line is not merged with a Custom Tee line", () => {
  const lines = addCartLine([], { productId: "tee", size: "M" });
  assert.equal(
    addCartLine(lines, { productId: "tee", size: "M", design }).length,
    2
  );
});

test("sets and removes a line by its identity, design included", () => {
  const lines = [
    { productId: "tee", size: "M", quantity: 1, design },
    { productId: "tee", size: "M", quantity: 1, design: `${design}?v=2` },
  ];

  const updated = setCartLineQuantity(lines, cartLineId(lines[1]), 3);
  assert.equal(updated[0].quantity, 1);
  assert.equal(updated[1].quantity, 3);

  const removed = setCartLineQuantity(updated, cartLineId(lines[0]), 0);
  assert.deepEqual(removed, [{ productId: "tee", size: "M", quantity: 3, design: `${design}?v=2` }]);
});

test("reads a saved line array, keeping each design", () => {
  assert.deepEqual(
    cartLines([
      { productId: "tee", size: "M", quantity: 2, design },
      { productId: "hoodie", size: "L", quantity: 1 },
    ]),
    [
      { productId: "tee", size: "M", quantity: 2, design },
      { productId: "hoodie", size: "L", quantity: 1 },
    ]
  );
});

test("reads the legacy saved object so older carts still load", () => {
  assert.deepEqual(cartLines({ tee: { M: 2 }, hoodie: { L: 1 } }), [
    { productId: "tee", size: "M", quantity: 2 },
    { productId: "hoodie", size: "L", quantity: 1 },
  ]);
});

test("drops emptied and malformed saved lines", () => {
  assert.deepEqual(
    cartLines([
      { productId: "tee", size: "M", quantity: 0 },
      { productId: "tee", size: "L", quantity: 1 },
      { size: "M", quantity: 1 },
      null,
    ]),
    [{ productId: "tee", size: "L", quantity: 1 }]
  );
  assert.deepEqual(cartLines(undefined), []);
  assert.deepEqual(cartLines({ tee: { M: 0, L: 2 } }), [
    { productId: "tee", size: "L", quantity: 2 },
  ]);
});
