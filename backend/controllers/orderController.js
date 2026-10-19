import orderModel from "../models/orderModel.js";
import UserModel from "../models/userModel.js";
import { getStripe } from "../config/stripe.js";
import Razorpay from "razorpay";
import { DELIVERY_FEE } from "@forever/shared";
import { HttpError } from "../lib/http.js";

// global variables
const currency = "USD";

// Stripe instance will be created lazily when a Stripe endpoint is invoked

// Place order using COD method --> /api/order/place
export const placeOrderCOD = async (req) => {
  const { userId, items, amount, address } = req.body;

  const orderData = {
    userId,
    items,
    amount,
    address,
    paymentMethod: "COD",
    payment: false,
    date: Date.now(),
  };

  const newOrder = new orderModel(orderData);
  await newOrder.save();

  await UserModel.findByIdAndUpdate(userId, { cartData: {} });
};

// Place order using Stripe method --> /api/order/stripe
export const placeOrderStripe = async (req) => {
  const { userId, items, amount, address } = req.body;
  const { origin } = req.headers;

  const orderData = {
    userId,
    items,
    amount,
    address,
    paymentMethod: "Stripe",
    payment: false,
    date: Date.now(),
  };

  const newOrder = new orderModel(orderData);
  await newOrder.save();

  const line_items = items.map((item) => ({
    price_data: {
      currency: currency,
      product_data: {
        name: item.name,
      },
      unit_amount: item.price * 100,
    },
    quantity: item.quantity,
  }));

  line_items.push({
    price_data: {
      currency: currency,
      product_data: {
        name: "Delivery Charges",
      },
      unit_amount: DELIVERY_FEE,
    },
    quantity: 1,
  });

  // Lazily initialize Stripe when we need to create a checkout session
  const stripe = getStripe();

  const session = await stripe.checkout.sessions.create({
    success_url: `${origin}/verify?success=true&orderId=${newOrder._id}`,
    cancel_url: `${origin}/verify?success=false&orderId=${newOrder._id}`,
    line_items,
    mode: "payment",
  });

  return { session_url: session.url };
};

// verify Stripe payment success or failure --> /api/order/verifyStripe
export const verifyStripePayment = async (req) => {
  const { orderId, success, userId } = req.body;

  if (success === "true") {
    await orderModel.findByIdAndUpdate(orderId, {
      payment: true,
    });

    await UserModel.findByIdAndUpdate(userId, { cartData: {} });
    return;
  }

  await orderModel.findByIdAndDelete(orderId);
  throw new HttpError(400, "Payment failed");
};

// Place order using Razorpay method --> /api/order/razorpay
export const placeOrderRazorpay = async () => {
  throw new HttpError(501, "Razorpay is not implemented");
};

// Get all order data for admin panel --> /api/order/list
export const getAllOrders = async () => {
  const orders = await orderModel.find({});

  return { orders };
};

// user order data for frontend --> /api/order/userorders
export const getUserOrders = async (req) => {
  const { userId } = req.body;

  const orders = await orderModel.find({ userId });

  return { orders };
};

// upadae order status --> /api/order/status
export const updateOrderStatus = async (req) => {
  const { orderId, orderStatus } = req.body;

  await orderModel.findByIdAndUpdate(orderId, { orderStatus });
};
