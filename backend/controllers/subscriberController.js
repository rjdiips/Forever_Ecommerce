import { log } from "../lib/log.js";
import { HttpError } from "../lib/http.js";
import { resendClient, resendFrom } from "../lib/resend.js";

// Subscribe a newsletter email --> /api/subscribe
export const subscribe = async (req) => {
  const { email } = req.body;

  if (!email) {
    throw new HttpError(400, "Email is required.");
  }

  if (!resendClient) {
    throw new HttpError(
      500,
      "RESEND_API_KEY is not set; cannot send subscription email"
    );
  }

  const { error } = await resendClient.emails.send({
    from: resendFrom(),
    to: email,
    subject: "🎉 Thank You for Subscribing!",
    html: `
      <div style="font-family: Arial, sans-serif; text-align: center; color: #333; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h2>Welcome to the Club!</h2>
        <p style="font-size: 16px;">Thank you for subscribing to our newsletter.</p>
        <p>You'll be the first to know about new arrivals, sales, and special promos.</p>
        <p>As promised, here is your 20% off discount code:</p>
        <h3 style="background-color: #f2f2f2; padding: 10px 15px; border-radius: 5px; display: inline-block;">WELCOME20</h3>
      </div>
    `,
  });

  if (error) {
    throw new HttpError(
      500,
      `Resend rejected the subscription email: ${error.message}`
    );
  }

  log.info("Subscription email sent");
};
