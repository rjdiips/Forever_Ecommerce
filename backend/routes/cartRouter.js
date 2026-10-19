import express from 'express';

import {
  addToCart,
  updateCart,
  getUserCart,
} from '../controllers/cartController.js';
import { userAuth } from '../middlewares/userAuth.js';
import { route } from '../lib/http.js';

const cartRouter = express.Router();

cartRouter.post(
  '/add',
  userAuth,
  route(addToCart, { message: 'Item added to cart successfully' })
);
cartRouter.post(
  '/update',
  userAuth,
  route(updateCart, { message: 'Cart updated successfully' })
);
cartRouter.post('/get', userAuth, route(getUserCart));

export default cartRouter;
