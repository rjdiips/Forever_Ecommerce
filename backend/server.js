import "dotenv/config";
import express from "express";
import cors from "cors";
import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";
import userRouter from "./routes/userRouter.js";
import productRouter from "./routes/productRouter.js";
import cartRouter from "./routes/cartRouter.js";
import orderRouter from "./routes/orderRouter.js";
import subscriberRouter from "./routes/subscriberRouter.js";

// App config
const app = express();
const port = process.env.PORT || 4000;
connectDB();
connectCloudinary();
// Middlewares
app.use(express.json());
app.use(cors());

// API endpoints
app.use("/api/user", userRouter);
app.use("/api/product", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);
app.use("/api/subscribe", subscriberRouter);
app.get("/", (req, res) => {
  res.send("API working");
});

const server = app.listen(port, () =>
  console.log("Server started on port: " + port)
);

server.on("error", (err) => {
  if (err && err.code === "EADDRINUSE") {
    console.error(`Port ${port} is already in use.`);
    console.error("Options:");
    console.error(
      `  - Kill the process using port ${port} (see commands in project README or below).`
    );
    console.error(
      `  - Or start this server on a different port by setting the PORT environment variable (for example: $env:PORT=4001; npm start).`
    );
    process.exit(1);
  }
  console.error("Server error:", err);
});
