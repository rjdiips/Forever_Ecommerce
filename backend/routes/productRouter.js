import express from "express";
import {
  addProduct,
  removeProduct,
  getSingleProduct,
  getListProducts,
  reorderProducts,
} from "../controllers/productController.js";
import upload from "../middlewares/multer.js";
import { adminAuth } from "../middlewares/adminAuth.js";
import { route } from "../lib/http.js";

const productRouter = express.Router();

// /api/product/list
productRouter.get("/list", route(getListProducts));

// /api/product/add
productRouter.post(
  "/add",
  adminAuth,
  upload.fields([
    { name: "image1", maxCount: 1 },
    { name: "image2", maxCount: 1 },
    { name: "image3", maxCount: 1 },
    { name: "image4", maxCount: 1 },
  ]),
  route(addProduct, { status: 201, message: "Product added successfully" })
);

// /api/product/remove
productRouter.post(
  "/remove",
  adminAuth,
  route(removeProduct, { message: "Product removed successfully" })
);

// /api/product/reorder
productRouter.post(
  "/reorder",
  adminAuth,
  route(reorderProducts, { message: "Product order updated" })
);

// /api/product/single
productRouter.post("/single", route(getSingleProduct));

export default productRouter;
