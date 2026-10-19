import { addCartLine, cartLines, cartLineId, setCartLineQuantity } from "@forever/shared";
import { assertDesignUrl } from "../lib/design.js";
import UserModel from "../models/userModel.js";
import { HttpError } from "../lib/http.js";

// The Cart is stored as Cart lines on the user document, so a Custom Tee line
// keeps its design across reloads and devices. Line identity and the legacy
// shape are handled by @forever/shared.

// add products to user cart
export const addToCart = async (req) => {
  const { itemId, size, quantity = 1, design } = req.body;
  const userId = req.userId;

  if (!itemId || !size) {
    throw new HttpError(400, "Please choose a product and a size");
  }

  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new HttpError(400, "Quantity must be a whole number of at least 1");
  }

  if (design !== undefined) {
    assertDesignUrl(design);
  }

  const userData = await UserModel.findById(userId);
  const lines = addCartLine(cartLines(userData?.cartData), {
    productId: String(itemId),
    size,
    quantity,
    ...(design ? { design } : {}),
  });

  await UserModel.findByIdAndUpdate(userId, { cartData: lines });
};

// update user cart
export const updateCart = async (req) => {
  const { itemId, size, quantity, design } = req.body;
  const userId = req.userId;

  if (!itemId || !size) {
    throw new HttpError(400, "Please choose a product and a size");
  }

  if (!Number.isInteger(quantity)) {
    throw new HttpError(400, "Quantity must be a whole number");
  }

  if (design !== undefined) {
    assertDesignUrl(design);
  }

  const userData = await UserModel.findById(userId);
  const id = cartLineId({ productId: String(itemId), size, design });
  const lines = setCartLineQuantity(cartLines(userData?.cartData), id, quantity);

  await UserModel.findByIdAndUpdate(userId, { cartData: lines });
};

// get user cart data
export const getUserCart = async (req) => {
  const userData = await UserModel.findById(req.userId);

  return { cartData: cartLines(userData?.cartData) };
};
