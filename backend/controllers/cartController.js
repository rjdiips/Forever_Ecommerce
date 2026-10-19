import UserModel from "../models/userModel.js";

// add products to user cart
export const addToCart = async (req) => {
  const { itemId, size } = req.body;
  const userId = req.userId;

  const userData = await UserModel.findById(userId);
  const cartData = await userData.cartData;

  if (cartData[itemId]) {
    if (cartData[itemId][size]) {
      cartData[itemId][size] += 1;
    } else {
      cartData[itemId][size] = 1;
    }
  } else {
    cartData[itemId] = {};
    cartData[itemId][size] = 1;
  }

  await UserModel.findByIdAndUpdate(userId, { cartData });
};

// update user cart
export const updateCart = async (req) => {
  const { itemId, size, quantity } = req.body;
  const userId = req.userId;

  const userData = await UserModel.findById(userId);
  const cartData = await userData.cartData;

  cartData[itemId][size] = quantity;

  await UserModel.findByIdAndUpdate(userId, { cartData });
};

// get user cart data
export const getUserCart = async (req) => {
  const userData = await UserModel.findById(req.userId);
  const cartData = await userData.cartData;

  return { cartData };
};
