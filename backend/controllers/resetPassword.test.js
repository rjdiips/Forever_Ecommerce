import test, { before, after } from "node:test";
import assert from "node:assert/strict";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import UserModel from "../models/userModel.js";
import { startAuthServer, stubUserModel } from "../test-support/authHttp.js";
import { userAuth } from "../middlewares/userAuth.js";
import {
  signPasswordResetToken,
  signSessionToken,
  verifySessionToken,
} from "../lib/authTokens.js";

process.env.JWT_SECRET = "ticket-08-test-secret";

const ORIGINAL_PASSWORD = "old-password";

let auth;

before(async () => {
  auth = await startAuthServer({
    // The user router has no route that `userAuth` protects, so a probe route
    // lets the tests observe whether a Session token is accepted.
    mount: (app) => {
      app.get("/api/probe/me", userAuth, (req, res) => {
        res.json({ success: true, userId: req.userId });
      });
    },
  });
});

after(async () => {
  await auth.close();
});

const makeUser = async (overrides = {}) =>
  new UserModel({
    name: "Ada",
    email: "ada@example.com",
    password: await bcrypt.hash(ORIGINAL_PASSWORD, 4),
    tokenVersion: 0,
    ...overrides,
  });

/**
 * Stub the two database calls a reset makes.
 *
 * `findById` returns the version the request first saw, and `findOneAndUpdate`
 * only writes when that version still matches, exactly like the atomic
 * conditional update in the controller. `staleVersion` lets one test hand both
 * concurrent requests the same pre-update version.
 */
const stubResetDatabase = (t, user, { staleVersion } = {}) => {
  let version = user.tokenVersion ?? 0;

  const expectedVersion = (filter) => {
    if (filter.tokenVersion !== undefined) return filter.tokenVersion;

    const clause = filter.$or?.find((entry) => "tokenVersion" in entry);
    if (!clause) return undefined;

    return clause.tokenVersion?.$exists === false ? 0 : clause.tokenVersion;
  };

  return stubUserModel(t, {
    findById: async () => ({
      _id: user._id,
      tokenVersion: staleVersion ?? version,
    }),
    findOneAndUpdate: async (filter, update) => {
      if (String(filter._id) !== String(user._id)) return null;
      if (expectedVersion(filter) !== version) return null;

      version += update.$inc?.tokenVersion ?? 0;
      if (update.$set?.password !== undefined) {
        user.password = update.$set.password;
      }
      user.tokenVersion = version;

      return user;
    },
  });
};

const resetPassword = (body, ip) =>
  auth.request("/api/user/reset-password", {
    method: "POST",
    body,
    ip,
  });

test("a valid Password reset link sets a new password and signs the User in", async (t) => {
  const user = await makeUser();
  const resetToken = signPasswordResetToken(user._id, 0);

  stubResetDatabase(t, user);

  const response = await resetPassword(
    { token: resetToken, password: "new-password" },
    "198.51.100.81"
  );

  assert.equal(response.status, 200);
  assert.equal(response.body.success, true);

  // The password is re-hashed, never stored as plaintext.
  assert.notEqual(user.password, "new-password");
  assert.equal(await bcrypt.compare("new-password", user.password), true);
  assert.equal(await bcrypt.compare(ORIGINAL_PASSWORD, user.password), false);

  // The version is bumped, so the used link and old sessions stop working.
  assert.equal(user.tokenVersion, 1);

  // The response signs the User in with a Session token minted against the new
  // version.
  const session = verifySessionToken(response.body.data.token);
  assert.equal(session.userId, String(user._id));
  assert.equal(session.tokenVersion, 1);
  assert.equal(session.purpose, "session");
});

test("an expired Password reset link is a clear 400 and changes nothing", async (t) => {
  const user = await makeUser();
  const expired = jwt.sign(
    {
      userId: String(user._id),
      tokenVersion: user.tokenVersion,
      purpose: "password-reset",
    },
    process.env.JWT_SECRET,
    { expiresIn: -10 }
  );

  const { findOneAndUpdate } = stubResetDatabase(t, user);

  const response = await resetPassword(
    { token: expired, password: "new-password" },
    "198.51.100.82"
  );

  assert.equal(response.status, 400);
  assert.equal(response.body.success, false);
  assert.match(response.body.message, /expired/i);
  assert.equal(findOneAndUpdate.mock.callCount(), 0);
  assert.equal(user.tokenVersion, 0);
  assert.equal(await bcrypt.compare(ORIGINAL_PASSWORD, user.password), true);
});

test("a malformed, forged or wrong-purpose token is a clear 400", async (t) => {
  const user = await makeUser();

  const { findById, findOneAndUpdate } = stubResetDatabase(t, user);
  const sessionToken = signSessionToken(user._id, 0);
  const responses = [
    await resetPassword(
      { token: "not-a-token", password: "new-password" },
      "198.51.100.83"
    ),
    await resetPassword(
      { token: sessionToken, password: "new-password" },
      "198.51.100.83"
    ),
    await resetPassword({ password: "new-password" }, "198.51.100.83"),
  ];

  for (const response of responses) {
    assert.equal(response.status, 400);
    assert.equal(response.body.success, false);
    assert.match(response.body.message, /invalid/i);
  }

  assert.equal(findById.mock.callCount(), 0);
  assert.equal(findOneAndUpdate.mock.callCount(), 0);
});

test("a link minted for an older token version is refused", async (t) => {
  const user = await makeUser({ tokenVersion: 1 });
  const staleResetToken = signPasswordResetToken(user._id, 0);

  const { findOneAndUpdate } = stubResetDatabase(t, user);

  const response = await resetPassword(
    { token: staleResetToken, password: "new-password" },
    "198.51.100.84"
  );

  assert.equal(response.status, 400);
  assert.equal(response.body.success, false);
  assert.match(response.body.message, /invalid|already been used/i);
  assert.equal(findOneAndUpdate.mock.callCount(), 0);
  assert.equal(user.tokenVersion, 1);
});

test("a weak password is a 400 and is not saved", async (t) => {
  const user = await makeUser();
  const resetToken = signPasswordResetToken(user._id, 0);

  const { findOneAndUpdate } = stubResetDatabase(t, user);

  const response = await resetPassword(
    { token: resetToken, password: "short" },
    "198.51.100.85"
  );

  assert.equal(response.status, 400);
  assert.equal(response.body.success, false);
  assert.match(response.body.message, /at least 6 characters/i);
  assert.equal(findOneAndUpdate.mock.callCount(), 0);
  assert.equal(user.tokenVersion, 0);
});

test("a used link cannot be used a second time", async (t) => {
  const user = await makeUser();
  const resetToken = signPasswordResetToken(user._id, 0);

  stubResetDatabase(t, user);

  const first = await resetPassword(
    { token: resetToken, password: "new-password" },
    "198.51.100.86"
  );
  const reuse = await resetPassword(
    { token: resetToken, password: "another-password" },
    "198.51.100.86"
  );

  assert.equal(first.status, 200);
  assert.equal(reuse.status, 400);
  assert.equal(reuse.body.success, false);
  assert.match(reuse.body.message, /invalid|already been used/i);
  assert.equal(await bcrypt.compare("new-password", user.password), true);
});

test("two concurrent redemptions of the same link cannot both succeed", async (t) => {
  const user = await makeUser();
  const resetToken = signPasswordResetToken(user._id, 0);

  // Both requests pass the pre-check at version 0; only the atomic conditional
  // update may write, so the second one must find nothing to update.
  const { findOneAndUpdate } = stubResetDatabase(t, user, { staleVersion: 0 });

  const responses = await Promise.all([
    resetPassword(
      { token: resetToken, password: "first-password" },
      "198.51.100.89"
    ),
    resetPassword(
      { token: resetToken, password: "second-password" },
      "198.51.100.89"
    ),
  ]);

  const accepted = responses.find((response) => response.status === 200);
  const rejected = responses.find((response) => response.status === 400);
  const acceptedPassword =
    responses[0].status === 200 ? "first-password" : "second-password";
  const rejectedPassword =
    acceptedPassword === "first-password"
      ? "second-password"
      : "first-password";

  assert.ok(accepted, "exactly one redemption should succeed");
  assert.ok(rejected, "exactly one redemption should be rejected");
  assert.match(rejected.body.message, /invalid|already been used/i);

  // Only the winning request's password was written, and the version moved once.
  assert.equal(await bcrypt.compare(acceptedPassword, user.password), true);
  assert.equal(await bcrypt.compare(rejectedPassword, user.password), false);
  assert.equal(user.tokenVersion, 1);
  assert.equal(findOneAndUpdate.mock.callCount(), 2);

  const session = verifySessionToken(accepted.body.data.token);
  assert.equal(session.tokenVersion, 1);
});

test("resetting the password revokes the old Session token", async (t) => {
  const user = await makeUser();
  const oldSession = signSessionToken(user._id, 0);
  const resetToken = signPasswordResetToken(user._id, 0);

  stubResetDatabase(t, user);

  const before = await auth.request("/api/probe/me", {
    headers: { token: oldSession },
  });
  assert.equal(before.status, 200);

  const response = await resetPassword(
    { token: resetToken, password: "new-password" },
    "198.51.100.87"
  );
  assert.equal(response.status, 200);

  const oldAfterReset = await auth.request("/api/probe/me", {
    headers: { token: oldSession },
  });
  assert.equal(oldAfterReset.status, 401);

  const freshAfterReset = await auth.request("/api/probe/me", {
    headers: { token: response.body.data.token },
  });
  assert.equal(freshAfterReset.status, 200);
  assert.equal(freshAfterReset.body.userId, String(user._id));
});

test("a link for a User that no longer exists is refused", async (t) => {
  const user = await makeUser();
  const resetToken = signPasswordResetToken(user._id, 0);

  const { findOneAndUpdate } = stubUserModel(t, {
    findById: async () => null,
    findOneAndUpdate: async () => user,
  });

  const response = await resetPassword(
    { token: resetToken, password: "new-password" },
    "198.51.100.88"
  );

  assert.equal(response.status, 400);
  assert.equal(response.body.success, false);
  assert.match(response.body.message, /invalid|already been used/i);
  assert.equal(findOneAndUpdate.mock.callCount(), 0);
});
