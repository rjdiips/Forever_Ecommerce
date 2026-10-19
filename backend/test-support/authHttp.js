/**
 * The auth HTTP test seam.
 *
 * Boots a real Express app around the real user router and the shared error
 * handler on a loopback port. It deliberately does not import `app.js`, because
 * that module connects to MongoDB and Cloudinary; importing the router and the
 * error handler keeps the seam real without opening either connection.
 *
 * Requests travel over real HTTP using Node's built-in `fetch`. Only the User
 * model's database calls are stubbed, per test, through {@link stubUserModel}.
 *
 * Typical use, one server per test file:
 *
 *   import test, { before, after } from "node:test";
 *   import { startAuthServer, stubUserModel } from "./authHttp.js";
 *
 *   let auth;
 *   before(async () => { auth = await startAuthServer(); });
 *   after(() => auth.close());
 *
 *   test("...", async (t) => {
 *     stubUserModel(t, { findOne: async () => null });
 *     const response = await auth.request("/api/user/login", {
 *       method: "POST",
 *       body: { email: "nobody@example.com", password: "wrong" },
 *     });
 *     assert.equal(response.status, 400);
 *   });
 */
import { once } from "node:events";
import express from "express";
import userRouter from "../routes/userRouter.js";
import UserModel from "../models/userModel.js";
import { errorHandler } from "../lib/http.js";

/** Loopback only, so a test can never be reached from outside the machine. */
const HOST = "127.0.0.1";

/**
 * Start the auth app on an ephemeral loopback port.
 *
 * @returns {Promise<{
 *   app: import("express").Express,
 *   server: import("node:http").Server,
 *   baseUrl: string,
 *   request: (path: string, options?: {
 *     method?: string,
 *     body?: unknown,
 *     headers?: Record<string, string>,
 *     ip?: string,
 *   }) => Promise<{
 *     status: number,
 *     headers: Headers,
 *     body: unknown,
 *     text: string,
 *   }>,
 *   close: () => Promise<void>,
 * }>}
 */
export const startAuthServer = async () => {
  const app = express();

  // Match the deployed API: one proxy hop in front, so `req.ip` is the real
  // client and per-IP rate limits are not all collapsed into one bucket.
  app.set("trust proxy", 1);

  app.use(express.json());
  app.use("/api/user", userRouter);

  // One error path, registered last, exactly as in app.js.
  app.use(errorHandler);

  const server = app.listen(0, HOST);
  await once(server, "listening");

  const { port } = server.address();
  const baseUrl = `http://${HOST}:${port}`;

  /**
   * Send a real HTTP request to the auth app.
   *
   * `body` is serialised as JSON. `ip` becomes the client address the app sees:
   * set `x-forwarded-for` and let the one trusted proxy hop resolve it, which
   * also exercises the same trust configuration the deployment uses.
   *
   * @param {string} path
   * @param {{
   *   method?: string,
   *   body?: unknown,
   *   headers?: Record<string, string>,
   *   ip?: string,
   * }} [options]
   */
  const request = async (
    path,
    { method = "GET", body, headers = {}, ip } = {}
  ) => {
    const requestHeaders = new Headers(headers);
    requestHeaders.set("connection", "close");

    let payload;
    if (body !== undefined) {
      requestHeaders.set("content-type", "application/json");
      payload = JSON.stringify(body);
    }

    if (ip) {
      requestHeaders.set("x-forwarded-for", ip);
    }

    const response = await fetch(new URL(path, baseUrl), {
      method,
      headers: requestHeaders,
      body: payload,
    });

    const text = await response.text();
    const isJson = (response.headers.get("content-type") ?? "").includes(
      "application/json"
    );

    return {
      status: response.status,
      headers: response.headers,
      body: isJson && text ? JSON.parse(text) : text,
      text,
    };
  };

  /** Stop the server and drop any keep-alive connections so the process exits. */
  const close = async () => {
    if (!server.listening) return;

    const closed = once(server, "close");
    server.closeAllConnections();
    server.close();
    await closed;
  };

  return { app, server, baseUrl, request, close };
};

/**
 * Stub the User model's database calls for one test.
 *
 * Pass the `node:test` test context as `t`; every stub is restored
 * automatically when that test ends. Only the database boundary is mocked, so
 * the real router, controllers, middleware and error handler all run.
 *
 * Each key names a static model method (`findOne`, `findById`, `create`, …);
 * the special key `save` names the document instance method, since a Mongoose
 * document saves itself rather than the model.
 *
 * @example
 * stubUserModel(t, {
 *   findOne: async ({ email }) => (email === user.email ? user : null),
 *   findById: async () => user,
 *   save: async function () { return this; },
 * });
 *
 * @param {import("node:test").TestContext} t
 * @param {Record<string, Function>} stubs
 * @returns {Record<string, import("node:test").MockFunctionContext>}
 */
export const stubUserModel = (t, stubs) => {
  if (!t?.mock) {
    throw new TypeError(
      "stubUserModel needs the node:test test context (the `t` argument)"
    );
  }

  const { save, ...staticMethods } = stubs;
  const mocks = {};

  for (const [method, implementation] of Object.entries(staticMethods)) {
    mocks[method] = t.mock.method(UserModel, method, implementation);
  }

  if (save) {
    mocks.save = t.mock.method(UserModel.prototype, "save", save);
  }

  return mocks;
};
