import test, { after, before } from "node:test";
import assert from "node:assert/strict";
import express from "express";
import { once } from "node:events";

import { createUpload } from "./multer.js";
import { errorHandler } from "../lib/http.js";

/**
 * The upload limits, observed over real multipart requests.
 *
 * A limit is only real if the parser enforces it while streaming, so this
 * boots a tiny app around `createUpload` and sends oversized parts.
 */

const HOST = "127.0.0.1";
let server;
let baseUrl;
let upload;

before(async () => {
  upload = createUpload({ maxFileSize: 1024, maxFiles: 1 });

  const app = express();
  app.post("/single", upload.single("design"), (req, res) => {
    res.json({ size: req.file.size });
  });
  app.post("/fields", upload.fields([{ name: "image1", maxCount: 1 }]), (req, res) => {
    res.json({ size: req.files.image1[0].size });
  });
  app.use(errorHandler);

  server = app.listen(0, HOST);
  await once(server, "listening");
  baseUrl = `http://${HOST}:${server.address().port}`;
});

after(() => {
  if (server?.listening) {
    server.closeAllConnections();
    server.close();
  }
});

/** Send one multipart request with a single file part of `bytes` bytes. */
const send = async (path, field, bytes) => {
  const form = new FormData();
  form.append(field, new Blob([new Uint8Array(bytes)], { type: "image/webp" }), "x.webp");

  const response = await fetch(new URL(path, baseUrl), {
    method: "POST",
    body: form,
  });
  const text = await response.text();

  return {
    status: response.status,
    body: text ? JSON.parse(text) : undefined,
  };
};

test("a part at the limit is accepted", async () => {
  const response = await send("/single", "design", 1024);
  assert.equal(response.status, 200);
  assert.equal(response.body.size, 1024);
});

test("an oversized part is a 400, not a 500", async () => {
  const response = await send("/single", "design", 4096);
  assert.equal(response.status, 400);
  assert.equal(response.body.success, false);
  assert.equal(response.body.message, "That upload is too large");
});

test("the same limit applies to named image fields", async () => {
  const ok = await send("/fields", "image1", 1024);
  assert.equal(ok.status, 200);

  const tooBig = await send("/fields", "image1", 4096);
  assert.equal(tooBig.status, 400);
  assert.equal(tooBig.body.success, false);
});
