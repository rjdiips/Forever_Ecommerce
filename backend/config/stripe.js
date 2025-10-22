import Stripe from "stripe";

let stripeInstance = null;

export function getStripe() {
  if (stripeInstance) return stripeInstance;

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error(
      "Missing STRIPE_SECRET_KEY environment variable. Set STRIPE_SECRET_KEY in your .env or environment before using Stripe endpoints."
    );
  }

  stripeInstance = new Stripe(key);
  return stripeInstance;
}
