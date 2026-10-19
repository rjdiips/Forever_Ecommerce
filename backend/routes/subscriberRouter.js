import express from "express";
import { subscribe } from "../controllers/subscriberController.js";
import { route } from "../lib/http.js";

const subscriberRouter = express.Router();

subscriberRouter.post(
  "/",
  route(subscribe, { message: "Subscription successful! Please check your email." })
);

export default subscriberRouter;
