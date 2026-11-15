import express from "express";
import {
  addProduct,
  removeProduct,
  getSingleProduct,
  getListProducts,
  reorderProducts,
} from "../controllers/productController.js";
import { createUpload } from "../middlewares/multer.js";
import { adminAuth } from "../middlewares/adminAuth.js";
import { route } from "../lib/http.js";

const productRouter = express.Router();

// Four photos, 5 MB each, enforced while the body streams.
const productUpload = createUpload({
  maxFileSize: 5 * 1024 * 1024,
  maxFiles: 4,
});

// /api/product/list
productRouter.get("/list", route(getListProducts));

// /api/product/add
productRouter.post(
  "/add",
  adminAuth,
  productUpload.fields([
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
