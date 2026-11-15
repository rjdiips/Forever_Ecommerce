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

test("a design is an https URL on the shop's Cloudinary host", () => {
  for (const design of [
    "https://res.cloudinary.com/forever/image/upload/design.webp",
    "https://res.cloudinary.com/forever/design.png",
  ]) {
    assert.doesNotThrow(() => assertDesignUrl(design));
  }
});

test("a design on any other host is rejected", () => {
  for (const design of [
    // The old rule accepted this one; it lets a shopper point the admin's
    // browser at a host the shop does not control.
    "http://example.com/design.png",
    "https://example.com/design.png",
    "https://attacker.example/design.webp",
    "https://127.0.0.1:8080/design.webp",
    "https://169.254.169.254/latest/meta-data",
    // Right host, wrong scheme.
    "http://res.cloudinary.com/forever/design.png",
  ]) {
    assert.throws(
      () => assertDesignUrl(design),
      (err) => err instanceof HttpError && err.status === 400
    );
  }
});

test("a design must belong to the shop's own cloud when one is configured", () => {
  const previous = process.env.CLOUDINARY_CLOUD_NAME;
  process.env.CLOUDINARY_CLOUD_NAME = "forever";

  try {
    assert.doesNotThrow(() =>
      assertDesignUrl("https://res.cloudinary.com/forever/image/upload/design.webp")
    );
    assert.throws(
      () =>
        assertDesignUrl(
          "https://res.cloudinary.com/someone-else/image/upload/x.webp"
        ),
      (err) => err instanceof HttpError && err.status === 400
    );
  } finally {
    if (previous === undefined) delete process.env.CLOUDINARY_CLOUD_NAME;
    else process.env.CLOUDINARY_CLOUD_NAME = previous;
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
