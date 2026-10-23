/**
 * The API's outbound email provider.
 *
 * Brevo is preferred when configured because it verifies a single sender
 * address, so production email works without owning a domain. Resend stays as a
 * fallback for deployments that already have a verified domain there.
 *
 * Callers hand this module a message and get one kind of failure back; they
 * never touch a provider SDK or know which provider is active.
 */
import { Resend } from "resend";

const BREVO_ENDPOINT = "https://api.brevo.com/v3/smtp/email";

/**
 * `onboarding@resend.dev` only delivers to the Resend account owner. To reach
 * real recipients on the fallback provider, verify a domain in Resend and set
 * `RESEND_FROM_EMAIL` to an address on it.
 */
const RESEND_FALLBACK_FROM = "onboarding@resend.dev";

/**
 * @typedef {{ to: string, subject: string, html: string, text?: string }} EmailMessage
 *
 * @typedef {{ name: "brevo", apiKey: string, fromEmail: string, fromName: string }} BrevoProvider
 * @typedef {{ name: "resend", apiKey: string, fromEmail: string }} ResendProvider
 * @typedef {BrevoProvider | ResendProvider} EmailProvider
 */

/**
 * Pick the provider to send with.
 *
 * Reads the environment on every call so a test can pass its own map and a
 * provider can be changed without reloading the module.
 *
 * @param {Record<string, string | undefined>} [env]
 * @returns {EmailProvider | null}
 */
export const resolveEmailProvider = (env = process.env) => {
  if (env.BREVO_API_KEY) {
    if (!env.BREVO_FROM_EMAIL) {
      throw new Error(
        "BREVO_FROM_EMAIL is not set; it must be the address verified as a sender in Brevo"
      );
    }

    return {
      name: "brevo",
      apiKey: env.BREVO_API_KEY,
      fromEmail: env.BREVO_FROM_EMAIL,
      fromName: env.BREVO_FROM_NAME || "Forever",
    };
  }

  if (env.RESEND_API_KEY) {
    return {
      name: "resend",
      apiKey: env.RESEND_API_KEY,
      fromEmail: env.RESEND_FROM_EMAIL || RESEND_FALLBACK_FROM,
    };
  }

  return null;
};

/**
 * Build the Brevo request without sending it, so the wire shape is testable.
 *
 * @param {{ provider: BrevoProvider } & EmailMessage} options
 * @returns {{ url: string, init: { method: string, headers: Record<string, string>, body: string } }}
 */
export const buildBrevoRequest = ({ provider, to, subject, html, text }) => ({
  url: BREVO_ENDPOINT,
  init: {
    method: "POST",
    headers: {
      accept: "application/json",
      "api-key": provider.apiKey,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      sender: { name: provider.fromName, email: provider.fromEmail },
      to: [{ email: to }],
      subject,
      htmlContent: html,
      ...(text ? { textContent: text } : {}),
    }),
  },
});

/**
 * Pull a useful message out of a failed provider response.
 *
 * @param {Response} response
 * @returns {Promise<string>}
 */
const failureDetail = async (response) => {
  const body = await response.text();

  try {
    const parsed = JSON.parse(body);
    if (parsed?.message) return parsed.message;
  } catch {
    // Not JSON; the raw text is the best detail available.
  }

  return body.slice(0, 300) || response.statusText;
};

/**
 * @param {BrevoProvider} provider
 * @param {EmailMessage} message
 * @returns {Promise<{ id?: string }>}
 */
const sendWithBrevo = async (provider, message) => {
  const { url, init } = buildBrevoRequest({ provider, ...message });
  const response = await fetch(url, init);

  if (!response.ok) {
    throw new Error(
      `Brevo rejected the email (${response.status}): ${await failureDetail(response)}`
    );
  }

  const body = await response.json().catch(() => ({}));
  return { id: body.messageId };
};

/**
 * @param {ResendProvider} provider
 * @param {EmailMessage} message
 * @returns {Promise<{ id?: string }>}
 */
const sendWithResend = async (provider, message) => {
  const client = new Resend(provider.apiKey);

  const { data, error } = await client.emails.send({
    from: provider.fromEmail,
    to: message.to,
    subject: message.subject,
    html: message.html,
    ...(message.text ? { text: message.text } : {}),
  });

  if (error) {
    throw new Error(`Resend rejected the email: ${error.message}`);
  }

  return { id: data?.id };
};

/**
 * Send one email through whichever provider is configured.
 *
 * Throws when no provider is configured or when the provider rejects the
 * message; the message is safe to log (it never contains the API key).
 *
 * @param {EmailMessage} message
 * @returns {Promise<{ id?: string }>}
 */
export const sendEmail = (message) => {
  const provider = resolveEmailProvider();

  if (!provider) {
    return Promise.reject(
      new Error(
        "No email provider is configured; set BREVO_API_KEY (with BREVO_FROM_EMAIL) or RESEND_API_KEY"
      )
    );
  }

  return provider.name === "brevo"
    ? sendWithBrevo(provider, message)
    : sendWithResend(provider, message);
};
