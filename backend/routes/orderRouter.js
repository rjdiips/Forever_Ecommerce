import express from 'express';
import {
  getAllOrders,
  getUserOrders,
  placeOrderCOD,
  placeOrderStripe,
  updateOrderStatus,
  verifyStripePayment,
} from '../controllers/orderController.js';

import adminAuth from '../middlewares/adminAuth.js';
import { userAuth } from '../middlewares/userAuth.js';
import { route } from '../lib/http.js';

const orderRouter = express.Router();

// Admin features
orderRouter.post('/list', adminAuth, route(getAllOrders));
orderRouter.post(
  '/status',
  adminAuth,
  route(updateOrderStatus, { message: 'Order status updated successfully' })
);

// Place order / Payment features
orderRouter.post(
  '/place',
  userAuth,
  route(placeOrderCOD, { message: 'Order placed successfully' })
);
orderRouter.post(
  '/stripe',
  userAuth,
  route(placeOrderStripe, { message: 'Order placed successfully' })
);

// User features
orderRouter.post('/userorders', userAuth, route(getUserOrders));

// verify payment
orderRouter.post(
  '/verifyStripe',
  userAuth,
  route(verifyStripePayment, { message: 'Payment successful' })
);

export default orderRouter;
