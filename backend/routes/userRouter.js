import express from 'express';

import { GENERIC_PASSWORD_RESET_CONFIRMATION } from '@forever/shared';
import {
  loginUser,
  registerUser,
  requestPasswordReset,
  resetPassword,
  adminLogin,
} from '../controllers/userController.js';
import { route } from '../lib/http.js';
import {
  loginRateLimit,
  registerRateLimit,
  forgotPasswordRateLimit,
  resetPasswordRateLimit,
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
    message: GENERIC_PASSWORD_RESET_CONFIRMATION,
  })
);

// /api/user/reset-password
userRouter.post(
  '/reset-password',
  resetPasswordRateLimit,
  route(resetPassword, { message: 'Password reset successfully' })
);

export default userRouter;
