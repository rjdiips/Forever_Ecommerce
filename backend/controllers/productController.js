import ProductModel from "../models/productModel.js";
import mongoose from "mongoose";
import { uploadImageBuffer } from "../config/cloudinary.js";
import {
  isCategory,
  isSubCategory,
  normalizeProductKind,
} from "@forever/shared";
import { HttpError } from "../lib/http.js";
import { resolveProductColor } from "../lib/product.js";

/**
 * Read the sizes the admin form posts as a JSON array.
 *
 * A malformed value is the caller's error, not a 500.
 *
 * @param {unknown} sizes
 * @returns {string[]}
 */
const parseSizes = (sizes) => {
  let parsed;

  try {
    parsed = JSON.parse(sizes);
  } catch {
    throw new HttpError(400, "Please provide the available sizes");
  }

  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new HttpError(400, "Please provide the available sizes");
  }

  return parsed;
};

export const addProduct = async (req) => {
  const {
    name,
    description,
    price,
    category,
    subCategory,
    sizes,
    bestseller,
  } = req.body;

  // Validate the taxonomy before uploading images, so an unknown category
  // cannot leave orphaned Cloudinary assets behind.
  if (!isCategory(category)) {
    throw new HttpError(400, "Unknown product category");
  }

  if (!isSubCategory(subCategory)) {
    throw new HttpError(400, "Unknown product sub-category");
  }

  const sizeList = parseSizes(sizes);
  const amount = Number(price);

  if (!Number.isFinite(amount) || amount < 0) {
    throw new HttpError(400, "Please enter a valid price");
  }

  // The kind decides whether a colour is required, so resolve both before the
  // upload for the same reason: a refused Tee base must not leave images behind.
  const kind = normalizeProductKind(req.body.kind);
  const color = resolveProductColor(kind, req.body.color);

  // Check if images are availabe in req.files then it`ll store image in image variable
  const files = req.files ?? {};
  const image1 = files.image1 && files.image1[0];
  const image2 = files.image2 && files.image2[0];
  const image3 = files.image3 && files.image3[0];
  const image4 = files.image4 && files.image4[0];

  // Filter out undefined images
  const images = [image1, image2, image3, image4].filter(
    (image) => image !== undefined
  );

  // Check if images are not available then it`ll throw an error
  if (images.length === 0) {
    throw new HttpError(400, "Please upload at least one image");
  }

  const imageUrl = await Promise.all(
    images.map(async (image) => {
      const result = await uploadImageBuffer(image.buffer);
      return result.secure_url;
    })
  );

  const productData = {
    name,
    description,
    price: amount,
    category,
    subCategory,
    sizes: sizeList,
    bestseller: bestseller === "true" ? true : false,
    kind,
    image: imageUrl,
    // Added now, so it sorts after every existing Product (see orderProducts).
    position: Date.now(),
    date: Date.now(),
  };

  // Only a Tee base carries a colour; an ordinary Product must not store one.
  if (color !== null) {
    productData.color = color;
  }

  const product = new ProductModel(productData);
  await product.save();

  return { product };
};

export const getListProducts = async () => {
  const products = await ProductModel.find();

  return { products };
};

export const removeProduct = async (req) => {
  const id = req.body.id;
  const product = await ProductModel.findByIdAndDelete(id);

  if (!product) {
    throw new HttpError(404, "Product not found");
  }
};

export const getSingleProduct = async (req) => {
  const { productId } = req.body;
  const product = await ProductModel.findById(productId);

  if (!product) {
    throw new HttpError(404, "Product not found");
  }

  return { product };
};

/**
 * Persist the catalogue order the admin set: `order` lists Product ids from
 * first to last. Each id becomes that Product's `position`, which lets the
 * storefront and the admin agree on one order instead of relying on whatever
 * order the database happens to return.
 */
export const reorderProducts = async (req) => {
  const { order } = req.body;

  if (!Array.isArray(order) || order.length === 0) {
    throw new HttpError(400, "Provide the products in their new order");
  }

  if (order.some((id) => !mongoose.isValidObjectId(id))) {
    throw new HttpError(400, "Unknown product in the new order");
  }

  await ProductModel.bulkWrite(
    order.map((id, index) => ({
      updateOne: {
        filter: { _id: id },
        update: { $set: { position: index } },
      },
    }))
  );

  return { count: order.length };
};
