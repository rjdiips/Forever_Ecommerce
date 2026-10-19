import express from 'express';

import {
  loginUser,
  registerUser,
  adminLogin,
} from '../controllers/userController.js';
import { route } from '../lib/http.js';

const userRouter = express.Router();

// /api/user/login
userRouter.post(
  '/login',
  route(loginUser, { message: 'User signed in successfully' })
);

// /api/user/register
userRouter.post(
  '/register',
  route(registerUser, { status: 201, message: 'User created successfully' })
);

// /api/user/admin
userRouter.post(
  '/admin',
  route(adminLogin, { message: 'Admin signed in successfully' })
);

export default userRouter;
