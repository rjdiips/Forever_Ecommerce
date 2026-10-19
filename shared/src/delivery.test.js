import test from "node:test";
import assert from "node:assert/strict";
import { DELIVERY_FEE } from "./delivery.js";

test("prices delivery at ten dollars, held as integer cents", () => {
  assert.equal(DELIVERY_FEE, 1000);
  assert.ok(Number.isInteger(DELIVERY_FEE));
});
