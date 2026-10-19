import express from "express";
import { Resend } from "resend";
import { log } from "../lib/log.js";

const subscriberRouter = express.Router();

// The Resend client is null when the key is absent, so the module still loads and
// a missing key becomes a per-request failure rather than a boot crash.
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

// `onboarding@resend.dev` only delivers to the Resend account owner. To reach
// real subscribers, verify a domain in Resend and set RESEND_FROM_EMAIL to an
// address on it.
const from = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

subscriberRouter.post("/", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res
      .status(400)
      .json({ success: false, message: "Email is required." });
  }

  if (!resend) {
    log.error("RESEND_API_KEY is not set; cannot send subscription email");
    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again later.",
    });
  }

  try {
    const { error } = await resend.emails.send({
      from,
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
      log.error("Resend rejected the subscription email", {
        error: error.message,
        name: error.name,
      });
      return res.status(500).json({
        success: false,
        message: "Something went wrong. Please try again later.",
      });
    }

    log.info("Subscription email sent");
    res.json({
      success: true,
      message: "Subscription successful! Please check your email.",
    });
  } catch (err) {
    log.error("Failed to send subscription email", { error: err.message });
    res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again later.",
    });
  }
});

export default subscriberRouter;
