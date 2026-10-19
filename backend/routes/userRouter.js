import express from 'express';

import {
  loginUser,
  registerUser,
  adminLogin,
} from '../controllers/userController.js';
import { route } from '../lib/http.js';
import {
  loginRateLimit,
  registerRateLimit,
  adminLoginRateLimit,
} from '../middlewares/rateLimit.js';

const userRouter = express.Router();

// /api/user/login
userRouter.post(
  '/login',
  loginRateLimit,
  route(loginUser, { message: 'User signed in successfully' })
);

// /api/user/register
userRouter.post(
  '/register',
  registerRateLimit,
  route(registerUser, { status: 201, message: 'User created successfully' })
);

// /api/user/admin
userRouter.post(
  '/admin',
  adminLoginRateLimit,
  route(adminLogin, { message: 'Admin signed in successfully' })
);

export default userRouter;
