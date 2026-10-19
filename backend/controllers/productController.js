import ProductModel from "../models/productModel.js";
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
