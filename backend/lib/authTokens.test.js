import test from "node:test";
import assert from "node:assert/strict";
import jwt from "jsonwebtoken";

import {
  TokenPurposeError,
  TOKEN_PURPOSE,
  isCurrentToken,
  signAdminSessionToken,
  signPasswordResetToken,
  signSessionToken,
  verifyAdminSessionToken,
  verifyPasswordResetToken,
  verifySessionToken,
} from "./authTokens.js";

process.env.JWT_SECRET = "ticket-02-test-secret";

const lifetime = (token) => {
  const { exp, iat } = jwt.decode(token);
  return exp - iat;
};

const tamperPayload = (token, change) => {
  const [header, payload, signature] = token.split(".");
  const claims = JSON.parse(Buffer.from(payload, "base64url").toString());
  const tampered = Buffer.from(
    JSON.stringify(change(claims))
  ).toString("base64url");

  return [header, tampered, signature].join(".");
};

test("a Session token lasts 7 days", () => {
  assert.equal(lifetime(signSessionToken("user-1", 0)), 7 * 24 * 60 * 60);
});

test("an admin Session token lasts 12 hours", () => {
  assert.equal(lifetime(signAdminSessionToken()), 12 * 60 * 60);
});

test("a Password reset token lasts 30 minutes", () => {
  assert.equal(lifetime(signPasswordResetToken("user-1", 0)), 30 * 60);
});

test("a Session token carries the User, version and session purpose", () => {
  const claims = jwt.decode(signSessionToken("user-1", 4));

  assert.equal(claims.userId, "user-1");
  assert.equal(claims.tokenVersion, 4);
  assert.equal(claims.purpose, "session");
});

test("a Password reset token carries the User, version and reset purpose", () => {
  const claims = jwt.decode(signPasswordResetToken("user-1", 4));

  assert.equal(claims.userId, "user-1");
  assert.equal(claims.tokenVersion, 4);
  assert.equal(claims.purpose, "password-reset");
});

test("an admin Session token carries only the admin role and purpose", () => {
  const claims = jwt.decode(signAdminSessionToken());

  assert.equal(claims.role, "admin");
  assert.equal(claims.purpose, "admin-session");
  assert.equal("email" in claims, false);
  assert.equal("password" in claims, false);
});

test("a tampered Session token is refused", () => {
  const token = signSessionToken("user-1", 0);
  const tampered = tamperPayload(token, (claims) => ({
    ...claims,
    tokenVersion: claims.tokenVersion + 1,
  }));

  assert.throws(() => verifySessionToken(tampered), {
    name: "JsonWebTokenError",
  });
});

test("an expired Session token reports expiry distinctly", () => {
  const expired = jwt.sign(
    { userId: "user-1", tokenVersion: 0, purpose: TOKEN_PURPOSE.SESSION },
    process.env.JWT_SECRET,
    { expiresIn: -10 }
  );

  assert.throws(() => verifySessionToken(expired), {
    name: "TokenExpiredError",
  });
});

test("a Password reset token cannot verify as a Session token", () => {
  const resetToken = signPasswordResetToken("user-1", 0);

  assert.throws(
    () => verifySessionToken(resetToken),
    TokenPurposeError
  );
});

test("a Session token cannot verify as a Password reset token", () => {
  const sessionToken = signSessionToken("user-1", 0);

  assert.throws(
    () => verifyPasswordResetToken(sessionToken),
    TokenPurposeError
  );
});

test("a Session token cannot verify as an admin Session token", () => {
  assert.throws(
    () => verifyAdminSessionToken(signSessionToken("user-1", 0)),
    TokenPurposeError
  );
});

test("an admin Session token verifies as an admin token", () => {
  const claims = verifyAdminSessionToken(signAdminSessionToken());

  assert.equal(claims.role, "admin");
  assert.equal(claims.purpose, TOKEN_PURPOSE.ADMIN_SESSION);
});

test("a Password reset token verifies as a Password reset token", () => {
  const claims = verifyPasswordResetToken(
    signPasswordResetToken("user-1", 2)
  );

  assert.equal(claims.userId, "user-1");
  assert.equal(claims.tokenVersion, 2);
  assert.equal(claims.purpose, TOKEN_PURPOSE.PASSWORD_RESET);
});

test("the token's purpose, User and version must all be current", () => {
  const claims = {
    userId: "user-1",
    tokenVersion: 2,
    purpose: TOKEN_PURPOSE.SESSION,
  };
  const user = { _id: "user-1", tokenVersion: 2 };

  assert.equal(isCurrentToken(claims, user, TOKEN_PURPOSE.SESSION), true);
  assert.equal(
    isCurrentToken(claims, user, TOKEN_PURPOSE.PASSWORD_RESET),
    false
  );
  assert.equal(
    isCurrentToken({ ...claims, tokenVersion: 1 }, user, TOKEN_PURPOSE.SESSION),
    false
  );
  assert.equal(
    isCurrentToken(
      { ...claims, userId: "user-2" },
      user,
      TOKEN_PURPOSE.SESSION
    ),
    false
  );
  assert.equal(isCurrentToken(claims, null, TOKEN_PURPOSE.SESSION), false);
});

test("a token minted before versions existed is not current for a versioned User", () => {
  const claims = {
    userId: "user-1",
    purpose: TOKEN_PURPOSE.SESSION,
  };
  const versioned = { _id: "user-1", tokenVersion: 0 };

  assert.equal(isCurrentToken(claims, versioned, TOKEN_PURPOSE.SESSION), false);
});

test("a User saved before versions existed is treated as version 0", () => {
  const claims = {
    userId: "user-1",
    tokenVersion: 0,
    purpose: TOKEN_PURPOSE.SESSION,
  };
  const legacy = { _id: "user-1" };

  assert.equal(isCurrentToken(claims, legacy, TOKEN_PURPOSE.SESSION), true);
});
