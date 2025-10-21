// backend/routes/subscriberRouter.js

import express from "express";
import sgMail from "@sendgrid/mail";

const subscriberRouter = express.Router();

// Configure SendGrid with the API key from your .env file
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

subscriberRouter.post("/", async (req, res) => {
  const { email } = req.body;

  // Basic validation: ensure an email was provided
  if (!email) {
    return res
      .status(400)
      .json({ success: false, message: "Email is required." });
  }

  // Construct the email message
  const msg = {
    to: email, // The recipient's email address
    from: process.env.SENDGRID_VERIFIED_EMAIL, // Your verified sender email
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
  };

  try {
    // Attempt to send the email
    await sgMail.send(msg);
    console.log(`Subscription email sent to ${email}`);
    res.json({
      success: true,
      message: "Subscription successful! Please check your email.",
    });
  } catch (error) {
    console.error("Error sending subscription email:", error);
    // Log more details if available
    if (error.response) {
      console.error(error.response.body);
    }
    res
      .status(500)
      .json({
        success: false,
        message: "Something went wrong. Please try again later.",
      });
  }
});

export default subscriberRouter;
