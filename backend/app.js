import "dotenv/config";
import express from "express";
import cors from "cors";
import connectDB from "./config/mongodb.js";
import connectToCloudinary from "./config/cloudinary.js";
import requestLogger from "./middlewares/requestLogger.js";
import { route, errorHandler } from "./lib/http.js";
import userRouter from "./routes/userRouter.js";
import productRouter from "./routes/productRouter.js";
import cartRouter from "./routes/cartRouter.js";
import orderRouter from "./routes/orderRouter.js";
import designRouter from "./routes/designRouter.js";
import subscriberRouter from "./routes/subscriberRouter.js";
import { getFrontendUrl } from "./config/frontendUrl.js";

// Fail at startup, not when the first Password reset email is attempted: a
// missing storefront origin would otherwise put `undefined/reset-password` in
// the link the User receives.
getFrontendUrl();

// App config
const app = express();
const port = process.env.PORT || 4000;

// One proxy hop sits in front of the API in deployment, so `req.ip` is the
// real client. Without this every client would share one rate-limit bucket.
app.set("trust proxy", 1);

connectDB();
connectToCloudinary();

// Middlewares
app.use(express.json());
app.use(cors());
app.use(requestLogger);

// API endpoints
app.use("/api/user", userRouter);
app.use("/api/product", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);
app.use("/api/design", designRouter);
app.use("/api/subscribe", subscriberRouter);

app.get("/", route(() => undefined, { message: "API working" }));

// One error path, registered last.
app.use(errorHandler);

// One entry point. On Vercel the platform drives requests through the exported
// app; locally (and under nodemon) we listen ourselves.
if (!process.env.VERCEL) {
  app.listen(port, () => {
    console.log(`Server running on port http://localhost:${port}`);
  });
}

export default app;
