import orderModel from "../models/orderModel.js";
import {
  createOrder,
  PAYMENT_METHOD,
  verifyOrderPayment,
} from "../lib/orderIntake.js";

// Place order using COD method --> /api/order/place
export const placeOrderCOD = async (req) => {
  const { address, items } = req.body;

  return createOrder({
    userId: req.userId,
    address,
    items,
    paymentMethod: PAYMENT_METHOD.COD,
  });
};

// Place order using Stripe method --> /api/order/stripe
export const placeOrderStripe = async (req) => {
  const { address, items } = req.body;

  return createOrder({
    userId: req.userId,
    address,
    items,
    paymentMethod: PAYMENT_METHOD.STRIPE,
    origin: req.headers.origin,
  });
};

// verify Stripe payment success or failure --> /api/order/verifyStripe
export const verifyStripePayment = async (req) => {
  const { orderId, sessionId, success } = req.body;

  await verifyOrderPayment({
    userId: req.userId,
    orderId,
    sessionId,
    cancelled: success === "false" || success === false,
  });
};

// Get all order data for admin panel --> /api/order/list
export const getAllOrders = async () => {
  const orders = await orderModel.find({});

  return { orders };
};

// user order data for frontend --> /api/order/userorders
export const getUserOrders = async (req) => {
  const orders = await orderModel.find({ userId: req.userId });

  return { orders };
};

// upadae order status --> /api/order/status
export const updateOrderStatus = async (req) => {
  const { orderId, orderStatus } = req.body;

  await orderModel.findByIdAndUpdate(orderId, { orderStatus });
};
