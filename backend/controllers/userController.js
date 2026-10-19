import UserModel from "../models/userModel.js";
import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { HttpError } from "../lib/http.js";
import { signSessionToken } from "../lib/authTokens.js";

const createToken = (user) =>
  signSessionToken(user._id, user.tokenVersion ?? 0);

/**
 * A real bcrypt hash, cost 10, of a password nobody is given.
 *
 * The login handler compares against this when the email is unknown. Without
 * it the unknown-email path returns almost instantly while a wrong password
 * waits for bcrypt, and that timing difference reveals which emails are
 * registered. Comparing against an existing hash costs the same as a real
 * check; hashing the submitted password here would cost far more.
 */
const DUMMY_PASSWORD_HASH =
  "$2b$10$Av7p3BsrWeGXigzWoXK54.gvIXqHZRpX12jycu3ByoCboAmpFFEoW";

/** The one failure message for a bad email, a bad password, or both. */
const INVALID_CREDENTIALS_MESSAGE = "Invalid email or password";

// Route for user login
export const loginUser = async (req) => {
  const { email, password } = req.body;

  // Check if the user exists
  const user = await UserModel.findOne({ email });

  // Always compare, whether or not the User was found, so an unknown email
  // takes about as long as a wrong password. Only a real User's hash can match.
  const submittedPassword = typeof password === "string" ? password : "";
  const isPasswordValid = await bcrypt.compare(
    submittedPassword,
    user?.password ?? DUMMY_PASSWORD_HASH
  );

  if (!user || !isPasswordValid) {
    throw new HttpError(400, INVALID_CREDENTIALS_MESSAGE);
  }

  const token = createToken(user);

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

  const token = createToken(savedUser);

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
