import { describe, expect, it } from "vitest";
import { isLoginPage, isRejectedSession } from "./sessionExpiry";

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
