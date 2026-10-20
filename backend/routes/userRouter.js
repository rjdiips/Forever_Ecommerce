import express from 'express';

import {
  loginUser,
  registerUser,
  requestPasswordReset,
  adminLogin,
} from '../controllers/userController.js';
import { route } from '../lib/http.js';
import {
  loginRateLimit,
  registerRateLimit,
  forgotPasswordRateLimit,
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

// /api/user/forgot-password
userRouter.post(
  '/forgot-password',
  forgotPasswordRateLimit,
  route(requestPasswordReset, {
    message:
      'If an account with that email exists, a password reset link has been sent.',
  })
);

export default userRouter;
