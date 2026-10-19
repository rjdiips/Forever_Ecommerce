import test from "node:test";
import assert from "node:assert/strict";
import { route, HttpError, errorHandler } from "./http.js";

const makeRes = () => ({
  statusCode: null,
  body: null,
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(body) {
    this.body = body;
    return this;
  },
});

test("route runs the handler and sends a success envelope with the data", async () => {
  const res = makeRes();
  const req = { id: "req-1" };

  await route(async () => ({ products: [1, 2] }))(req, res, (err) => {
    throw err;
  });

  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, { success: true, data: { products: [1, 2] } });
});

test("route lets the route declare its status and message", async () => {
  const res = makeRes();

  await route(async () => ({ cartData: {} }), {
    status: 201,
    message: "Item added",
  })({}, res, (err) => {
    throw err;
  });

  assert.equal(res.statusCode, 201);
  assert.deepEqual(res.body, {
    success: true,
    message: "Item added",
    data: { cartData: {} },
  });
});

test("route omits data when the handler returns nothing", async () => {
  const res = makeRes();

  await route(async () => undefined, { message: "Done" })({}, res, (err) => {
    throw err;
  });

  assert.deepEqual(res.body, { success: true, message: "Done" });
});

test("route forwards a thrown error to next without responding", async () => {
  const res = makeRes();
  const boom = new Error("boom");
  let forwarded;

  await route(async () => {
    throw boom;
  })({}, res, (err) => {
    forwarded = err;
  });

  assert.equal(forwarded, boom);
  assert.equal(res.body, null);
});

test("route forwards a rejected promise to next", async () => {
  const res = makeRes();
  const boom = new Error("boom");
  let forwarded;

  await route(() => Promise.reject(boom))({}, res, (err) => {
    forwarded = err;
  });

  assert.equal(forwarded, boom);
});

test("HttpError carries a status and a message and is a real Error", () => {
  const err = new HttpError(404, "Product not found");
  assert.ok(err instanceof Error);
  assert.equal(err.status, 404);
  assert.equal(err.message, "Product not found");
});

const captureLogs = (fn) => {
  const lines = [];
  const original = console.log;
  console.log = (line) => lines.push(JSON.parse(line));
  try {
    fn();
  } finally {
    console.log = original;
  }
  return lines;
};

test("errorHandler passes a client error's status and message through", () => {
  const res = makeRes();
  const logs = captureLogs(() => {
    errorHandler(new HttpError(401, "Not authorized"), { id: "req-1" }, res, () => {});
  });

  assert.equal(res.statusCode, 401);
  assert.deepEqual(res.body, { success: false, message: "Not authorized" });
  assert.equal(logs.length, 0);
});

test("errorHandler turns a server error into a generic message and logs its stack", () => {
  const res = makeRes();
  const boom = new Error("db exploded");
  const logs = captureLogs(() => {
    errorHandler(boom, { id: "req-9" }, res, () => {});
  });

  assert.equal(res.statusCode, 500);
  assert.deepEqual(res.body, {
    success: false,
    message: "Something went wrong. Please try again later.",
  });
  assert.equal(logs.length, 1);
  assert.equal(logs[0].level, "error");
  assert.equal(logs[0].requestId, "req-9");
  assert.equal(logs[0].error, "db exploded");
  assert.match(logs[0].stack, /db exploded/);
});

test("errorHandler hides the message of a status-carrying server error", () => {
  const res = makeRes();
  const logs = captureLogs(() => {
    errorHandler(new HttpError(503, "upstream down"), { id: "req-2" }, res, () => {});
  });

  assert.equal(res.statusCode, 503);
  assert.deepEqual(res.body, {
    success: false,
    message: "Something went wrong. Please try again later.",
  });
  assert.equal(logs.length, 1);
});

test("errorHandler delegates when the response has already started", () => {
  const res = Object.assign(makeRes(), { headersSent: true });
  const boom = new Error("late failure");
  let forwarded;

  errorHandler(boom, { id: "req-3" }, res, (err) => {
    forwarded = err;
  });

  assert.equal(forwarded, boom);
  assert.equal(res.body, null);
});
