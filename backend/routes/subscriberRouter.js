import express from "express";
import { subscribe } from "../controllers/subscriberController.js";
import { subscribeRateLimit } from "../middlewares/rateLimit.js";
import { route } from "../lib/http.js";

const subscriberRouter = express.Router();

// This route sends a real email to whatever address it is given, so it carries
// the same per-IP bound as the other unauthenticated auth endpoints.
subscriberRouter.post(
  "/",
  subscribeRateLimit,
  route(subscribe, { message: "Subscription successful! Please check your email." })
);

export default subscriberRouter;
