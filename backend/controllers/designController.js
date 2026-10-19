import mongoose from "mongoose";
import ProductModel from "../models/productModel.js";
import { uploadImageBuffer } from "../config/cloudinary.js";
import { assertDesignTarget, validateDesignUpload } from "../lib/design.js";
import { HttpError } from "../lib/http.js";

// Upload a shopper's design and return its URL --> /api/design/upload
export const uploadDesign = async (req) => {
  validateDesignUpload(req.file);

  const { productId } = req.body;
  const product = mongoose.isValidObjectId(productId)
    ? await ProductModel.findById(productId)
    : null;

  if (!product) {
    throw new HttpError(404, "Product not found");
  }

  assertDesignTarget(product);

  const result = await uploadImageBuffer(req.file.buffer);

  return { url: result.secure_url };
};
