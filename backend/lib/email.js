/**
 * The API's transactional email.
 *
 * Sending is kept behind {@link emailService} so callers never touch the
 * provider and tests can stub one method instead of reaching the network. The
 * message itself is built by a pure function, so its contents are testable
 * without a Resend key.
 */
import { Resend } from "resend";
import { log } from "./log.js";
import { TOKEN_LIFETIME_SECONDS } from "./authTokens.js";

// The Resend client is null when the key is absent, so the module still loads
// and a missing key becomes a per-send failure rather than a boot crash.
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

// `onboarding@resend.dev` only delivers to the Resend account owner. To reach
// real Users, verify a domain in Resend and set RESEND_FROM_EMAIL to an address
// on it.
const from = () => process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

/** The lifetime to promise in the email, derived from the token module. */
const passwordResetMinutes = () => TOKEN_LIFETIME_SECONDS.passwordReset / 60;

/**
 * Build the Password reset email.
 *
 * Pure: no provider, no environment. The reset link and the lifetime statement
 * are the two things the User needs.
 *
 * @param {{ resetUrl: string }} options
 * @returns {{ subject: string, text: string, html: string }}
 */
export const buildPasswordResetEmail = ({ resetUrl }) => {
  const minutes = passwordResetMinutes();

  const text = [
    "Someone asked to reset the password for your Forever account.",
    "",
    `Open this link to choose a new password: ${resetUrl}`,
    "",
    `The link expires in ${minutes} minutes and can only be used once.`,
    "If you did not ask for this, you can ignore this email.",
  ].join("\n");

  const html = `
    <div style="font-family: Arial, sans-serif; color: #333; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
      <h2>Reset your password</h2>
      <p>Someone asked to reset the password for your Forever account.</p>
      <p><a href="${resetUrl}">Choose a new password</a></p>
      <p>The link expires in ${minutes} minutes and can only be used once.</p>
      <p>If you did not ask for this, you can ignore this email.</p>
    </div>
  `;

  return { subject: "Reset your Forever password", text, html };
};

/**
 * The email operations the API needs. Tests stub these methods.
 */
export const emailService = {
  /**
   * Send a Password reset link. Throws when no provider is configured or when
   * Resend rejects the message; the caller decides whether that is fatal (for a
   * reset request it must never change the response).
   *
   * @param {{ to: string, resetUrl: string }} options
   * @returns {Promise<void>}
   */
  async sendPasswordResetEmail({ to, resetUrl }) {
    if (!resend) {
      throw new Error(
        "RESEND_API_KEY is not set; cannot send the password reset email"
      );
    }

    const { error } = await resend.emails.send({
      from: from(),
      to,
      ...buildPasswordResetEmail({ resetUrl }),
    });

    if (error) {
      throw new Error(
        `Resend rejected the password reset email: ${error.message}`
      );
    }

    log.info("Password reset email sent");
  },
};
