import test from "node:test";
import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import requestLogger from "./requestLogger.js";

const makeRes = (statusCode) =>
  Object.assign(new EventEmitter(), {
    statusCode,
    headers: {},
    setHeader(name, value) {
      this.headers[name] = value;
    },
  });

const run = ({ headers = {}, status = 200, userId } = {}) => {
  const req = {
    headers,
    method: "GET",
    originalUrl: "/api/product/list",
    userId,
  };
  const res = makeRes(status);
  const lines = [];
  const original = console.log;
  console.log = (line) => lines.push(JSON.parse(line));
  let nextCalled = 0;
  try {
    requestLogger(req, res, () => {
      nextCalled += 1;
    });
    res.emit("finish");
  } finally {
    console.log = original;
  }
  return { req, res, line: lines[0], nextCalled };
};

test("calls next, echoes a generated id, and logs the finished request", () => {
  const { res, line, nextCalled } = run();
  assert.equal(nextCalled, 1);
  assert.ok(line.requestId, "a request id is assigned");
  assert.equal(res.headers["x-request-id"], line.requestId);
  assert.equal(line.method, "GET");
  assert.equal(line.path, "/api/product/list");
  assert.equal(line.status, 200);
  assert.equal(typeof line.durationMs, "number");
});

test("prefers Vercel's x-vercel-id so our line ties to the platform logs", () => {
  const { line } = run({ headers: { "x-vercel-id": "bom1::abc123" } });
  assert.equal(line.requestId, "bom1::abc123");
});

test("maps status onto level: 2xx info, 4xx warn, 5xx error", () => {
  assert.equal(run({ status: 200 }).line.level, "info");
  assert.equal(run({ status: 404 }).line.level, "warn");
  assert.equal(run({ status: 500 }).line.level, "error");
});

test("includes the authenticated user when the route set one", () => {
  assert.equal(run({ userId: "user-1" }).line.userId, "user-1");
});
