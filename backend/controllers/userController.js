import UserModel from "../models/userModel.js";
import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { HttpError } from "../lib/http.js";

const createToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET);
};

// Route for user login
export const loginUser = async (req) => {
  const { email, password } = req.body;

  // Check if the user exists
  const user = await UserModel.findOne({ email });

  if (!user) {
    throw new HttpError(400, "User doesn`t exist ");
  }

  // Check if the password is correct
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new HttpError(400, "Invalid email or password");
  }

  const token = createToken(user._id);

  return { token, user };
};

// Route for user registration/sign-up
export const registerUser = async (req) => {
  const { name, email, password } = req.body;

  // Check if the user already exists
  const userExists = await UserModel.findOne({ email });

  if (userExists) {
    throw new HttpError(400, "User already exists");
  }

  // validating email format & strong password
  if (!validator.isEmail(email)) {
    throw new HttpError(400, "Please enter a valid email");
  }

  if (password.length < 6) {
    throw new HttpError(400, "Password should be at least 6 characters");
  }

  // Hashing the password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = new UserModel({
    name,
    email,
    password: hashedPassword,
  });

  const savedUser = await newUser.save();

  const token = createToken(savedUser._id);

  return { user: savedUser, token };
};

// Route for admin login
export const adminLogin = async (req) => {
  const { email, password } = req.body;

  if (
    email !== process.env.ADMIN_EMAIL ||
    password !== process.env.ADMIN_PASSWORD
  ) {
    throw new HttpError(400, "Invalid email or password");
  }

  const token = jwt.sign(email + password, process.env.JWT_SECRET);

  return { token };
};
