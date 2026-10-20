import { describe, expect, it } from "vitest";
import {
  SESSION_EXPIRED_MESSAGE,
  isLoginPage,
  isRejectedSession,
  sessionRejectionMessage,
} from "./sessionExpiry";

describe("isRejectedSession", () => {
  it("treats a 401 as a rejected Session token", () => {
    expect(isRejectedSession({ response: { status: 401 } })).toBe(true);
  });

  it("does not treat bad credentials (400) as an expired session", () => {
    expect(isRejectedSession({ response: { status: 400 } })).toBe(false);
  });

  it("ignores failures with no response, such as a network error", () => {
    expect(isRejectedSession(new Error("Network Error"))).toBe(false);
    expect(isRejectedSession(null)).toBe(false);
  });
});

describe("isLoginPage", () => {
  it("recognises the login route with or without a trailing slash", () => {
    expect(isLoginPage("/login")).toBe(true);
    expect(isLoginPage("/login/")).toBe(true);
  });

  it("does not mistake another route for the login page", () => {
    expect(isLoginPage("/")).toBe(false);
    expect(isLoginPage("/orders")).toBe(false);
    expect(isLoginPage("/login-help")).toBe(false);
  });
});

describe("sessionRejectionMessage", () => {
  it("keeps the API's distinct expired-session message", () => {
    expect(
      sessionRejectionMessage({
        response: {
          status: 401,
          data: { message: "Session expired, please log in again" },
        },
      }),
    ).toBe("Session expired, please log in again");
  });

  it("keeps a malformed-token message distinct from expiry", () => {
    expect(
      sessionRejectionMessage({
        response: {
          status: 401,
          data: { message: "Not authorized, token failed" },
        },
      }),
    ).toBe("Not authorized, token failed");
  });

  it("falls back to the expiry message when the API sent none", () => {
    expect(
      sessionRejectionMessage({ response: { status: 401, data: {} } }),
    ).toBe(SESSION_EXPIRED_MESSAGE);
    expect(sessionRejectionMessage(new Error("Network Error"))).toBe(
      SESSION_EXPIRED_MESSAGE,
    );
  });
});
