import test from "node:test";
import assert from "node:assert/strict";
import {
  DESIGN_TYPES,
  MAX_DESIGN_BYTES,
  assertDesignTarget,
  assertDesignUrl,
  validateDesignUpload,
} from "./design.js";
import { HttpError } from "./http.js";

const file = (overrides = {}) => ({
  mimetype: "image/webp",
  size: 1024,
  ...overrides,
});

test("accepts the image types the editor exports", () => {
  for (const mimetype of ["image/webp", "image/png", "image/jpeg"]) {
    assert.doesNotThrow(() => validateDesignUpload(file({ mimetype })));
  }
  assert.deepEqual(DESIGN_TYPES, ["image/webp", "image/png", "image/jpeg"]);
});

test("rejects a design that is not an image", () => {
  for (const mimetype of ["application/pdf", "image/svg+xml", "text/plain"]) {
    assert.throws(
      () => validateDesignUpload(file({ mimetype })),
      (err) => err instanceof HttpError && err.status === 400
    );
  }
});

test("rejects a design over the size budget", () => {
  assert.throws(
    () => validateDesignUpload(file({ size: MAX_DESIGN_BYTES + 1 })),
    (err) => err instanceof HttpError && err.status === 400
  );
});

test("accepts a design exactly on the size budget", () => {
  assert.doesNotThrow(() =>
    validateDesignUpload(file({ size: MAX_DESIGN_BYTES }))
  );
});

test("rejects a missing file", () => {
  assert.throws(
    () => validateDesignUpload(undefined),
    (err) => err instanceof HttpError && err.status === 400
  );
});

test("a design is only allowed on the custom-tee base", () => {
  assert.doesNotThrow(() =>
    assertDesignTarget({ name: "Custom Tee", kind: "custom-tee" })
  );
});

test("a design is rejected on an ordinary product", () => {
  for (const product of [
    { name: "Hoodie", kind: "standard" },
    { name: "Hoodie" },
    null,
  ]) {
    assert.throws(
      () => assertDesignTarget(product),
      (err) => err instanceof HttpError && err.status === 400
    );
  }
});

test("a design is a stored http(s) image URL", () => {
  for (const design of [
    "https://res.cloudinary.com/forever/image/upload/design.webp",
    "http://example.com/design.png",
  ]) {
    assert.doesNotThrow(() => assertDesignUrl(design));
  }
});

test("a design that is not an http(s) URL is rejected", () => {
  for (const design of [
    undefined,
    null,
    "",
    "   ",
    42,
    "not-a-url",
    "javascript:alert(1)",
    "data:image/webp;base64,AAAA",
  ]) {
    assert.throws(
      () => assertDesignUrl(design),
      (err) => err instanceof HttpError && err.status === 400
    );
  }
});
