import test from "node:test";
import assert from "node:assert/strict";
import { log } from "./log.js";

const capture = (fn) => {
  const lines = [];
  const original = console.log;
  console.log = (line) => lines.push(line);
  try {
    fn();
  } finally {
    console.log = original;
  }
  return lines.map((line) => JSON.parse(line));
};

test("writes one JSON line with level, message, time and fields", () => {
  const [line] = capture(() => log.info("hello", { a: 1 }));
  assert.equal(line.level, "info");
  assert.equal(line.msg, "hello");
  assert.equal(line.a, 1);
  assert.ok(!Number.isNaN(Date.parse(line.time)), "time is an ISO timestamp");
});

test("maps each level onto its own line", () => {
  assert.equal(capture(() => log.warn("warned"))[0].level, "warn");
  assert.equal(capture(() => log.error("failed"))[0].level, "error");
});

test("works without fields", () => {
  const [line] = capture(() => log.info("bare"));
  assert.equal(line.msg, "bare");
});
