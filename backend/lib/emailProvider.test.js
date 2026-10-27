import test from "node:test";
import assert from "node:assert/strict";

import {
  buildBrevoRequest,
  resolveEmailProvider,
  sendEmail,
} from "./emailProvider.js";

const brevoProvider = {
  name: "brevo",
  apiKey: "brevo-key",
  fromEmail: "shop@gmail.com",
  fromName: "Forever",
};

/** Replace the process env for one test and put it back afterwards. */
const withEnv = (t, values) => {
  const saved = {};
  for (const [key, value] of Object.entries(values)) {
    saved[key] = process.env[key];
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }

  t.after(() => {
    for (const [key, value] of Object.entries(saved)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });
};

test("the Brevo key resolves the provider", () => {
  const provider = resolveEmailProvider({
    BREVO_API_KEY: "brevo-key",
    BREVO_FROM_EMAIL: "shop@gmail.com",
  });

  assert.deepEqual(provider, {
    name: "brevo",
    apiKey: "brevo-key",
    fromEmail: "shop@gmail.com",
    fromName: "Forever",
  });
});

test("the Brevo sender name can be set", () => {
  const provider = resolveEmailProvider({
    BREVO_API_KEY: "brevo-key",
    BREVO_FROM_EMAIL: "shop@gmail.com",
    BREVO_FROM_NAME: "Forever Studio",
  });

  assert.equal(provider.fromName, "Forever Studio");
});

test("a Brevo key without a sender address is a configuration error", () => {
  assert.throws(
    () => resolveEmailProvider({ BREVO_API_KEY: "brevo-key" }),
    /BREVO_FROM_EMAIL/
  );
});

test("a leftover Resend key does not configure a provider", () => {
  assert.equal(
    resolveEmailProvider({
      RESEND_API_KEY: "resend-key",
      RESEND_FROM_EMAIL: "mail@forever.com",
    }),
    null
  );
});

test("no provider is resolved without a Brevo key", () => {
  assert.equal(resolveEmailProvider({}), null);
});

test("the Brevo request carries the sender, recipient, and HTML body", () => {
  const { url, init } = buildBrevoRequest({
    provider: brevoProvider,
    to: "reader@example.com",
    subject: "Hello",
    html: "<p>Hi</p>",
  });

  assert.equal(url, "https://api.brevo.com/v3/smtp/email");
  assert.equal(init.headers["api-key"], "brevo-key");

  const body = JSON.parse(init.body);
  assert.deepEqual(body.sender, { name: "Forever", email: "shop@gmail.com" });
  assert.deepEqual(body.to, [{ email: "reader@example.com" }]);
  assert.equal(body.subject, "Hello");
  assert.equal(body.htmlContent, "<p>Hi</p>");
  assert.equal(body.textContent, undefined);
});

test("the Brevo request includes plain text when the message has it", () => {
  const { init } = buildBrevoRequest({
    provider: brevoProvider,
    to: "reader@example.com",
    subject: "Hello",
    html: "<p>Hi</p>",
    text: "Hi",
  });

  assert.equal(JSON.parse(init.body).textContent, "Hi");
});

test("sendEmail posts through Brevo and returns the message id", async (t) => {
  withEnv(t, {
    BREVO_API_KEY: "brevo-key",
    BREVO_FROM_EMAIL: "shop@gmail.com",
  });

  const originalFetch = globalThis.fetch;
  let captured;
  globalThis.fetch = async (url, init) => {
    captured = { url, init };
    return new Response(JSON.stringify({ messageId: "brevo-message-1" }), {
      status: 201,
      headers: { "content-type": "application/json" },
    });
  };
  t.after(() => {
    globalThis.fetch = originalFetch;
  });

  const result = await sendEmail({
    to: "reader@example.com",
    subject: "Hello",
    html: "<p>Hi</p>",
  });

  assert.equal(result.id, "brevo-message-1");
  assert.equal(captured.url, "https://api.brevo.com/v3/smtp/email");

  const body = JSON.parse(captured.init.body);
  assert.equal(body.to[0].email, "reader@example.com");
  assert.equal(body.htmlContent, "<p>Hi</p>");
});

test("a rejected Brevo send surfaces the provider's explanation", async (t) => {
  withEnv(t, {
    BREVO_API_KEY: "brevo-key",
    BREVO_FROM_EMAIL: "shop@gmail.com",
  });

  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () =>
    new Response(JSON.stringify({ message: "Sender not verified" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  t.after(() => {
    globalThis.fetch = originalFetch;
  });

  await assert.rejects(
    sendEmail({ to: "reader@example.com", subject: "Hello", html: "<p>Hi</p>" }),
    /Sender not verified/
  );
});

test("a leftover Resend key cannot send an email", async (t) => {
  withEnv(t, {
    BREVO_API_KEY: undefined,
    RESEND_API_KEY: "resend-key",
  });

  await assert.rejects(
    sendEmail({ to: "reader@example.com", subject: "Hello", html: "<p>Hi</p>" }),
    /BREVO_API_KEY/
  );
});

test("sendEmail names the Brevo keys to set when no provider is configured", async (t) => {
  withEnv(t, {
    BREVO_API_KEY: undefined,
    RESEND_API_KEY: undefined,
  });

  await assert.rejects(
    sendEmail({ to: "reader@example.com", subject: "Hello", html: "<p>Hi</p>" }),
    /BREVO_API_KEY/
  );
});
