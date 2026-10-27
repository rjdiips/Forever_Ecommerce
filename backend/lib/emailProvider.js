/**
 * The API's outbound email provider.
 *
 * Brevo verifies a single sender address, so production email works without
 * owning a domain.
 *
 * Callers hand this module a message and get one kind of failure back; they
 * never touch a provider SDK or know which provider is active.
 */

const BREVO_ENDPOINT = "https://api.brevo.com/v3/smtp/email";

/**
 * @typedef {{ to: string, subject: string, html: string, text?: string }} EmailMessage
 *
 * @typedef {{ name: "brevo", apiKey: string, fromEmail: string, fromName: string }} BrevoProvider
 * @typedef {BrevoProvider} EmailProvider
 */

/**
 * Pick the provider to send with.
 *
 * Reads the environment on every call so a test can pass its own map and the
 * provider can be changed without reloading the module.
 *
 * @param {Record<string, string | undefined>} [env]
 * @returns {EmailProvider | null}
 */
export const resolveEmailProvider = (env = process.env) => {
  if (!env.BREVO_API_KEY) {
    return null;
  }

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
 * Send one email through Brevo.
 *
 * Throws when the provider is not configured or when Brevo rejects the
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
        "No email provider is configured; set BREVO_API_KEY (with BREVO_FROM_EMAIL)"
      )
    );
  }

  return sendWithBrevo(provider, message);
};
