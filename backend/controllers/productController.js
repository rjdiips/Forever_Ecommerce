import ProductModel from "../models/productModel.js";
import mongoose from "mongoose";
import { uploadImageBuffer } from "../config/cloudinary.js";
import {
  isCategory,
  isSubCategory,
  normalizeProductKind,
} from "@forever/shared";
import { HttpError } from "../lib/http.js";

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

  // Check if images are availabe in req.files then it`ll store image in image variable
  const image1 = req.files.image1 && req.files.image1[0];
  const image2 = req.files.image2 && req.files.image2[0];
  const image3 = req.files.image3 && req.files.image3[0];
  const image4 = req.files.image4 && req.files.image4[0];

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
    price: Number(price),
    category,
    subCategory,
    sizes: JSON.parse(sizes),
    bestseller: bestseller === "true" ? true : false,
    kind: normalizeProductKind(req.body.kind),
    image: imageUrl,
    // Added now, so it sorts after every existing Product (see orderProducts).
    position: Date.now(),
    date: Date.now(),
  };

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
