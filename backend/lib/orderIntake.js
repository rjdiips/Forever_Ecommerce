/**
 * Order intake: the one place an Order is created, priced and paid for.
 *
 * The routes are thin transport adapters over {@link createOrder} and
 * {@link verifyOrderPayment}. Every price comes from the catalogue through
 * {@link priceOrder}; the request body supplies intent only. See ADR-0002.
 */
import mongoose from "mongoose";
import { CURRENCY, ORDER_PRICING } from "@forever/shared";
import ProductModel from "../models/productModel.js";
import orderModel from "../models/orderModel.js";
import UserModel from "../models/userModel.js";
import { getStripe } from "../config/stripe.js";
import { HttpError } from "./http.js";
import { priceOrder } from "./orderPricing.js";

/** The payment methods an Order can carry. */
export const PAYMENT_METHOD = Object.freeze({
  COD: "COD",
  STRIPE: "Stripe",
});

const isPaymentMethod = (method) =>
  Object.values(PAYMENT_METHOD).includes(method);

/**
 * Create an Order for the signed-in user.
 *
 * The client sends the address and the Cart lines (intent only). The server
 * loads the Products, prices the lines, saves the Order, and — for Stripe —
 * opens a Checkout session priced from the same server-side numbers.
 *
 * Cash on delivery clears the Cart immediately. Stripe clears it only after
 * {@link verifyOrderPayment} confirms the payment.
 *
 * @param {object} intent
 * @param {string} intent.userId the authenticated user, never from the body
 * @param {object} intent.address
 * @param {import("./orderPricing.js").OrderIntentLine[]} intent.items
 * @param {string} intent.paymentMethod one of {@link PAYMENT_METHOD}
 * @param {string} [intent.origin] the shop origin, for Stripe's redirect URLs
 * @returns {Promise<{ orderId: unknown, sessionUrl?: string }>}
 */
export async function createOrder({
  userId,
  address,
  items,
  paymentMethod,
  origin,
}) {
  if (!isPaymentMethod(paymentMethod)) {
    throw new HttpError(400, "Unknown payment method");
  }

  if (paymentMethod === PAYMENT_METHOD.STRIPE && !origin) {
    throw new HttpError(400, "Missing request origin");
  }

  const priced = priceOrder(items, await loadProducts(items));

  const order = await orderModel.create({
    userId,
    items: priced.items,
    amount: priced.amount,
    pricingVersion: ORDER_PRICING.CENTS,
    address,
    paymentMethod,
    payment: false,
    date: Date.now(),
  });

  if (paymentMethod === PAYMENT_METHOD.COD) {
    await UserModel.findByIdAndUpdate(userId, { cartData: [] });
    return { orderId: order._id };
  }

  let sessionUrl;

  try {
    sessionUrl = await createCheckoutSession({ order, priced, origin });
  } catch (error) {
    // No session means no way to pay: do not leave an orphan Order behind.
    await orderModel.findByIdAndDelete(order._id);
    throw toStripeClientError(error, "Could not start the payment. Please try again.");
  }

  return { orderId: order._id, sessionUrl };
}

/**
 * Confirm a Stripe payment and mark the caller's Order paid.
 *
 * The success query string alone proves nothing: we retrieve the Checkout
 * session, require a paid status, require the session to name this Order, and
 * require the Order to belong to the signed-in user.
 *
 * @param {object} verification
 * @param {string} verification.userId the authenticated user
 * @param {unknown} verification.orderId
 * @param {string} [verification.sessionId]
 * @param {boolean} [verification.cancelled] the shopper left Stripe without paying
 */
export async function verifyOrderPayment({
  userId,
  orderId,
  sessionId,
  cancelled,
}) {
  const order = await findOwnedOrder(orderId, userId);

  if (order.paymentMethod !== PAYMENT_METHOD.STRIPE) {
    throw new HttpError(400, "This order is not a Stripe order");
  }

  if (cancelled) {
    // The cancel redirect is the shopper's word, not proof of anything. If the
    // Order is already paid (e.g. paid in another tab), leave it alone and
    // report success. Otherwise leave it unpaid for the admin and the shopper;
    // deleting it on a client flag could erase a real purchase.
    if (order.payment) return;

    throw new HttpError(400, "Payment failed");
  }

  if (!sessionId) {
    throw new HttpError(400, "Missing Stripe session");
  }

  const session = await retrieveSession(sessionId);

  if (session.metadata?.orderId !== String(order._id)) {
    throw new HttpError(400, "This payment does not belong to this order");
  }

  if (session.payment_status !== "paid") {
    throw new HttpError(400, "Payment is not complete");
  }

  order.payment = true;
  await order.save();

  await UserModel.findByIdAndUpdate(userId, { cartData: [] });
}

/** Load the Products the request names, ignoring ids that cannot exist. */
async function loadProducts(items) {
  if (!Array.isArray(items)) return [];

  const ids = items
    .map((item) => item?.productId)
    .filter((id) => mongoose.isValidObjectId(id));

  if (ids.length === 0) return [];

  return ProductModel.find({ _id: { $in: ids } });
}

/** The caller's Order, or a 404 so another user's Order stays invisible. */
async function findOwnedOrder(orderId, userId) {
  const order = mongoose.isValidObjectId(orderId)
    ? await orderModel.findById(orderId)
    : null;

  if (!order || String(order.userId) !== String(userId)) {
    throw new HttpError(404, "Order not found");
  }

  return order;
}

/** Open a Stripe Checkout session from the server-priced lines. */
async function createCheckoutSession({ order, priced, origin }) {
  const lineItems = priced.items.map((item) => ({
    price_data: {
      currency: CURRENCY,
      product_data: { name: item.name },
      unit_amount: item.price,
    },
    quantity: item.quantity,
  }));

  lineItems.push({
    price_data: {
      currency: CURRENCY,
      product_data: { name: "Delivery Charges" },
      unit_amount: priced.deliveryFee,
    },
    quantity: 1,
  });

  const session = await getStripe().checkout.sessions.create({
    mode: "payment",
    line_items: lineItems,
    success_url: `${origin}/verify?success=true&orderId=${order._id}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/verify?success=false&orderId=${order._id}`,
    metadata: { orderId: String(order._id) },
  });

  return session.url;
}

/** Retrieve a Checkout session, turning Stripe's client errors into 400s. */
async function retrieveSession(sessionId) {
  try {
    return await getStripe().checkout.sessions.retrieve(sessionId);
  } catch (error) {
    throw toStripeClientError(error, "This payment session is not valid");
  }
}

/**
 * Stripe errors carry `statusCode`, not `status`, so the one error path would
 * treat a bad session id or redirect origin as a server fault. A 4xx from
 * Stripe is the caller's error; anything else stays a 5xx.
 *
 * @param {unknown} error
 * @param {string} message
 * @returns {unknown}
 */
function toStripeClientError(error, message) {
  if (error?.statusCode >= 400 && error.statusCode < 500) {
    return new HttpError(400, message);
  }

  return error;
}
