import Stripe from "stripe";

let stripeInstance = null;

/**
 * Lazily initialize and return the Stripe instance.
 * Throws a clear error if STRIPE_SECRET_KEY is not set when called.
 */
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
