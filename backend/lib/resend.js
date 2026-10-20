/**
 * The one Resend client and sender address for the API.
 *
 * Both transactional email (Password reset links) and the newsletter
 * subscription send through this module, so there is a single client and one
 * `RESEND_FROM_EMAIL` fallback to configure and reason about.
 */
import { Resend } from "resend";

/**
 * `onboarding@resend.dev` only delivers to the Resend account owner. To reach
 * real recipients, verify a domain in Resend and set `RESEND_FROM_EMAIL` to an
 * address on it.
 */
export const RESEND_FALLBACK_FROM = "onboarding@resend.dev";

// The client is null when the key is absent, so the module still loads and a
// missing key becomes a per-send failure rather than a boot crash.
export const resendClient = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

/**
 * The sender for this deployment, falling back to Resend's test address.
 *
 * @returns {string}
 */
export const resendFrom = () =>
  process.env.RESEND_FROM_EMAIL || RESEND_FALLBACK_FROM;
